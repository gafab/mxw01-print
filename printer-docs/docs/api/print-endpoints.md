---
sidebar_position: 2
---

# Print Endpoints

Print endpoints render content and send it directly to the connected printer. The printer must be connected first via `POST /api/printer/connect`.

All print endpoints accept optional [print parameters](./parameters) (`dither`, `brightness`, `intensity`) alongside content-specific fields.

## POST /api/print/text

Print formatted text.

```bash
curl -X POST http://localhost:9990/api/print/text \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Hello World!",
    "fontSize": 32,
    "bold": true,
    "align": "center"
  }'
```

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `text` | string | *required* | Text to print |
| `fontSize` | number | 24 | Font size in pixels |
| `fontFamily` | string | `"sans-serif"` | CSS font family |
| `bold` | boolean | false | Bold text |
| `italic` | boolean | false | Italic text |
| `align` | `"left"` \| `"center"` \| `"right"` | `"left"` | Text alignment |
| `lineHeight` | number | 1.4 | Line height multiplier |
| `width` | number | 384 | Canvas width in pixels |

## POST /api/print/qr

Print a QR code. The `type` field determines which data fields are used.

```bash
curl -X POST http://localhost:9990/api/print/qr \
  -H "Content-Type: application/json" \
  -d '{"type":"url","content":"https://example.com"}'
```

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `type` | string | `"text"` | QR type: `text`, `url`, `wifi`, `email`, `phone`, `sms`, `vcard` |
| `content` | string | — | Content for `text` and `url` types |
| `size` | number | 384 | QR code size in pixels |
| `errorLevel` | `"L"` \| `"M"` \| `"Q"` \| `"H"` | `"M"` | Error correction level |

**WiFi fields:** `wifiSsid`, `wifiPassword`, `wifiEncryption` (`"WPA"`, `"WEP"`, `"nopass"`), `wifiHidden`

**Email fields:** `emailAddress`, `emailSubject`, `emailBody`

**Phone/SMS fields:** `phoneNumber`, `smsBody`

**vCard fields:** `vcardName`, `vcardOrg`, `vcardPhone`, `vcardEmail`, `vcardUrl`

### WiFi Example

```bash
curl -X POST http://localhost:9990/api/print/qr \
  -H "Content-Type: application/json" \
  -d '{
    "type": "wifi",
    "wifiSsid": "MyNetwork",
    "wifiPassword": "secret123",
    "wifiEncryption": "WPA"
  }'
```

## POST /api/print/barcode

Print a 1D or 2D barcode.

```bash
curl -X POST http://localhost:9990/api/print/barcode \
  -H "Content-Type: application/json" \
  -d '{"format":"code128","content":"ABC-12345"}'
```

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `content` | string | *required* | Data to encode |
| `format` | string | `"code128"` | Barcode format (see [Barcode Mode](../web-app/barcode-mode) for all formats) |
| `scaleX` | number | 3 | Horizontal scale |
| `scaleY` | number | 3 | Vertical scale |
| `height` | number | 15 | Bar height in mm |
| `includeText` | boolean | true | Show encoded value below barcode |

## POST /api/print/datamatrix

Print a Data Matrix 2D code.

```bash
curl -X POST http://localhost:9990/api/print/datamatrix \
  -H "Content-Type: application/json" \
  -d '{"content":"SN-2024-0001","scale":6}'
```

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `content` | string | *required* | Data to encode |
| `scale` | number | 4 | Module size multiplier |
| `rectangular` | boolean | false | Use rectangular format |

## POST /api/print/image

Print an uploaded image. Uses `multipart/form-data`.

```bash
curl -X POST http://localhost:9990/api/print/image \
  -F "image=@photo.png" \
  -F "width=384" \
  -F "rotation=0"
```

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `image` | file | *required* | Image file (PNG, JPEG, etc.) up to 10 MB |
| `width` | number | 384 | Resize width in pixels |
| `rotation` | `0` \| `90` \| `180` \| `270` | 0 | Rotation in degrees |
| `invert` | boolean | false | Invert colors |

## POST /api/print/icon

Print Material Design Icons in a grid.

```bash
curl -X POST http://localhost:9990/api/print/icon \
  -H "Content-Type: application/json" \
  -d '{
    "icons": ["home", "lightbulb", "power-plug", "fan"],
    "size": 48,
    "columns": 4,
    "spacing": 16
  }'
```

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `icons` | string[] | *required* | Icon names (readable like `"home"` or export names like `"mdiHome"`) |
| `size` | number | 32 | Icon size in pixels |
| `columns` | number | 4 | Icons per row |
| `spacing` | number | 16 | Gap between icons in pixels |
