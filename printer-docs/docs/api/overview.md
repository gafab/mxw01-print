---
sidebar_position: 1
---

# REST API Overview

The MXW01 Print API server provides HTTP endpoints for rendering and printing all content types without a browser. It runs on Node.js with Express.

## Starting the Server

```bash
npm run server
```

The server starts on port **9990** by default. Set the `PORT` environment variable to change it:

```bash
PORT=8080 npm run server
```

## Endpoint Pattern

Every content type has two endpoint variants:

| Prefix | Behavior |
|--------|----------|
| `POST /api/print/*` | Renders the content **and** sends it to the connected printer |
| `POST /api/render/*` | Renders the content and returns a **PNG image** (no printer needed) |

Available content types: `text`, `qr`, `barcode`, `datamatrix`, `image`, `icon`

## Authentication

The API has no authentication. It is intended for local or trusted network use.

## Request Format

- All endpoints except `/api/*/image` accept **JSON** (`Content-Type: application/json`)
- Image endpoints accept **multipart/form-data** with a `image` field (max 10 MB)
- Print endpoints accept optional `dither`, `brightness`, and `intensity` fields alongside content parameters

## Response Format

### Print endpoints

```json
{ "ok": true, "width": 384, "height": 256 }
```

### Render endpoints

Returns a **PNG image** (`Content-Type: image/png`).

### Errors

```json
{ "error": "description of what went wrong" }
```

Status codes: `400` for bad input, `500` for server/printer errors.

## Quick Example

```bash
# Render a QR code as PNG (no printer needed)
curl -X POST http://localhost:9990/api/render/qr \
  -H "Content-Type: application/json" \
  -d '{"type":"text","content":"Hello World"}' \
  -o qr.png

# Print text (printer must be connected first)
curl -X POST http://localhost:9990/api/printer/connect
curl -X POST http://localhost:9990/api/print/text \
  -H "Content-Type: application/json" \
  -d '{"text":"Hello from the API!"}'
```
