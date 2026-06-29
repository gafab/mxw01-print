---
sidebar_position: 2
---

# Installation

## Prerequisites

- **Node.js** 18 or later
- **npm** 9 or later
- A Bluetooth-capable device (for printing)

## Setup

```bash
git clone <your-repo-url>
cd mxw01-print
npm install
```

## Running the Web App

```bash
npm run dev
```

Opens at `http://localhost:5173`. Use Chrome or Edge for Web Bluetooth support.

## Running the API Server

```bash
npm run server
```

Starts at `http://localhost:9990`. Set `PORT` env var to change:

```bash
PORT=8080 npm run server
```

## Production Build

```bash
npm run build
npm run preview   # Preview the production build locally
```

The built files are output to `dist/`.

## BLE on the Server (Optional)

To use `POST /api/printer/connect` for server-side printing, install the Noble BLE library:

```bash
npm install @stoprocent/noble
```

### Platform Notes

| Platform | Requirements |
|----------|-------------|
| **Windows** | Windows 10+, Bluetooth 4.0+ adapter |
| **Linux** | BlueZ 5.x, `libbluetooth-dev` |
| **macOS** | macOS 10.12+, built-in BLE |

Without Noble installed, the render-only endpoints (`/api/render/*`) still work.

## Running the Docs

```bash
cd docs
npm install
npm start
```

Opens the documentation wiki at `http://localhost:3000`.
