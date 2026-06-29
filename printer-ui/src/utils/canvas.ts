import QRCode from 'qrcode';
import bwipjs from 'bwip-js/browser';
import katex from 'katex';
import * as htmlToImage from 'html-to-image';
import type { TextOptions, ImageOptions, IconOptions, IconEntry, QrOptions, BarcodeOptions, DataMatrixOptions, LatexOptions, ReceiptOptions, DividerStyle } from '../types';
import { PRINTER_WIDTH } from '../types';

export function renderTextToCanvas(options: TextOptions): HTMLCanvasElement {
  const { text, fontSize, fontFamily, bold, italic, align, lineHeight, width, padding, rotation } = options;
  const canvas = document.createElement('canvas');
  canvas.width = width;

  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
  const fontStyle = `${italic ? 'italic ' : ''}${bold ? 'bold ' : ''}${fontSize}px ${fontFamily}`;
  ctx.font = fontStyle;

  const maxWidth = width - padding * 2;
  const lines = wrapText(ctx, text, maxWidth);
  const lineHeightPx = fontSize * lineHeight;
  const totalHeight = Math.max(lines.length * lineHeightPx + padding * 2, fontSize + padding * 2);

  canvas.height = totalHeight;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#000000';
  ctx.font = fontStyle;
  ctx.textAlign = align;
  ctx.textBaseline = 'top';

  let x = padding;
  if (align === 'center') x = width / 2;
  else if (align === 'right') x = width - padding;

  lines.forEach((line, i) => {
    ctx.fillText(line, x, padding + i * lineHeightPx);
  });

  if (!rotation) return canvas;

  // Rotate the canvas 90° or 270°
  const rotated = document.createElement('canvas');
  rotated.width = canvas.height;
  rotated.height = canvas.width;
  const rctx = rotated.getContext('2d', { willReadFrequently: true })!;
  rctx.fillStyle = '#ffffff';
  rctx.fillRect(0, 0, rotated.width, rotated.height);
  rctx.translate(rotated.width / 2, rotated.height / 2);
  rctx.rotate((rotation * Math.PI) / 180);
  rctx.drawImage(canvas, -canvas.width / 2, -canvas.height / 2);
  return rotated;
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  if (!text) return [''];
  const paragraphs = text.split('\n');
  const lines: string[] = [];

  for (const paragraph of paragraphs) {
    if (paragraph === '') {
      lines.push('');
      continue;
    }
    const words = paragraph.split(' ');
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    lines.push(currentLine);
  }

  return lines;
}

export function renderImageToCanvas(
  img: HTMLImageElement,
  options: ImageOptions,
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  const pad = options.padding;
  const targetWidth = options.width - pad * 2;
  const scale = targetWidth / img.naturalWidth;
  const scaledW = targetWidth;
  const scaledH = Math.round(img.naturalHeight * scale);

  const rotated = options.rotation === 90 || options.rotation === 270;

  // When rotated 90°/270° the output dimensions swap
  canvas.width = (rotated ? scaledH : scaledW) + pad * 2;
  canvas.height = (rotated ? scaledW : scaledH) + pad * 2;

  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate((options.rotation * Math.PI) / 180);
  ctx.drawImage(img, -scaledW / 2, -scaledH / 2, scaledW, scaledH);
  ctx.restore();

  if (options.invert) {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      data[i] = 255 - data[i];
      data[i + 1] = 255 - data[i + 1];
      data[i + 2] = 255 - data[i + 2];
    }
    ctx.putImageData(imageData, 0, 0);
  }

  return canvas;
}

export async function renderIconsToCanvas(options: IconOptions): Promise<HTMLCanvasElement> {
  const { selectedIcons, size, columns, spacing } = options;
  const canvas = document.createElement('canvas');

  if (selectedIcons.length === 0) {
    canvas.width = PRINTER_WIDTH;
    canvas.height = 1;
    return canvas;
  }

  const cellSize = size + spacing;
  const rows = Math.ceil(selectedIcons.length / columns);
  const totalWidth = columns * cellSize + spacing;
  const totalHeight = rows * cellSize + spacing;

  canvas.width = Math.min(totalWidth, PRINTER_WIDTH);
  canvas.height = totalHeight;

  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw cutting guides (dotted lines)
  ctx.strokeStyle = '#cccccc';
  ctx.setLineDash([3, 3]);
  ctx.lineWidth = 0.5;

  for (let row = 0; row <= rows; row++) {
    const y = row * cellSize + spacing / 2;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }

  for (let col = 0; col <= columns; col++) {
    const x = col * cellSize + spacing / 2;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }

  ctx.setLineDash([]);

  // Draw icons
  await Promise.all(
    selectedIcons.map(async (icon, index) => {
      const col = index % columns;
      const row = Math.floor(index / columns);
      const x = col * cellSize + spacing;
      const y = row * cellSize + spacing;

      if (icon.svg) {
        await drawFlagIcon(ctx, icon.svg, x, y, size);
      } else {
        drawMdiIcon(ctx, icon, x, y, size);
      }
    }),
  );

  return canvas;
}

