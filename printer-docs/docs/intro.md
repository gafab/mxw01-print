---
slug: /
sidebar_position: 1
---

# Introduction

**MXW01 Print** is a web application and REST API for the MXW01 thermal printer. It lets you print text, images, QR codes, barcodes, Data Matrix codes, and Material Design Icons from your browser or through HTTP requests.

## Features

- **6 print modes** — Text, Image, Icon, QR, Barcode, Data Matrix
- **Web Bluetooth** — Connect directly from Chrome/Edge, no drivers needed
- **REST API** — Print from any language or tool via HTTP POST
- **Render-only mode** — Generate PNGs without a printer attached
- **7000+ icons** — Full Material Design Icons library with search and presets
- **Live preview** — See exactly what will print before sending
- **Printer logs** — Inspect raw BLE data for debugging

## How It Works

```
┌─────────────┐     Web Bluetooth      ┌─────────────┐
│  Browser UI  │ ◄────────────────────► │  MXW01      │
│  (React)     │                        │  Printer    │
└─────────────┘                         └─────────────┘

┌─────────────┐     Node.js BLE         ┌─────────────┐
│  API Server  │ ◄────────────────────► │  MXW01      │
│  (Express)   │                        │  Printer    │
└─────────────┘
```

The **web app** uses the Web Bluetooth API to communicate directly with the printer from the browser. The **API server** uses Node.js BLE (via `@stoprocent/noble`) for server-side printing, plus `sharp`, `qrcode`, and `bwip-js` for image rendering.

## Quick Start

```bash
npm install

# Web app
npm run dev

# API server
npm run server
```
