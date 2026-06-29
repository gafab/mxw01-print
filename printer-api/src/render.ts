import sharp from 'sharp';
import QRCode from 'qrcode';
import bwipjs from 'bwip-js/node';
import { readFileSync } from 'fs';
import { createRequire } from 'module';

const _require = createRequire(import.meta.url);

const PRINTER_WIDTH = 384;

export interface RenderedImage {
  data: Uint8ClampedArray;
  width: number;
  height: number;
}

// ─── Helpers ────────────────────────────────────────────────

async function pngToImageData(pngBuffer: Buffer): Promise<RenderedImage> {
  const { data, info } = await sharp(pngBuffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  return {
    data: new Uint8ClampedArray(data.buffer, data.byteOffset, data.byteLength),
    width: info.width,
    height: info.height,
  };
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// ─── Text ───────────────────────────────────────────────────

export interface TextParams {
  text: string;
  fontSize?: number;
  fontFamily?: string;
  bold?: boolean;
  italic?: boolean;
  align?: 'left' | 'center' | 'right';
  lineHeight?: number;
  width?: number;
  rotation?: 0 | 90 | 270;
}

export async function renderText(params: TextParams): Promise<RenderedImage> {
  const {
    text,
    fontSize = 24,
    fontFamily = 'sans-serif',
    bold = false,
    italic = false,
    align = 'left',
    lineHeight = 1.4,
    width = PRINTER_WIDTH,
    rotation = 0,
  } = params;

  const padding = 8;
  const lineHeightPx = fontSize * lineHeight;

  // Rough word wrap (approximate, since we can't measure text server-side precisely)
  const charWidth = fontSize * 0.6;
  const maxChars = Math.floor((width - padding * 2) / charWidth);
  const wrappedLines: string[] = [];

  for (const paragraph of text.split('\n')) {
    if (!paragraph) {
      wrappedLines.push('');
      continue;
    }
    const words = paragraph.split(' ');
    let currentLine = '';
    for (const word of words) {
      const test = currentLine ? `${currentLine} ${word}` : word;
      if (test.length > maxChars && currentLine) {
        wrappedLines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = test;
      }
    }
    wrappedLines.push(currentLine);
  }

  const totalHeight = Math.max(
    Math.ceil(wrappedLines.length * lineHeightPx + padding * 2),
    fontSize + padding * 2,
  );

  const fontWeight = bold ? 'bold' : 'normal';
  const fontStyle = italic ? 'italic' : 'normal';
  let textAnchor = 'start';
  let xPos = padding;
  if (align === 'center') { textAnchor = 'middle'; xPos = width / 2; }
  else if (align === 'right') { textAnchor = 'end'; xPos = width - padding; }

  const textElements = wrappedLines
    .map(
      (line, i) =>
        `<text x="${xPos}" y="${padding + i * lineHeightPx + fontSize * 0.85}" ` +
        `font-family="${escapeXml(fontFamily)}" font-size="${fontSize}" ` +
        `font-weight="${fontWeight}" font-style="${fontStyle}" ` +
        `text-anchor="${textAnchor}" fill="#000">${escapeXml(line)}</text>`,
    )
    .join('\n');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${totalHeight}">
  <rect width="100%" height="100%" fill="white"/>
  ${textElements}
</svg>`;

  let pipeline = sharp(Buffer.from(svg)).png();
  if (rotation) {
    pipeline = pipeline.rotate(rotation) as typeof pipeline;
  }
  const pngBuffer = await pipeline.toBuffer();
  return pngToImageData(pngBuffer);
}

// ─── QR Code ────────────────────────────────────────────────

export interface QrParams {
  type?: 'text' | 'url' | 'wifi' | 'email' | 'phone' | 'sms' | 'vcard';
  size?: number;
  errorLevel?: 'L' | 'M' | 'Q' | 'H';
  content?: string;
  wifiSsid?: string;
  wifiPassword?: string;
  wifiEncryption?: 'WPA' | 'WEP' | 'nopass';
  wifiHidden?: boolean;
  emailAddress?: string;
  emailSubject?: string;
  emailBody?: string;
  phoneNumber?: string;
  smsBody?: string;
  vcardName?: string;
  vcardOrg?: string;
  vcardPhone?: string;
  vcardEmail?: string;
  vcardUrl?: string;
}

function buildQrData(p: QrParams): string {
  switch (p.type) {
    case 'url':
    case 'text':
      return p.content ?? '';
    case 'wifi': {
      const hidden = p.wifiHidden ? 'H:true' : '';
      return `WIFI:T:${p.wifiEncryption ?? 'WPA'};S:${p.wifiSsid ?? ''};P:${p.wifiPassword ?? ''};${hidden};`;
    }
    case 'email': {
      const params: string[] = [];
      if (p.emailSubject) params.push(`subject=${encodeURIComponent(p.emailSubject)}`);
      if (p.emailBody) params.push(`body=${encodeURIComponent(p.emailBody)}`);
      const query = params.length > 0 ? `?${params.join('&')}` : '';
      return `mailto:${p.emailAddress ?? ''}${query}`;
    }
    case 'phone':
      return `tel:${p.phoneNumber ?? ''}`;
    case 'sms': {
      const body = p.smsBody ? `?body=${encodeURIComponent(p.smsBody)}` : '';
      return `sms:${p.phoneNumber ?? ''}${body}`;
    }
    case 'vcard': {
      const lines = ['BEGIN:VCARD', 'VERSION:3.0', `FN:${p.vcardName ?? ''}`];
      if (p.vcardOrg) lines.push(`ORG:${p.vcardOrg}`);
      if (p.vcardPhone) lines.push(`TEL:${p.vcardPhone}`);
      if (p.vcardEmail) lines.push(`EMAIL:${p.vcardEmail}`);
      if (p.vcardUrl) lines.push(`URL:${p.vcardUrl}`);
      lines.push('END:VCARD');
      return lines.join('\n');
    }
    default:
      return p.content ?? '';
  }
}

export async function renderQr(params: QrParams): Promise<RenderedImage> {
  const data = buildQrData(params);
  if (!data) throw new Error('No QR data provided');

  const pngBuffer = await QRCode.toBuffer(data, {
    width: params.size ?? PRINTER_WIDTH,
    margin: 2,
    errorCorrectionLevel: params.errorLevel ?? 'M',
    color: { dark: '#000000', light: '#ffffff' },
  });

  return pngToImageData(pngBuffer);
}

// ─── Barcode ────────────────────────────────────────────────

export interface BarcodeParams {
  format?: string;
  content: string;
  scaleX?: number;
  scaleY?: number;
  includeText?: boolean;
  height?: number;
}

export async function renderBarcode(params: BarcodeParams): Promise<RenderedImage> {
  if (!params.content?.trim()) throw new Error('No barcode content provided');

  const bcid = (params.format ?? 'code128') === 'codabar'
    ? 'rationalizedCodabar'
    : (params.format ?? 'code128');

  const pngBuffer = await bwipjs.toBuffer({
    bcid,
    text: params.content,
    scaleX: params.scaleX ?? 3,
    scaleY: params.scaleY ?? 3,
    height: params.height ?? 15,
    includetext: params.includeText ?? true,
    textxalign: 'center',
    backgroundcolor: 'ffffff',
  });

  return pngToImageData(pngBuffer);
}

// ─── Data Matrix ────────────────────────────────────────────

export interface DataMatrixParams {
  content: string;
  scale?: number;
  rectangular?: boolean;
}

export async function renderDataMatrix(params: DataMatrixParams): Promise<RenderedImage> {
  if (!params.content?.trim()) throw new Error('No Data Matrix content provided');

  const pngBuffer = await bwipjs.toBuffer({
    bcid: params.rectangular ? 'datamatrixrectangular' : 'datamatrix',
    text: params.content,
    scale: params.scale ?? 4,
    backgroundcolor: 'ffffff',
  });

  return pngToImageData(pngBuffer);
}

// ─── Image ──────────────────────────────────────────────────

export interface ImageParams {
  width?: number;
  rotation?: 0 | 90 | 180 | 270;
  invert?: boolean;
}

export async function renderImage(
  imageBuffer: Buffer,
  params: ImageParams,
): Promise<RenderedImage> {
  const targetWidth = params.width ?? PRINTER_WIDTH;

  let pipeline = sharp(imageBuffer).resize({ width: targetWidth });

  if (params.rotation) {
    pipeline = pipeline.rotate(params.rotation);
  }

  if (params.invert) {
    pipeline = pipeline.negate({ alpha: false });
  }

  pipeline = pipeline.flatten({ background: '#ffffff' }).ensureAlpha().raw();

  const { data, info } = await pipeline.toBuffer({ resolveWithObject: true });

  return {
    data: new Uint8ClampedArray(data.buffer, data.byteOffset, data.byteLength),
    width: info.width,
    height: info.height,
  };
}

// ─── Icons ──────────────────────────────────────────────────

export interface IconParams {
  icons: string[];
  size?: number;
  columns?: number;
  spacing?: number;
}

type IconEntry = { name: string; path?: string; svgInline?: string };

function loadFlagSvg(code: string): string | undefined {
  try {
    const flagPath = _require.resolve(`flag-icons/flags/4x3/${code}.svg`);
    return readFileSync(flagPath, 'utf-8');
  } catch {
    return undefined;
  }
}

export async function renderIcons(params: IconParams): Promise<RenderedImage> {
  if (!params.icons?.length) throw new Error('No icons provided');

  const mdiModule = await import('@mdi/js');
  const entries: IconEntry[] = [];

  for (const iconName of params.icons) {
    // Flag: "flag:us", "flag:gb", etc.
    if (iconName.startsWith('flag:')) {
      const code = iconName.slice(5).toLowerCase();
      const svg = loadFlagSvg(code);
      if (svg) entries.push({ name: iconName, svgInline: svg });
      continue;
    }

    // MDI icon — accept camelCase or readable name
    let svgPath: string | undefined;

    if (iconName in mdiModule) {
      svgPath = (mdiModule as unknown as Record<string, string>)[iconName];
    }

    if (!svgPath) {
      const camel = 'mdi' + iconName
        .split(/[\s-]+/)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join('');
      if (camel in mdiModule) {
        svgPath = (mdiModule as unknown as Record<string, string>)[camel];
      }
    }

    if (svgPath) {
      entries.push({ name: iconName, path: svgPath });
    }
  }

  if (entries.length === 0) throw new Error('No valid icons found');

  const size = params.size ?? 32;
  const columns = params.columns ?? 4;
  const spacing = params.spacing ?? 16;

  const cellSize = size + spacing;
  const rows = Math.ceil(entries.length / columns);
  const totalWidth = Math.min(columns * cellSize + spacing, PRINTER_WIDTH);
  const totalHeight = rows * cellSize + spacing;

  const iconPaths = entries
    .map((icon, index) => {
      const col = index % columns;
      const row = Math.floor(index / columns);
      const x = col * cellSize + spacing;
      const y = row * cellSize + spacing;

      if (icon.svgInline) {
        // Embed flag SVG scaled to cell — flags are 4:3 so compute height
        const flagH = Math.round(size * (3 / 4));
        const yOffset = Math.round((size - flagH) / 2);
        const encoded = encodeURIComponent(icon.svgInline);
        return `<image href="data:image/svg+xml,${encoded}" x="${x}" y="${y + yOffset}" width="${size}" height="${flagH}"/>`;
      }

      const scale = size / 24;
      return `<g transform="translate(${x},${y}) scale(${scale})"><path d="${icon.path}" fill="#000"/></g>`;
    })
    .join('\n');

  // Cutting guides
  const guides: string[] = [];
  for (let row = 0; row <= rows; row++) {
    const y = row * cellSize + spacing / 2;
    guides.push(
      `<line x1="0" y1="${y}" x2="${totalWidth}" y2="${y}" stroke="#ccc" stroke-width="0.5" stroke-dasharray="3,3"/>`,
    );
  }
  for (let col = 0; col <= columns; col++) {
    const x = col * cellSize + spacing / 2;
    guides.push(
      `<line x1="${x}" y1="0" x2="${x}" y2="${totalHeight}" stroke="#ccc" stroke-width="0.5" stroke-dasharray="3,3"/>`,
    );
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="${totalHeight}">
  <rect width="100%" height="100%" fill="white"/>
  ${guides.join('\n')}
  ${iconPaths}
</svg>`;

  const pngBuffer = await sharp(Buffer.from(svg)).png().toBuffer();
  return pngToImageData(pngBuffer);
}
