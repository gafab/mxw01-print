import express from 'express';
import cors from 'cors';
import multer from 'multer';
import sharp from 'sharp';
import {
  renderText,
  renderQr,
  renderBarcode,
  renderDataMatrix,
  renderImage,
  renderIcons,
} from './render.js';
import * as printer from './printer.js';

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// ─── Printer management ─────────────────────────────────────

app.get('/api/printer/status', (_req, res) => {
  res.json(printer.getStatus());
});

app.post('/api/printer/scan', async (_req, res) => {
  try {
    await printer.scanDevices();
    res.json({ ok: true, message: 'Device scan complete' });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.post('/api/printer/connect', async (_req, res) => {
  try {
    await printer.connect();
    res.json({ ok: true, ...printer.getStatus() });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.post('/api/printer/disconnect', async (_req, res) => {
  try {
    await printer.disconnect();
    res.json({ ok: true, ...printer.getStatus() });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// ─── Helper: render + print ─────────────────────────────────

function extractPrintOpts(body: Record<string, unknown>): printer.PrintOpts {
  return {
    dither: body.dither as printer.DitherMethod | undefined,
    brightness: body.brightness != null ? Number(body.brightness) : undefined,
    intensity: body.intensity != null ? Number(body.intensity) : undefined,
  };
}

// ─── POST /api/print/text ───────────────────────────────────

app.post('/api/print/text', async (req, res) => {
  try {
    const { text, fontSize, fontFamily, bold, italic, align, lineHeight, width, rotation, ...rest } = req.body;
    if (!text) return res.status(400).json({ error: 'text is required' });

    const image = await renderText({ text, fontSize, fontFamily, bold, italic, align, lineHeight, width, rotation });
    await printer.print(image, extractPrintOpts(rest));

    res.json({ ok: true, width: image.width, height: image.height });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// ─── POST /api/print/qr ────────────────────────────────────

app.post('/api/print/qr', async (req, res) => {
  try {
    const {
      type, size, errorLevel, content,
      wifiSsid, wifiPassword, wifiEncryption, wifiHidden,
      emailAddress, emailSubject, emailBody,
      phoneNumber, smsBody,
      vcardName, vcardOrg, vcardPhone, vcardEmail, vcardUrl,
      ...rest
    } = req.body;

    const image = await renderQr({
      type, size, errorLevel, content,
      wifiSsid, wifiPassword, wifiEncryption, wifiHidden,
      emailAddress, emailSubject, emailBody,
      phoneNumber, smsBody,
      vcardName, vcardOrg, vcardPhone, vcardEmail, vcardUrl,
    });
    await printer.print(image, extractPrintOpts(rest));

    res.json({ ok: true, width: image.width, height: image.height });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// ─── POST /api/print/barcode ────────────────────────────────

app.post('/api/print/barcode', async (req, res) => {
  try {
    const { format, content, scaleX, scaleY, includeText, height, ...rest } = req.body;
    if (!content) return res.status(400).json({ error: 'content is required' });

    const image = await renderBarcode({ format, content, scaleX, scaleY, includeText, height });
    await printer.print(image, extractPrintOpts(rest));

    res.json({ ok: true, width: image.width, height: image.height });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// ─── POST /api/print/datamatrix ─────────────────────────────

app.post('/api/print/datamatrix', async (req, res) => {
  try {
    const { content, scale, rectangular, ...rest } = req.body;
    if (!content) return res.status(400).json({ error: 'content is required' });

    const image = await renderDataMatrix({ content, scale, rectangular });
    await printer.print(image, extractPrintOpts(rest));

    res.json({ ok: true, width: image.width, height: image.height });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// ─── POST /api/print/image ──────────────────────────────────

app.post('/api/print/image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'image file is required (multipart field "image")' });

    const params = {
      width: req.body.width != null ? Number(req.body.width) : undefined,
      rotation: req.body.rotation != null ? Number(req.body.rotation) as 0 | 90 | 180 | 270 : undefined,
      invert: req.body.invert === 'true' || req.body.invert === true,
    };

    const image = await renderImage(req.file.buffer, params);
    await printer.print(image, extractPrintOpts(req.body));

    res.json({ ok: true, width: image.width, height: image.height });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// ─── POST /api/print/icon ───────────────────────────────────

app.post('/api/print/icon', async (req, res) => {
  try {
    const { icons, size, columns, spacing, ...rest } = req.body;
    if (!icons?.length) return res.status(400).json({ error: 'icons array is required' });

    const image = await renderIcons({ icons, size, columns, spacing });
    await printer.print(image, extractPrintOpts(rest));

    res.json({ ok: true, width: image.width, height: image.height });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// ─── Render-only endpoints (return PNG, no printing) ────────

app.post('/api/render/text', async (req, res) => {
  try {
    const image = await renderText(req.body);
    await sendPng(res, image);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.post('/api/render/qr', async (req, res) => {
  try {
    const image = await renderQr(req.body);
    await sendPng(res, image);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.post('/api/render/barcode', async (req, res) => {
  try {
    const image = await renderBarcode(req.body);
    await sendPng(res, image);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.post('/api/render/datamatrix', async (req, res) => {
  try {
    const image = await renderDataMatrix(req.body);
    await sendPng(res, image);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.post('/api/render/icon', async (req, res) => {
  try {
    const image = await renderIcons(req.body);
    await sendPng(res, image);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.post('/api/render/image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'image file is required' });
    const params = {
      width: req.body.width != null ? Number(req.body.width) : undefined,
      rotation: req.body.rotation != null ? Number(req.body.rotation) as 0 | 90 | 180 | 270 : undefined,
      invert: req.body.invert === 'true' || req.body.invert === true,
    };
    const image = await renderImage(req.file.buffer, params);
    await sendPng(res, image);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// ─── Helper: send rendered image as PNG ─────────────────────

async function sendPng(res: express.Response, image: { data: Uint8ClampedArray; width: number; height: number }) {
  const pngBuffer = await sharp(Buffer.from(image.data.buffer), {
    raw: { width: image.width, height: image.height, channels: 4 },
  }).png().toBuffer();

  res.set('Content-Type', 'image/png');
  res.send(pngBuffer);
}

// ─── Start ──────────────────────────────────────────────────

const PORT = Number(process.env.PORT) || 9990;

app.listen(PORT, () => {
  console.log(`\n  MXW01 Print API server running on http://localhost:${PORT}\n`);
  console.log('  Endpoints:');
  console.log('    POST /api/print/text        - Print text');
  console.log('    POST /api/print/qr          - Print QR code');
  console.log('    POST /api/print/barcode     - Print barcode');
  console.log('    POST /api/print/datamatrix  - Print Data Matrix');
  console.log('    POST /api/print/image       - Print image (multipart)');
  console.log('    POST /api/print/icon        - Print MDI icons');
  console.log('');
  console.log('    POST /api/render/*           - Same as above but returns PNG (no printing)');
  console.log('');
  console.log('    GET  /api/printer/status     - Printer status');
  console.log('    POST /api/printer/connect    - Connect to printer via BLE');
  console.log('    POST /api/printer/disconnect - Disconnect printer');
  console.log('');
});
