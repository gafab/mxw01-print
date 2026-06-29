---
sidebar_position: 6
---

# Barcode Mode

Generate and print 1D and 2D barcodes in 11 formats.

## Supported Formats

| Format | Input | Use Case |
|--------|-------|----------|
| **Code 128** | Any ASCII | General purpose, shipping labels |
| **Code 39** | A-Z, 0-9, special chars | Industrial, military |
| **Code 93** | Full ASCII | Compact alternative to Code 39 |
| **EAN-13** | 12-13 digits | International retail products |
| **EAN-8** | 7-8 digits | Small retail products |
| **UPC-A** | 11-12 digits | North American retail |
| **UPC-E** | 6-8 digits | Compact UPC for small items |
| **ITF-14** | 13-14 digits | Shipping containers |
| **Interleaved 2 of 5** | Even number of digits | Warehouse, distribution |
| **Codabar** | 0-9, special chars | Libraries, blood banks |
| **PDF417** | Any text | 2D stacked barcode, IDs, transport |

A hint below the format selector shows which characters are valid for the selected format.

## Settings

| Setting | Range | Default | Description |
|---------|-------|---------|-------------|
| Scale X | 1-6 | 3 | Horizontal bar width multiplier |
| Scale Y | 1-6 | 3 | Vertical bar width multiplier |
| Bar Height | 5-40mm | 15mm | Height of the barcode bars |
| Show text | Toggle | On | Display the encoded value below the barcode |

## Tips

- Use **Code 128** for general-purpose barcodes (most versatile)
- Use **EAN-13** or **UPC-A** for product labeling
- Increase **Scale X** for better scanner readability
- **PDF417** is a 2D stacked barcode that can encode more data
