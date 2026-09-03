# MXW01 Print

Web app and REST API for the MXW01 thermal printer. Supports printing text, images, QR codes, barcodes, Data Matrix codes, and Material Design Icons via Web Bluetooth (browser) or Node.js BLE (server).

## Project Structure

```
mxw01-print/
├── printer-ui/       # React + Vite frontend
├── printer-api/      # Express REST API server
├── printer-docs/     # Docusaurus documentation
└── postman/          # Postman collection
```

## Quick Start

```bash
# Install all projects
npm run install:all

# Or install individually
npm run install:ui
npm run install:api
npm run install:docs
```

### Development

```bash
# Web app — http://localhost:5173
npm run dev:ui

# API server — http://localhost:9990
npm run dev:api
```
### Production Build

```bash
npm run build:ui      # Builds to printer-ui/dist/
npm run build:api     # TypeScript check
```

## Print Modes

| Mode | Description |
|------|-------------|
| **Text** | Configurable font, size, weight, alignment, line height |
| **Image** | Drag & drop upload with rotation, invert, resize |
| **Icon** | 7000+ Material Design Icons with search, multi-select, grid layout, cutting guides |
| **QR** | Text, URL, WiFi, Email, Phone, SMS, vCard |
| **Barcode** | Code 128, Code 39, EAN-13, EAN-8, UPC-A, UPC-E, ITF-14, Interleaved 2/5, Code 93, Codabar, PDF417 |
| **Data Matrix** | Square or rectangular, configurable scale |

## Web App Features

- **Web Bluetooth** connection to MXW01 printer directly from the browser
- **Live preview** of print output with dithering applied
- **Basic/Advanced** toggle per mode (dithering, brightness, intensity)
- **Icon sets** saved to localStorage for quick access
- **Drag & drop** icon reordering in the arrangement preview
- **Printer logs** collapsible panel showing BLE data sent/received with hex dump

## REST API

The API server runs on port 9990 (configurable via `PORT` env var).

### Print Endpoints

Render content and send to the printer. Require a connected printer (`POST /api/printer/connect`).

```bash
# Text
curl -X POST http://localhost:9990/api/print/text \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello World", "fontSize": 32, "bold": true}'

# QR Code
curl -X POST http://localhost:9990/api/print/qr \
  -H "Content-Type: application/json" \
  -d '{"type": "wifi", "wifiSsid": "MyNetwork", "wifiPassword": "secret", "wifiEncryption": "WPA"}'

# Barcode
curl -X POST http://localhost:9990/api/print/barcode \
  -H "Content-Type: application/json" \
  -d '{"format": "code128", "content": "ABC-123"}'

# Data Matrix
curl -X POST http://localhost:9990/api/print/datamatrix \
  -H "Content-Type: application/json" \
  -d '{"content": "SERIAL-001", "scale": 6}'

# Image (multipart)
curl -X POST http://localhost:9990/api/print/image \
  -F "image=@photo.png" -F "width=384" -F "invert=false"

# Icons
curl -X POST http://localhost:9990/api/print/icon \
  -H "Content-Type: application/json" \
  -d '{"icons": ["home", "lightbulb", "fan"], "size": 48, "columns": 3}'
```

### Render-Only Endpoints

Same parameters as print endpoints but return a **PNG image** instead of printing. No printer connection required.

```bash
curl -X POST http://localhost:9990/api/render/barcode \
  -H "Content-Type: application/json" \
  -d '{"format": "ean13", "content": "5901234123457"}' \
  -o barcode.png
```

### Printer Management

```bash
GET  /api/printer/status       # Connection status
POST /api/printer/connect      # Connect via BLE
POST /api/printer/disconnect   # Disconnect
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS v4 |
| Server | Express 5, Sharp, tsx |
| Codes | qrcode, bwip-js (100+ barcode symbologies) |
| Icons | @mdi/js (7000+ Material Design Icons) |
| Printer | mxw01-thermal-printer (Web Bluetooth / Node.js BLE) |
| Docs | Docusaurus |

## License

ISC
