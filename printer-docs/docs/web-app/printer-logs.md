---
sidebar_position: 8
---

# Printer Logs

The collapsible Printer Logs panel at the bottom of the app shows all communication with the printer in real time.

## Opening the Panel

Click the **Printer Logs** bar to expand it. A badge shows the total number of log entries. Click **Clear** to reset.

## Log Entry Format

Each entry shows:

| Field | Description |
|-------|-------------|
| Timestamp | `HH:MM:SS.mmm` format |
| Direction | `sent` (blue), `received` (green), or `event` (gray) |
| Channel | Which BLE characteristic or subsystem |
| Message | Human-readable description |
| Data | Raw hex bytes (for BLE data) |

## What Gets Logged

### Events (gray)
- Connection requested/established/failed
- Disconnect requested
- Print started (with image dimensions and options)
- Print complete/failed
- BLE notification start/stop

### Sent Data (blue)
- Control characteristic writes with command identification:
  - `GetStatus` (0xA1)
  - `SetIntensity` (0xA2)
  - `PrintRequest` (0xA9)
  - `FlushData` (0xAD)
  - `PrintComplete` (0xAA)
- Data characteristic writes (image data chunks)
- Raw hex dump of each write

### Received Data (green)
- Notification characteristic updates
- Printer state changes with decoded flags: `printing`, `PAPER JAM`, `OUT OF PAPER`, `COVER OPEN`, `BATTERY LOW`, `OVERHEAT`
- Raw hex dump of notifications

## Auto-Scroll

The log panel auto-scrolls to the latest entry. Scrolling up disables auto-scroll; scrolling back to the bottom re-enables it.

## How It Works

A `LoggingAdapter` wraps the `WebBluetoothAdapter` and intercepts all BLE characteristic writes and notification events. The MXW01 protocol uses a packet format starting with header bytes `0x22 0x21`, followed by a command ID, which the logger decodes into human-readable names.
