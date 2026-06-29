---
sidebar_position: 5
---

# QR Code Mode

Generate and print QR codes for various data types.

## QR Types

Select the type using the pill buttons at the top:

### Text
Free-form text content encoded as a plain QR code.

### URL
A web URL. Enter the full address including `https://`.

### WiFi
Generates a QR code that automatically connects to a WiFi network when scanned.

| Field | Required | Description |
|-------|----------|-------------|
| Network Name (SSID) | Yes | WiFi network name |
| Password | No | Network password |
| Encryption | Yes | WPA/WPA2, WEP, or None |
| Hidden network | No | Check if the network is hidden |

Encoded format: `WIFI:T:WPA;S:MyNetwork;P:password;;`

### Email
Opens an email compose window on the scanner's device.

| Field | Required |
|-------|----------|
| Email Address | Yes |
| Subject | No |
| Body | No |

Encoded as a `mailto:` URI.

### Phone
Opens the phone dialer with the number pre-filled.

### SMS
Opens the SMS app with the number and optional message pre-filled.

### vCard
Creates a contact card that can be saved to the phone's address book.

| Field | Required |
|-------|----------|
| Full Name | Yes |
| Organization | No |
| Phone | No |
| Email | No |
| Website | No |

## Settings

| Setting | Range | Default |
|---------|-------|---------|
| QR Size | 100-384px | 384px |
| Error Correction | L (7%), M (15%), Q (25%), H (30%) | M |

Higher error correction makes the QR code more resilient to damage but increases density.
