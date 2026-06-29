---
sidebar_position: 3
---

# Render Endpoints

Render endpoints generate content as a **PNG image** without sending it to the printer. They accept the same parameters as their [print counterparts](./print-endpoints) (minus the print options), and return the image directly.

These are useful for:
- Previewing output before printing
- Generating images for other applications
- Using the server as a rendering service without a physical printer

## Endpoints

| Endpoint | Content Type |
|----------|-------------|
| `POST /api/render/text` | Formatted text |
| `POST /api/render/qr` | QR code |
| `POST /api/render/barcode` | 1D/2D barcode |
| `POST /api/render/datamatrix` | Data Matrix code |
| `POST /api/render/image` | Processed image (multipart) |
| `POST /api/render/icon` | Material Design Icons grid |

## Response

All render endpoints return:
- **Content-Type:** `image/png`
- **Body:** Raw PNG image data

Save the output to a file with `curl -o`:

```bash
curl -X POST http://localhost:9990/api/render/text \
  -H "Content-Type: application/json" \
  -d '{"text":"Label #1","fontSize":32,"bold":true}' \
  -o label.png
```

## Examples

### Render a QR code

```bash
curl -X POST http://localhost:9990/api/render/qr \
  -H "Content-Type: application/json" \
  -d '{"type":"url","content":"https://example.com","size":256}' \
  -o qr.png
```

### Render a barcode

```bash
curl -X POST http://localhost:9990/api/render/barcode \
  -H "Content-Type: application/json" \
  -d '{"format":"ean13","content":"5901234123457"}' \
  -o barcode.png
```

### Render a Data Matrix

```bash
curl -X POST http://localhost:9990/api/render/datamatrix \
  -H "Content-Type: application/json" \
  -d '{"content":"PART-12345","scale":8}' \
  -o datamatrix.png
```

### Render icons

```bash
curl -X POST http://localhost:9990/api/render/icon \
  -H "Content-Type: application/json" \
  -d '{"icons":["home","lightbulb","fan","power-plug"],"size":64,"columns":2}' \
  -o icons.png
```

### Process and render an image

```bash
curl -X POST http://localhost:9990/api/render/image \
  -F "image=@photo.jpg" \
  -F "width=200" \
  -F "rotation=90" \
  -o processed.png
```

## Parameter Reference

Render endpoints accept the same content parameters as print endpoints. See [Print Endpoints](./print-endpoints) for full parameter tables. Print-specific options (`dither`, `brightness`, `intensity`) are ignored by render endpoints.