function drawMdiIcon(
  ctx: CanvasRenderingContext2D,
  icon: IconEntry,
  x: number,
  y: number,
  size: number,
) {
  ctx.save();
  ctx.translate(x, y);

  // MDI icons use a 24x24 viewBox
  const scale = size / 24;
  ctx.scale(scale, scale);

  ctx.fillStyle = '#000000';
  const path2D = new Path2D(icon.path);
  ctx.fill(path2D);

  ctx.restore();
}

async function drawFlagIcon(
  ctx: CanvasRenderingContext2D,
  svgString: string,
  x: number,
  y: number,
  size: number,
) {
  const blob = new Blob([svgString], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = reject;
      el.src = url;
    });
    // Flags are 4:3 — fit width, centre vertically
    const w = size;
    const h = Math.round(size * (3 / 4));
    const yOffset = Math.round((size - h) / 2);
    ctx.drawImage(img, x, y + yOffset, w, h);
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function buildQrData(options: QrOptions): string {
  switch (options.type) {
    case 'url':
    case 'text':
      return options.content;
    case 'wifi': {
      const hidden = options.wifiHidden ? 'H:true' : '';
      return `WIFI:T:${options.wifiEncryption};S:${options.wifiSsid};P:${options.wifiPassword};${hidden};`;
    }
    case 'email': {
      const params: string[] = [];
      if (options.emailSubject) params.push(`subject=${encodeURIComponent(options.emailSubject)}`);
      if (options.emailBody) params.push(`body=${encodeURIComponent(options.emailBody)}`);
      const query = params.length > 0 ? `?${params.join('&')}` : '';
      return `mailto:${options.emailAddress}${query}`;
    }
    case 'phone':
      return `tel:${options.phoneNumber}`;
    case 'sms': {
      const body = options.smsBody ? `?body=${encodeURIComponent(options.smsBody)}` : '';
      return `sms:${options.phoneNumber}${body}`;
    }
    case 'vcard': {
      const lines = [
        'BEGIN:VCARD',
        'VERSION:3.0',
        `FN:${options.vcardName}`,
      ];
      if (options.vcardOrg) lines.push(`ORG:${options.vcardOrg}`);
      if (options.vcardPhone) lines.push(`TEL:${options.vcardPhone}`);
      if (options.vcardEmail) lines.push(`EMAIL:${options.vcardEmail}`);
      if (options.vcardUrl) lines.push(`URL:${options.vcardUrl}`);
      lines.push('END:VCARD');
      return lines.join('\n');
    }
    default:
      return options.content;
  }
}

export async function renderQrToCanvas(options: QrOptions): Promise<HTMLCanvasElement> {
  const data = buildQrData(options);
  if (!data) {
    const canvas = document.createElement('canvas');
    canvas.width = PRINTER_WIDTH;
    canvas.height = 1;
    return canvas;
  }

  const canvas = document.createElement('canvas');
  await QRCode.toCanvas(canvas, data, {
    width: options.size,
    margin: options.margin,
    errorCorrectionLevel: options.errorLevel,
    color: { dark: '#000000', light: '#ffffff' },
  });

  return canvas;
}

function emptyCanvas(): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = PRINTER_WIDTH;
  canvas.height = 1;
  return canvas;
}

export function renderBarcodeToCanvas(options: BarcodeOptions): HTMLCanvasElement {
  if (!options.content.trim()) return emptyCanvas();

  const canvas = document.createElement('canvas');

  const bcid = options.format === 'codabar' ? 'rationalizedCodabar' : options.format;

  bwipjs.toCanvas(canvas, {
    bcid,
    text: options.content,
    scaleX: options.scaleX,
    scaleY: options.scaleY,
    height: options.height,
    includetext: options.includeText,
    textxalign: 'center',
    backgroundcolor: 'ffffff',
  });

  return canvas;
}

