---
sidebar_position: 1
---

# Web App Overview

The web app is a React single-page application that connects to the MXW01 printer via Web Bluetooth.

## Layout

The UI has four sections from top to bottom:

1. **Printer Bar** — Connection status indicator (green/red dot), status message, and Connect/Disconnect button
2. **Mode Tabs** — Switch between Text, Image, Icon, QR, Barcode, and Matrix modes
3. **Mode Content** — Controls and settings for the active mode, with a Basic/Advanced toggle
4. **Print Preview** — Live canvas rendering of what will be printed
5. **Printer Logs** — Collapsible panel showing BLE communication data

## Connecting to the Printer

1. Click **Connect** in the Printer Bar
2. Your browser will show a Bluetooth pairing dialog
3. Select the MXW01 device
4. The status indicator turns green when connected

## Print Options (Advanced)

Every mode has a **Show Advanced** toggle that reveals shared print settings:

| Setting | Range | Default | Description |
|---------|-------|---------|-------------|
| Dithering | dropdown | Floyd-Steinberg | Algorithm for converting grayscale to black/white |
| Brightness | 0-255 | 128 | Image brightness before dithering |
| Intensity | 0-255 | 93 | Thermal head temperature (higher = darker) |

### Dithering Methods

| Method | Best For |
|--------|----------|
| Floyd-Steinberg | Photos, general use |
| Atkinson | Comics, illustrations |
| Bayer | Patterns, textures |
| Threshold | Text, simple graphics |
| Pattern | Special effects |

## Browser Support

| Browser | Supported |
|---------|-----------|
| Chrome 56+ | Yes |
| Edge 79+ | Yes |
| Opera 43+ | Yes |
| Chrome for Android | Yes |
| Firefox | No |
| Safari | No |
