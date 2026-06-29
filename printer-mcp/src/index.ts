#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

const API_BASE = process.env.PRINTER_API_URL ?? 'http://localhost:9990';

// ─── Helpers ────────────────────────────────────────────────

async function postJson(path: string, body: Record<string, unknown>) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const json = await res.json() as Record<string, unknown>;
  return { ok: res.ok, json };
}

function printResult(ok: boolean, json: Record<string, unknown>) {
  if (!ok || !json['ok']) {
    return {
      content: [{ type: 'text' as const, text: `Failed: ${json['error'] ?? 'Unknown error'}` }],
      isError: true,
    };
  }
  const dims = json['width'] && json['height'] ? ` (${json['width']}x${json['height']}px)` : '';
  return {
    content: [{ type: 'text' as const, text: `Printed successfully!${dims}` }],
  };
}

function statusResult(ok: boolean, json: Record<string, unknown>) {
  if (!ok) {
    return {
      content: [{ type: 'text' as const, text: `Failed: ${json['error'] ?? 'Unknown error'}` }],
      isError: true,
    };
  }
  return {
    content: [{ type: 'text' as const, text: JSON.stringify(json, null, 2) }],
  };
}

// ─── Shared param schemas ────────────────────────────────────

const printOpts = {
  dither: z.enum(['threshold', 'steinberg', 'bayer', 'atkinson', 'pattern']).optional().describe('Dithering method (default: steinberg)'),
  brightness: z.number().min(0).max(255).optional().describe('Brightness 0-255 (default: 128)'),
  intensity: z.number().min(0).max(255).optional().describe('Print intensity/burn duration 0-255 (default: 93)'),
};

// ─── MCP Server ─────────────────────────────────────────────

const server = new McpServer({
  name: 'mxw01-printer',
  version: '1.0.0',
});

// ── print_text ───────────────────────────────────────────────

server.tool(
  'print_text',
  'Print text on the MXW01 thermal printer via Bluetooth. Connects automatically if not already connected.',
  {
    text: z.string().describe('The text to print'),
    fontSize: z.number().min(8).max(72).optional().describe('Font size in pixels (default: 24)'),
    fontFamily: z.enum(['sans-serif', 'serif', 'monospace']).optional().describe('Font family (default: sans-serif)'),
    bold: z.boolean().optional().describe('Bold text (default: false)'),
    italic: z.boolean().optional().describe('Italic text (default: false)'),
    align: z.enum(['left', 'center', 'right']).optional().describe('Text alignment (default: left)'),
    lineHeight: z.number().optional().describe('Line height multiplier (default: 1.4)'),
    width: z.number().optional().describe('Canvas width in pixels (default: 384)'),
    ...printOpts,
  },
  async (params) => {
    try {
      const { ok, json } = await postJson('/api/print/text', params as Record<string, unknown>);
      return printResult(ok, json);
    } catch (e) {
      return { content: [{ type: 'text' as const, text: `Print failed: ${(e as Error).message}` }], isError: true };
    }
  },
);

// ── print_qr ────────────────────────────────────────────────

server.tool(
  'print_qr',
  'Print a QR code on the thermal printer. Supports text, URL, WiFi, email, phone, SMS, and vCard types.',
  {
    type: z.enum(['text', 'url', 'wifi', 'email', 'phone', 'sms', 'vcard']).optional().describe('QR code type (default: text)'),
    size: z.number().optional().describe('QR code size in pixels (default: 384)'),
    errorLevel: z.enum(['L', 'M', 'Q', 'H']).optional().describe('Error correction level (default: M)'),
    content: z.string().optional().describe('Content for text/url types'),
    wifiSsid: z.string().optional().describe('WiFi SSID (for wifi type)'),
    wifiPassword: z.string().optional().describe('WiFi password (for wifi type)'),
    wifiEncryption: z.enum(['WPA', 'WEP', 'nopass']).optional().describe('WiFi encryption (for wifi type, default: WPA)'),
    wifiHidden: z.boolean().optional().describe('Hidden network (for wifi type)'),
    emailAddress: z.string().optional().describe('Email address (for email type)'),
    emailSubject: z.string().optional().describe('Email subject (for email type)'),
    emailBody: z.string().optional().describe('Email body (for email type)'),
    phoneNumber: z.string().optional().describe('Phone number (for phone/sms types)'),
    smsBody: z.string().optional().describe('SMS body (for sms type)'),
    vcardName: z.string().optional().describe('Full name (for vcard type)'),
    vcardOrg: z.string().optional().describe('Organization (for vcard type)'),
    vcardPhone: z.string().optional().describe('Phone (for vcard type)'),
    vcardEmail: z.string().optional().describe('Email (for vcard type)'),
    vcardUrl: z.string().optional().describe('URL (for vcard type)'),
    ...printOpts,
  },
  async (params) => {
    try {
      const { ok, json } = await postJson('/api/print/qr', params as Record<string, unknown>);
      return printResult(ok, json);
    } catch (e) {
      return { content: [{ type: 'text' as const, text: `Print failed: ${(e as Error).message}` }], isError: true };
    }
  },
);

