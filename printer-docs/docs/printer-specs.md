---
sidebar_position: 11
---

# Printer Specifications

## MXW01 Thermal Printer

The MXW01 is a compact Bluetooth Low Energy (BLE) thermal printer.

### Hardware Specs

| Spec | Value |
|------|-------|
| Print width | 384 pixels (48mm) |
| Resolution | ~8 dots/mm (203 DPI) |
| Connectivity | Bluetooth Low Energy (BLE) |
| Paper | Standard thermal receipt paper |
| Print method | Direct thermal (no ink needed) |

### BLE Protocol

The printer communicates over BLE using a custom protocol. The `mxw01-thermal-printer` library handles all protocol details.

#### Characteristics

| Characteristic | Direction | Purpose |
|---------------|-----------|---------|
| Control | Write | Send commands (status, intensity, print request, etc.) |
| Data | Write | Send image data chunks |
| Notification | Read (notify) | Receive printer state updates |

#### Command IDs

Commands are sent via the Control characteristic with a packet header `0x22 0x21` followed by a command byte:

| Command | ID | Description |
|---------|-----|-------------|
| GetStatus | `0xA1` | Request current printer state |
| SetIntensity | `0xA2` | Set print burn intensity |
| PrintRequest | `0xA9` | Start a print job |
| PrintComplete | `0xAA` | Signal print job finished |
| FlushData | `0xAD` | Flush data buffer |

#### Printer State Flags

Notifications from the printer include state flags:

| Flag | Meaning |
|------|---------|
| `printing` | Print job in progress |
| `PAPER JAM` | Paper is jammed |
| `OUT OF PAPER` | No paper loaded |
| `COVER OPEN` | Printer cover is open |
| `BATTERY LOW` | Battery needs charging |
| `OVERHEAT` | Printer is too hot, wait before printing |

### Print Process

1. **Connect** — Establish BLE connection to the printer
2. **Set intensity** — Configure burn intensity (0-255)
3. **Send print request** — Declare image dimensions
4. **Send data** — Transmit image data in chunks via the Data characteristic
5. **Flush** — Signal data transfer complete
6. **Print complete** — Finalize the print job

### Tips

- **Intensity** affects darkness and battery life. Default `93` is a good balance.
- **Avoid overheating** — The printer will report `OVERHEAT` if used continuously. Wait for it to cool.
- **Paper width** — Always render content to 384px wide for proper alignment.
- **Dithering** — Since the printer is monochrome (black/white only), images must be dithered. Floyd-Steinberg (`steinberg`) produces the best results for photos.
