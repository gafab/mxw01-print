---
sidebar_position: 7
---

# Data Matrix Mode

Generate and print Data Matrix 2D codes. Data Matrix is a compact 2D barcode format widely used in electronics, healthcare, and logistics.

## When to Use Data Matrix

- **Small items** — Data Matrix can encode data in a very small area
- **Industrial marking** — Common on PCBs, medical devices, aerospace parts
- **Serial numbers** — Compact way to encode identifiers
- **Regulatory compliance** — Required for FDA UDI, GS1 standards

## Controls

| Setting | Range | Default | Description |
|---------|-------|---------|-------------|
| Content | text | *required* | Data to encode (up to ~2,335 alphanumeric chars) |
| Scale | 1-10x | 4x | Module size multiplier |
| Rectangular | Toggle | Off | Use rectangular instead of square shape |

## Square vs. Rectangular

- **Square** (default) — Standard Data Matrix format, best scanner compatibility
- **Rectangular** — More compact horizontally, useful for narrow labels

## Comparison with QR Code

| Feature | Data Matrix | QR Code |
|---------|-------------|---------|
| Shape | Square or rectangular | Square only |
| Max capacity | ~2,335 alphanumeric | ~4,296 alphanumeric |
| Error correction | Built-in ECC 200 | Configurable L/M/Q/H |
| Min size | Very small | Moderate |
| Common use | Industrial, healthcare | Consumer, marketing |