// ── print_barcode ────────────────────────────────────────────

server.tool(
  'print_barcode',
  'Print a barcode on the thermal printer. Supports code128, code39, ean13, ean8, upca, upce, itf, codabar, and more.',
  {
    content: z.string().describe('Barcode content'),
    format: z.string().optional().describe('Barcode format (default: code128). E.g. code128, code39, ean13, ean8, upca, upce, itf, codabar'),
    scaleX: z.number().optional().describe('Horizontal scale (default: 3)'),
    scaleY: z.number().optional().describe('Vertical scale (default: 3)'),
    includeText: z.boolean().optional().describe('Show text below barcode (default: true)'),
    height: z.number().optional().describe('Barcode height in mm (default: 15)'),
    ...printOpts,
  },
  async (params) => {
    try {
      const { ok, json } = await postJson('/api/print/barcode', params as Record<string, unknown>);
      return printResult(ok, json);
    } catch (e) {
      return { content: [{ type: 'text' as const, text: `Print failed: ${(e as Error).message}` }], isError: true };
    }
  },
);

// ── print_datamatrix ─────────────────────────────────────────

server.tool(
  'print_datamatrix',
  'Print a Data Matrix 2D barcode on the thermal printer.',
  {
    content: z.string().describe('Data Matrix content'),
    scale: z.number().optional().describe('Scale factor (default: 4)'),
    rectangular: z.boolean().optional().describe('Use rectangular Data Matrix format (default: false)'),
    ...printOpts,
  },
  async (params) => {
    try {
      const { ok, json } = await postJson('/api/print/datamatrix', params as Record<string, unknown>);
      return printResult(ok, json);
    } catch (e) {
      return { content: [{ type: 'text' as const, text: `Print failed: ${(e as Error).message}` }], isError: true };
    }
  },
);

// ── print_icon ───────────────────────────────────────────────

server.tool(
  'print_icon',
  'Print Material Design Icons (MDI) on the thermal printer. Pass icon names like "account", "home", "printer", etc.',
  {
    icons: z.array(z.string()).describe('List of MDI icon names (e.g. ["account", "home", "printer"])'),
    size: z.number().optional().describe('Icon size in pixels (default: 32)'),
    columns: z.number().optional().describe('Number of columns (default: 4)'),
    spacing: z.number().optional().describe('Spacing between icons in pixels (default: 16)'),
    ...printOpts,
  },
  async (params) => {
    try {
      const { ok, json } = await postJson('/api/print/icon', params as Record<string, unknown>);
      return printResult(ok, json);
    } catch (e) {
      return { content: [{ type: 'text' as const, text: `Print failed: ${(e as Error).message}` }], isError: true };
    }
  },
);

// ── printer_status ───────────────────────────────────────────

server.tool(
  'printer_status',
  'Get the current status of the thermal printer (connected, printing, status message).',
  {},
  async () => {
    try {
      const res = await fetch(`${API_BASE}/api/printer/status`);
      const json = await res.json() as Record<string, unknown>;
      return statusResult(res.ok, json);
    } catch (e) {
      return { content: [{ type: 'text' as const, text: `Failed: ${(e as Error).message}` }], isError: true };
    }
  },
);

// ── printer_connect ──────────────────────────────────────────

server.tool(
  'printer_connect',
  'Connect to the MXW01 thermal printer via Bluetooth BLE.',
  {},
  async () => {
    try {
      const { ok, json } = await postJson('/api/printer/connect', {});
      return statusResult(ok, json);
    } catch (e) {
      return { content: [{ type: 'text' as const, text: `Failed: ${(e as Error).message}` }], isError: true };
    }
  },
);

// ── printer_disconnect ───────────────────────────────────────

server.tool(
  'printer_disconnect',
  'Disconnect from the MXW01 thermal printer.',
  {},
  async () => {
    try {
      const { ok, json } = await postJson('/api/printer/disconnect', {});
      return statusResult(ok, json);
    } catch (e) {
      return { content: [{ type: 'text' as const, text: `Failed: ${(e as Error).message}` }], isError: true };
    }
  },
);

// ─── Start ──────────────────────────────────────────────────

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error(`[printer-mcp] MCP server started on stdio (API: ${API_BASE})`);
}

main().catch((err) => {
  console.error('[printer-mcp] Fatal error:', err);
  process.exit(1);
});
