---
sidebar_position: 2
---

# Text Mode

Print formatted text with configurable typography.

## Basic Controls

- **Text area** — Type or paste the text to print
- **Font Size** — Slider from 12px to 72px (default: 24px)
- **Print** — Send to printer

The text is rendered on a 384px wide canvas (matching the printer width) with automatic word wrapping.

## Advanced Controls

Toggle **Show Advanced** to access:

| Control | Options | Default |
|---------|---------|---------|
| Font Family | Sans Serif, Serif, Monospace | Sans Serif |
| Alignment | Left, Center, Right | Left |
| Bold | Toggle | Off |
| Italic | Toggle | Off |
| Line Height | 1.0 - 3.0 | 1.4 |
| Width | 100px - 384px | 384px |
| Dithering | 5 methods | Floyd-Steinberg |
| Brightness | 0-255 | 128 |
| Intensity | 0-255 | 93 |

## How It Works

Text is rendered to an offscreen HTML Canvas using `CanvasRenderingContext2D.fillText()`. The canvas is 384 pixels wide (printer width) with dynamic height calculated from the number of wrapped lines. The resulting `ImageData` is sent to the printer with the chosen dithering and intensity settings.
