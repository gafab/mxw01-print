import { createRequire } from 'module';
import { type ThermalPrinterClient as ThermalPrinterClientType } from 'mxw01-thermal-printer';
import type { RenderedImage } from './render.js';

// The mxw01-thermal-printer ESM bundle calls bare require("@stoprocent/noble") internally,
// which is undefined in ESM context. We load the CJS bundle via createRequire instead.
const cjsRequire = createRequire(import.meta.url);
const { ThermalPrinterClient, NodeBluetoothAdapter } = cjsRequire('mxw01-thermal-printer');
const noble = cjsRequire('@stoprocent/noble');

export type DitherMethod = 'threshold' | 'steinberg' | 'bayer' | 'atkinson' | 'pattern';

export interface PrintOpts {
  dither?: DitherMethod;
  brightness?: number;
  intensity?: number;
}

let client: ThermalPrinterClientType | null = null;
let connected = false;
let printing = false;
let statusMessage = 'Disconnected';

function getClient(): ThermalPrinterClientType {
  if (!client) {
    const adapter = new NodeBluetoothAdapter();
    const c: ThermalPrinterClientType = new ThermalPrinterClient(adapter);

    c.on('connected', (event) => {
      connected = true;
      statusMessage = `Connected to ${event.device?.name ?? event.device?.id ?? 'device'}`;
      console.log(`[printer] ${statusMessage}`);
    });

    c.on('disconnected', () => {
      connected = false;
      statusMessage = 'Disconnected';
      console.log('[printer] Disconnected');
    });

    c.on('error', (event) => {
      statusMessage = `Error: ${event.error?.message ?? 'Unknown'}`;
      console.error(`[printer] ${statusMessage}`);
    });

    c.on('printProgress', (event) => {
      statusMessage = `Printing... ${Math.round(event.progress)}%`;
    });

    // Initialize noble if not already ready
    if (noble.state === 'unknown' || noble.state === 'resetting') {
      console.log('[printer] Waiting for Bluetooth to be ready...');
    }

    client = c;
  }
  return client;
}

export function getStatus() {
  return { connected, printing, statusMessage };
}

export async function scanDevices(): Promise<void> {
  return new Promise((resolve) => {
    const scannedDevices: Set<string> = new Set();
    const timeout = setTimeout(() => {
      noble.stopScanning();
      console.log('[scanner] Scan complete');
      resolve();
    }, 600000); // Scan for 10 minutes

    console.log('[scanner] Starting BLE device scan...');

    noble.on('discover', (peripheral: { id: string; address?: string; advertisement?: { localName?: string }; rssi: number }) => {
      const key = peripheral.id;
      if (!scannedDevices.has(key)) {
      scannedDevices.add(key);
      const name = peripheral.advertisement?.localName || 'Unknown';
      const rssi = peripheral.rssi;
      const mac = peripheral.address || peripheral.id;
      console.log(`[scanner] Found: ${name} (MAC: ${mac}, ID: ${peripheral.id}, RSSI: ${rssi})`);
      }
    });

    noble.startScanning([], true);
  });
}

const TARGET_MAC = '48:0f:57:23:01:0b';

export async function connect(): Promise<void> {
  const c = getClient();
  if (c.isConnected) return;
  statusMessage = 'Connecting...';
  
  try {
    console.log(`[printer] Current Bluetooth state: ${noble.state}`);
    
    // Wait for Bluetooth to be powered on
    if (noble.state !== 'poweredOn') {
      console.log('[printer] Waiting for Bluetooth to power on...');
      await new Promise((resolve) => {
        const stateChangeHandler = (state: string) => {
          console.log(`[printer] Bluetooth state changed to: ${state}`);
          if (state === 'poweredOn') {
            noble.removeListener('stateChange', stateChangeHandler);
            resolve(undefined);
          }
        };
        noble.on('stateChange', stateChangeHandler);
      });
    }

    console.log(`[printer] Scanning for device with MAC: ${TARGET_MAC}...`);
    
    const targetDevice = await new Promise((resolve, reject) => {
      const scanTimeout = setTimeout(() => {
        noble.stopScanning();
        reject(new Error(`Device with MAC ${TARGET_MAC} not found during scan`));
      }, 10000); // 10 second scan timeout

      noble.on('discover', (peripheral: { id: string; address?: string; advertisement?: { localName?: string }; rssi: number }) => {
        const mac = peripheral.address || peripheral.id;
        const name = peripheral.advertisement?.localName || 'Unknown';
        console.log(`[printer] Discovered: ${name} (MAC: ${mac})`);
        if (mac.toLowerCase() === TARGET_MAC.toLowerCase()) {
          clearTimeout(scanTimeout);
          noble.stopScanning();
          console.log(`[printer] Found target device: ${name} (MAC: ${mac})`);
          resolve(peripheral);
        }
      });

      noble.startScanning([], true);
    });

    console.log('[printer] Attempting to connect to target device...');
    await c.connect();
  } catch (err) {
    console.error(`[printer] Connection failed: ${(err as Error).message}`);
    throw err;
  }
}

export async function disconnect(): Promise<void> {
  if (!client) return;
  await client.disconnect();
}

export async function print(image: RenderedImage, opts: PrintOpts = {}): Promise<void> {
  const c = getClient();
  if (!c.isConnected) {
    throw new Error('Printer not connected. POST /api/printer/connect first.');
  }
  if (printing) {
    throw new Error('A print job is already in progress');
  }

  try {
    printing = true;
    statusMessage = 'Printing...';

    await c.print(
      { data: image.data, width: image.width, height: image.height },
      {
        dither: opts.dither ?? 'steinberg',
        brightness: opts.brightness ?? 128,
        intensity: opts.intensity ?? 93,
      },
    );

    statusMessage = 'Print complete';
  } finally {
    printing = false;
  }
}
