---
sidebar_position: 4
---

# Printer Management

These endpoints control the BLE connection to the MXW01 printer from the API server.

## GET /api/printer/status

Returns the current printer connection state.

```bash
curl http://localhost:9990/api/printer/status
```

### Response

```json
{
  "connected": false,
  "printing": false,
  "statusMessage": "Disconnected"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `connected` | boolean | Whether the printer is currently connected |
| `printing` | boolean | Whether a print job is in progress |
| `statusMessage` | string | Human-readable status description |

Possible `statusMessage` values:
- `"Disconnected"` — No printer connected
- `"Connecting..."` — Connection in progress
- `"Connected to <device>"` — Successfully connected
- `"Printing..."` — Print job active
- `"Printing... 45%"` — Print job with progress
- `"Print complete"` — Last job finished successfully
- `"Error: <message>"` — Something went wrong

## POST /api/printer/connect

Initiates a BLE connection to the nearest MXW01 printer.

```bash
curl -X POST http://localhost:9990/api/printer/connect
```

### Response (success)

```json
{
  "ok": true,
  "connected": true,
  "printing": false,
  "statusMessage": "Connected to MXW01"
}
```

### Response (error)

```json
{
  "error": "No compatible device found"
}
```

### Notes

- The server uses `NodeBluetoothAdapter` (via `@stoprocent/noble`) which requires system-level Bluetooth access
- On Linux, you may need to run the server with `sudo` or configure Bluetooth permissions
- Only one printer can be connected at a time
- If already connected, the request returns immediately

## POST /api/printer/disconnect

Disconnects from the currently connected printer.

```bash
curl -X POST http://localhost:9990/api/printer/disconnect
```

### Response

```json
{
  "ok": true,
  "connected": false,
  "printing": false,
  "statusMessage": "Disconnected"
}
```

## Typical Workflow

```bash
# 1. Check status
curl http://localhost:9990/api/printer/status

# 2. Connect
curl -X POST http://localhost:9990/api/printer/connect

# 3. Print something
curl -X POST http://localhost:9990/api/print/text \
  -H "Content-Type: application/json" \
  -d '{"text":"Hello!"}'

# 4. Disconnect when done
curl -X POST http://localhost:9990/api/printer/disconnect
```
