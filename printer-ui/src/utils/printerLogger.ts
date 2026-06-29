import type { BluetoothAdapter, BluetoothCharacteristic } from 'mxw01-thermal-printer';

export type LogDirection = 'sent' | 'received' | 'event';

export interface PrinterLogEntry {
  id: number;
  timestamp: number;
  direction: LogDirection;
  channel: string;
  message: string;
  data?: string;
}

type LogListener = (entry: PrinterLogEntry) => void;

let nextId = 0;

const COMMAND_NAMES: Record<number, string> = {
  0xa1: 'GetStatus',
  0xa2: 'SetIntensity',
  0xa9: 'PrintRequest',
  0xad: 'FlushData',
  0xaa: 'PrintComplete',
};

function formatBytes(data: ArrayBuffer | DataView | Uint8Array, maxBytes = 64): string {
  let bytes: Uint8Array;
  if (data instanceof Uint8Array) {
    bytes = data;
  } else if (data instanceof DataView) {
    bytes = new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
  } else {
    bytes = new Uint8Array(data);
  }

  const hex = Array.from(bytes.slice(0, maxBytes))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join(' ');

  return bytes.length > maxBytes ? `${hex} ... (${bytes.length} bytes)` : hex;
}

function parseCommandName(data: ArrayBuffer | DataView | Uint8Array): string | null {
  let bytes: Uint8Array;
  if (data instanceof Uint8Array) {
    bytes = data;
  } else if (data instanceof DataView) {
    bytes = new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
  } else {
    bytes = new Uint8Array(data);
  }

  // Protocol: [0x22, 0x21, CMD_ID, ...]
  if (bytes.length >= 3 && bytes[0] === 0x22 && bytes[1] === 0x21) {
    return COMMAND_NAMES[bytes[2]] ?? `Unknown(0x${bytes[2].toString(16)})`;
  }
  return null;
}

export class PrinterLogger {
  private listeners: Set<LogListener> = new Set();

  subscribe(listener: LogListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  log(direction: LogDirection, channel: string, message: string, data?: string) {
    const entry: PrinterLogEntry = {
      id: nextId++,
      timestamp: Date.now(),
      direction,
      channel,
      message,
      data,
    };
    this.listeners.forEach((fn) => fn(entry));
  }

  wrapAdapter(adapter: BluetoothAdapter): BluetoothAdapter {
    const logger = this;

    return {
      requestDevice: () => adapter.requestDevice(),
      isAvailable: () => adapter.isAvailable(),
      connect: async (device) => {
        logger.log('event', 'adapter', `Connecting to ${device.name ?? device.id}...`);
        const conn = await adapter.connect(device);
        logger.log('event', 'adapter', 'BLE connection established');

        return {
          ...conn,
          controlCharacteristic: logger.wrapCharacteristic(conn.controlCharacteristic, 'control'),
          dataCharacteristic: logger.wrapCharacteristic(conn.dataCharacteristic, 'data'),
          notifyCharacteristic: logger.wrapCharacteristic(conn.notifyCharacteristic, 'notify'),
        };
      },
    };
  }

  private wrapCharacteristic(char: BluetoothCharacteristic, name: string): BluetoothCharacteristic {
    const logger = this;

    return {
      writeValueWithoutResponse: async (data: BufferSource) => {
        const cmdName = parseCommandName(data as ArrayBuffer);
        const label = cmdName ? `${name} [${cmdName}]` : name;
        logger.log('sent', label, `Write ${(data as ArrayBuffer).byteLength ?? 0} bytes`, formatBytes(data as ArrayBuffer));
        return char.writeValueWithoutResponse(data);
      },
      startNotifications: async () => {
        logger.log('event', name, 'Start notifications');
        return char.startNotifications();
      },
      stopNotifications: async () => {
        logger.log('event', name, 'Stop notifications');
        return char.stopNotifications();
      },
      addEventListener: (event: string, callback: (event: any) => void) => {
        const wrappedCallback = (evt: any) => {
          if (event === 'characteristicvaluechanged' && evt.target?.value) {
            const cmdName = parseCommandName(evt.target.value);
            const label = cmdName ? `${name} [${cmdName}]` : name;
            logger.log('received', label, `Notification ${evt.target.value.byteLength} bytes`, formatBytes(evt.target.value));
          }
          callback(evt);
        };
        (callback as any).__wrapped = wrappedCallback;
        char.addEventListener(event, wrappedCallback);
      },
      removeEventListener: (event: string, callback: (event: any) => void) => {
        const wrapped = (callback as any).__wrapped ?? callback;
        char.removeEventListener(event, wrapped);
      },
    };
  }
}
