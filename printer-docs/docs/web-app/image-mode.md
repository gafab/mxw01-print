---
sidebar_position: 3
---

# Image Mode

Print images from your device. Supports PNG, JPG, GIF, and WebP.

## Basic Controls

- **Drop zone** — Drag and drop an image, or click to open a file picker
- **Print** — Send to printer

The image is automatically scaled to fit the 384px printer width while maintaining aspect ratio.

## Advanced Controls

| Control | Options | Default |
|---------|---------|---------|
| Rotation | 0, 90, 180, 270 degrees | 0 |
| Invert | Toggle (swap black/white) | Off |
| Width | 10px - 384px | 384px |
| Dithering | 5 methods | Floyd-Steinberg |
| Brightness | 0-255 | 128 |
| Intensity | 0-255 | 93 |

## Tips

- **Photos** work best with Floyd-Steinberg or Atkinson dithering
- **Line art** and logos look cleanest with Threshold dithering
- Use **Invert** when printing dark images on thermal paper (which prints by darkening)
- Lower the **Width** to print smaller images
