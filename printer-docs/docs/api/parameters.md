---
sidebar_position: 5
---

# Parameter Reference

## Print Options

These optional parameters can be added to any `POST /api/print/*` request to control how the image is processed for thermal printing.

| Parameter | Type | Default | Range | Description |
|-----------|------|---------|-------|-------------|
| `dither` | string | `"steinberg"` | See below | Dithering algorithm |
| `brightness` | number | 128 | 0-255 | Image brightness adjustment |
| `intensity` | number | 93 | 0-255 | Print burn intensity (darkness) |

### Dithering Methods

| Value | Algorithm | Best For |
|-------|-----------|----------|
| `"steinberg"` | Floyd-Steinberg | Photos, gradients (default) |
| `"bayer"` | Ordered (Bayer matrix) | Patterns, textures |
| `"atkinson"` | Atkinson | High-contrast images |
| `"threshold"` | Simple threshold | Text, line art |
| `"pattern"` | Pattern-based | Retro/halftone look |

### Brightness

Controls the brightness threshold before dithering. `0` = darkest, `255` = lightest. The default `128` is neutral.

### Intensity

Controls how long each dot is heated during printing. Higher values = darker print but slower and more battery usage. The default `93` balances quality and speed.

## Content Parameters by Type

### Text

| Parameter | Type | Default |
|-----------|------|---------|
| `text` | string | *required* |
| `fontSize` | number | 24 |
| `fontFamily` | string | `"sans-serif"` |
| `bold` | boolean | false |
| `italic` | boolean | false |
| `align` | `"left"` \| `"center"` \| `"right"` | `"left"` |
| `lineHeight` | number | 1.4 |
| `width` | number | 384 |

### QR Code

| Parameter | Type | Default |
|-----------|------|---------|
| `type` | `"text"` \| `"url"` \| `"wifi"` \| `"email"` \| `"phone"` \| `"sms"` \| `"vcard"` | `"text"` |
| `content` | string | — |
| `size` | number | 384 |
| `errorLevel` | `"L"` \| `"M"` \| `"Q"` \| `"H"` | `"M"` |

Type-specific fields: see [Print Endpoints](./print-endpoints#post-apiprintqr).

### Barcode

| Parameter | Type | Default |
|-----------|------|---------|
| `content` | string | *required* |
| `format` | string | `"code128"` |
| `scaleX` | number | 3 |
| `scaleY` | number | 3 |
| `height` | number | 15 |
| `includeText` | boolean | true |

Supported formats: `code128`, `code39`, `code93`, `ean13`, `ean8`, `upca`, `upce`, `itf14`, `interleaved2of5`, `codabar`, `pdf417`

### Data Matrix

| Parameter | Type | Default |
|-----------|------|---------|
| `content` | string | *required* |
| `scale` | number | 4 |
| `rectangular` | boolean | false |

### Image

Sent as `multipart/form-data`.

| Parameter | Type | Default |
|-----------|------|---------|
| `image` | file | *required* |
| `width` | number | 384 |
| `rotation` | `0` \| `90` \| `180` \| `270` | 0 |
| `invert` | boolean | false |

### Icons

| Parameter | Type | Default |
|-----------|------|---------|
| `icons` | string[] | *required* |
| `size` | number | 32 |
| `columns` | number | 4 |
| `spacing` | number | 16 |

Icon names can be provided as readable names (e.g., `"home"`, `"lightbulb"`) or as `@mdi/js` export names (e.g., `"mdiHome"`, `"mdiLightbulb"`).