export function renderDataMatrixToCanvas(options: DataMatrixOptions): HTMLCanvasElement {
  if (!options.content.trim()) return emptyCanvas();

  const canvas = document.createElement('canvas');

  bwipjs.toCanvas(canvas, {
    bcid: options.rectangular ? 'datamatrixrectangular' : 'datamatrix',
    text: options.content,
    scale: options.scale,
    backgroundcolor: 'ffffff',
  });

  return canvas;
}

export async function renderLatexToCanvas(options: LatexOptions): Promise<HTMLCanvasElement> {
  const { latex, fontSize, displayMode, align, padding } = options;

  if (!latex.trim()) return emptyCanvas();

  let html: string;
  try {
    html = katex.renderToString(latex, {
      displayMode,
      throwOnError: false,
      output: 'html',
    });
  } catch {
    return emptyCanvas();
  }

  // Use position:relative (not fixed) so html-to-image's foreignObject renders
  // the element at the SVG origin. An off-screen wrapper hides it from the user.
  const container = document.createElement('div');
  container.style.cssText = 'position:fixed;top:0;left:-99999px;overflow:visible;';

  const host = document.createElement('div');
  host.style.cssText = [
    'position:relative',
    `width:${PRINTER_WIDTH}px`,
    `font-size:${fontSize}px`,
    `padding:${padding}px`,
    'box-sizing:border-box',
    'background:white',
    'color:black',
    `text-align:${align}`,
    'line-height:normal',
  ].join(';');
  host.innerHTML = html;
  container.appendChild(host);
  document.body.appendChild(container);

  try {
    // Wait for web fonts to load and for two layout frames to settle.
    await document.fonts.ready;

    const canvasHeight = Math.max(Math.ceil(host.getBoundingClientRect().height), fontSize + padding * 2);

    // Use html-to-image to render via foreignObject SVG — this delegates all
    // layout to the browser engine, correctly handling KaTeX vlists, stretchy
    // delimiters, vertical-align, and other complex CSS that the previous
    // manual node-by-node approach mis-positioned.
    const dataUrl = await htmlToImage.toPng(host, {
      width: PRINTER_WIDTH,
      height: canvasHeight,
      pixelRatio: 1,
      backgroundColor: '#ffffff',
    });

    const canvas = document.createElement('canvas');
    canvas.width = PRINTER_WIDTH;
    canvas.height = canvasHeight;
    const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const img = new Image();
    img.src = dataUrl;
    await new Promise<void>((resolve, reject) => {
      img.onload = () => { ctx.drawImage(img, 0, 0); resolve(); };
      img.onerror = () => reject(new Error('img load failed'));
    });

    return canvas;
  } catch (err) {
    console.error('[renderLatexToCanvas] failed:', err);
    return emptyCanvas();
  } finally {
    document.body.removeChild(container);
  }
}

