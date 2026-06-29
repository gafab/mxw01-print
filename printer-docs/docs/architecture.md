---
sidebar_position: 10
---

# Architecture

## Project Structure

```
mxw01-print/
├── src/                        # Web app (React + Vite)
│   ├── main.tsx                # Entry point
│   ├── index.css               # Tailwind imports
│   ├── App.tsx                 # Root component
│   ├── types.ts                # Shared TypeScript types
│   ├── hooks/
│   │   └── usePrinter.ts      # Printer connection & print hook
│   ├── components/
│   │   ├── PrinterBar.tsx      # Connection status bar
│   │   ├── ModeTabs.tsx        # Mode tab switcher
│   │   ├── PrintPreview.tsx    # Live print preview canvas
│   │   ├── PrinterLogs.tsx     # Collapsible BLE log panel
│   │   ├── AdvancedOptions.tsx # Shared dithering/brightness controls
│   │   ├── TextMode.tsx        # Text printing mode
│   │   ├── ImageMode.tsx       # Image printing mode
│   │   ├── IconMode.tsx        # Icon selector mode
│   │   ├── IconArrange.tsx     # Drag-and-drop icon reordering
│   │   ├── QrMode.tsx          # QR code generation mode
│   │   ├── BarcodeMode.tsx     # Barcode generation mode
│   │   └── DataMatrixMode.tsx  # Data Matrix generation mode
│   └── utils/
│       ├── canvas.ts           # All canvas rendering functions
│       ├── icons.ts            # MDI icon loading and filtering
│       ├── iconSets.ts         # Icon set persistence (localStorage)
│       └── printerLogger.ts    # BLE communication logger
├── server/                     # API server (Express + Node.js)
│   ├── index.ts                # Express routes and startup
│   ├── render.ts               # Server-side rendering (sharp, qrcode, bwip-js)
│   └── printer.ts              # Printer connection singleton
├── docs/                       # Documentation (Docusaurus)
├── vite.config.ts
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.server.json
└── package.json
```

## Web App Architecture

```
┌──────────────────────────────────────────────────┐
│ App.tsx                                          │
│ ┌──────────────────────────────────────────────┐ │
│ │ PrinterBar (connect/disconnect/status)       │ │
│ ├──────────────────────────────────────────────┤ │
│ │ ModeTabs (Text | Image | Icon | QR | ...)    │ │
│ ├──────────────────────────────────────────────┤ │
│ │ Active Mode Component                        │ │
│ │   ├─ Mode-specific controls                  │ │
│ │   ├─ Advanced options (collapsible)          │ │
│ │   └─ Print button                            │ │
│ ├──────────────────────────────────────────────┤ │
│ │ PrintPreview (canvas mirror)                 │ │
│ ├──────────────────────────────────────────────┤ │
│ │ PrinterLogs (collapsible BLE log)            │ │
│ └──────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────┘
```

### Data Flow

1. User changes settings in a mode component
2. Mode component renders content to an **offscreen canvas** (384px wide)
3. `PrintPreview` mirrors the offscreen canvas via `drawImage`
4. On Print, `usePrinter` sends the canvas `ImageData` to the printer library
5. The printer library dithers the image, then sends it over BLE as chunks

### Key Design Decisions

**Canvas as universal format** — All content (text, images, icons, QR codes, barcodes) is rendered to a canvas before printing. This provides a consistent pipeline and accurate preview.

**Adapter wrapping for logging** — `PrinterLogger` wraps the `WebBluetoothAdapter` by creating proxy objects for BLE characteristics. This intercepts all writes and notifications without modifying the printer library.

**Pagination for icons** — The 7000+ MDI icon set uses `IntersectionObserver`-based pagination (100 icons per page) to avoid DOM performance issues.

**localStorage for icon sets** — Saved icon sets persist in the browser without requiring a backend.

## API Server Architecture

```
Request → Express Router → render.ts → sharp/qrcode/bwip-js → PNG
                         → printer.ts → ThermalPrinterClient → BLE → Printer
```

### Server-Side Rendering

The server cannot use HTML Canvas (browser-only). Instead it uses:

| Content | Rendering Approach |
|---------|--------------------|
| Text | SVG with `<text>` elements → `sharp` PNG conversion |
| Icons | SVG with MDI `<path>` elements → `sharp` PNG conversion |
| QR codes | `qrcode` package `toBuffer()` → PNG directly |
| Barcodes | `bwip-js/node` `toBuffer()` → PNG directly |
| Data Matrix | `bwip-js/node` `toBuffer()` → PNG directly |
| Images | `sharp` resize/rotate/negate → raw RGBA |

### Printer Connection

The server maintains a singleton `ThermalPrinterClient` using `NodeBluetoothAdapter`. Only one printer connection is active at a time. The adapter uses `@stoprocent/noble` for system-level BLE access.

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend framework | React 18 + TypeScript |
| Build tool | Vite |
| Styling | Tailwind CSS v4 |
| Printer library | `mxw01-thermal-printer` |
| Browser BLE | Web Bluetooth API via `WebBluetoothAdapter` |
| Server BLE | `@stoprocent/noble` via `NodeBluetoothAdapter` |
| QR generation | `qrcode` |
| Barcode generation | `bwip-js` |
| Server image processing | `sharp` |
| Icons | `@mdi/js` (Material Design Icons) |
| API framework | Express 5 |
| Documentation | Docusaurus |