export function renderReceiptToCanvas(options: ReceiptOptions): HTMLCanvasElement {
  const W = PRINTER_WIDTH;
  const PAD = 8;
  const LINE_H = 20;
  const SECTION_GAP = 4;
  const TITLE_FONT = 'bold 18px sans-serif';
  const BODY_FONT = '14px monospace';
  const TOTAL_FONT = 'bold 16px monospace';

  // Pre-render barcode if needed so we know its height
  let barcodeCanvas: HTMLCanvasElement | null = null;
  if (options.showBarcode && options.receiptNumber.trim()) {
    try {
      barcodeCanvas = document.createElement('canvas');
      bwipjs.toCanvas(barcodeCanvas, {
        bcid: 'code128',
        text: options.receiptNumber,
        scaleX: 2,
        scaleY: 2,
        height: 10,
        includetext: true,
        textxalign: 'center',
        backgroundcolor: 'ffffff',
      });
    } catch {
      barcodeCanvas = null;
    }
  }

  // Financial totals
  const subtotal = options.items.reduce((sum, item) => sum + item.qty * item.price, 0);
  const taxAmount = subtotal * (options.taxRate / 100);
  const total = subtotal + taxAmount - options.discount;
  const change = Math.max(0, options.amountTendered - total);
  const fmt = (n: number) => `${options.currencySymbol}${Math.abs(n).toFixed(2)}`;

  // Height calculation
  let h = PAD;
  h += 24 + SECTION_GAP; // title
  if (options.subtitle) h += LINE_H;
  if (options.showDateTime) h += LINE_H;
  h += SECTION_GAP;
  h += LINE_H; // divider
  h += options.items.length * LINE_H;
  h += LINE_H; // divider
  h += LINE_H; // subtotal
  if (options.taxRate > 0) h += LINE_H;
  if (options.discount > 0) h += LINE_H;
  h += LINE_H; // divider
  h += LINE_H + 4; // TOTAL
  h += LINE_H; // divider
  h += LINE_H; // payment
  if (options.amountTendered > 0) h += LINE_H; // change
  h += LINE_H; // divider
  if (options.footerText) h += LINE_H + SECTION_GAP;
  if (barcodeCanvas) h += SECTION_GAP + barcodeCanvas.height + SECTION_GAP;
  h += PAD;

  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = h;
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, W, h);
  ctx.fillStyle = '#000000';

  const getDividerStr = (): string => {
    ctx.font = BODY_FONT;
    const charMap: Record<DividerStyle, string> = {
      dashed: '- ',
      solid: '\u2500',
      double: '\u2550',
    };
    const char = charMap[options.dividerStyle];
    const charW = ctx.measureText(char).width;
    const count = Math.floor((W - PAD * 2) / charW);
    return char.repeat(count);
  };

  const drawCenter = (text: string, y: number, font: string) => {
    ctx.font = font;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(text, W / 2, y);
  };

  const drawRow = (left: string, right: string, y: number, font = BODY_FONT) => {
    ctx.font = font;
    ctx.textBaseline = 'top';
    ctx.textAlign = 'left';
    ctx.fillText(left, PAD, y);
    ctx.textAlign = 'right';
    ctx.fillText(right, W - PAD, y);
  };

  const drawDivider = (y: number) => {
    ctx.font = BODY_FONT;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(getDividerStr(), PAD, y);
  };

  const truncateName = (name: string, rightStr: string): string => {
    ctx.font = BODY_FONT;
    const rightW = ctx.measureText(rightStr).width + PAD + 4;
    const maxW = W - PAD * 2 - rightW;
    if (ctx.measureText(name).width <= maxW) return name;
    let t = name;
    while (t.length > 0 && ctx.measureText(t + '\u2026').width > maxW) {
      t = t.slice(0, -1);
    }
    return t + '\u2026';
  };

  let y = PAD;

  drawCenter(options.title || 'RECEIPT', y, TITLE_FONT);
  y += 24 + SECTION_GAP;

  if (options.subtitle) {
    drawCenter(options.subtitle, y, BODY_FONT);
    y += LINE_H;
  }

  if (options.showDateTime) {
    const now = new Date();
    const dateStr =
      now.toLocaleDateString('en-GB') +
      '  ' +
      now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    drawCenter(dateStr, y, BODY_FONT);
    y += LINE_H;
  }

  y += SECTION_GAP;
  drawDivider(y);
  y += LINE_H;

  for (const item of options.items) {
    const itemTotal = item.qty * item.price;
    const rightStr = `${item.qty} x ${fmt(item.price)}  ${fmt(itemTotal)}`;
    drawRow(truncateName(item.name, rightStr), rightStr, y);
    y += LINE_H;
  }

  drawDivider(y);
  y += LINE_H;

  drawRow('Subtotal:', fmt(subtotal), y);
  y += LINE_H;

  if (options.taxRate > 0) {
    drawRow(`Tax (${options.taxRate}%):`, fmt(taxAmount), y);
    y += LINE_H;
  }

  if (options.discount > 0) {
    drawRow('Discount:', `-${fmt(options.discount)}`, y);
    y += LINE_H;
  }

  drawDivider(y);
  y += LINE_H;

  drawRow('TOTAL:', fmt(total), y, TOTAL_FONT);
  y += LINE_H + 4;

  drawDivider(y);
  y += LINE_H;

  const payAmount = options.amountTendered > 0 ? options.amountTendered : total;
  drawRow(`Payment: ${options.paymentMethod}`, fmt(payAmount), y);
  y += LINE_H;

  if (options.amountTendered > 0) {
    drawRow('Change:', fmt(change), y);
    y += LINE_H;
  }

  drawDivider(y);
  y += LINE_H;

  if (options.footerText) {
    drawCenter(options.footerText, y, BODY_FONT);
    y += LINE_H + SECTION_GAP;
  }

  if (barcodeCanvas) {
    y += SECTION_GAP;
    const bx = Math.max(0, Math.round((W - barcodeCanvas.width) / 2));
    ctx.drawImage(barcodeCanvas, bx, y);
  }

  return canvas;
}
