import { useState, useCallback, useRef, useEffect } from 'react';
import { ThermalPrinterClient, WebBluetoothAdapter } from 'mxw01-thermal-printer';
import { PrinterLogger, type PrinterLogEntry } from '../utils/printerLogger';
import type { PrintOptions } from '../types';
import { DEFAULT_PRINT_OPTIONS } from '../types';

export function usePrinter() {
  const clientRef = useRef<ThermalPrinterClient | null>(null);
  const loggerRef = useRef<PrinterLogger>(new PrinterLogger());
  const [isConnected, setIsConnected] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Disconnected');
  const [batteryLow, setBatteryLow] = useState(false);
  const [printOptions, setPrintOptions] = useState<PrintOptions>(DEFAULT_PRINT_OPTIONS);
  const [logs, setLogs] = useState<PrinterLogEntry[]>([]);

  // Subscribe to logger
  useEffect(() => {
    return loggerRef.current.subscribe((entry) => {
      setLogs((prev) => [...prev, entry]);
    });
  }, []);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  const getClient = useCallback(() => {
    if (!clientRef.current) {
      const rawAdapter = new WebBluetoothAdapter();
      const adapter = loggerRef.current.wrapAdapter(rawAdapter);
      clientRef.current = new ThermalPrinterClient(adapter);
    }
    return clientRef.current;
  }, []);

  const connect = useCallback(async () => {
    try {
      setStatusMessage('Connecting...');
      loggerRef.current.log('event', 'app', 'Connection requested');
      const client = getClient();
      await client.connect();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setStatusMessage(`Connection failed: ${msg}`);
      loggerRef.current.log('event', 'app', `Connection failed: ${msg}`);
    }
  }, [getClient]);

  const disconnect = useCallback(async () => {
    try {
      const client = clientRef.current;
      if (client) {
        loggerRef.current.log('event', 'app', 'Disconnect requested');
        await client.disconnect();
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setStatusMessage(`Disconnect failed: ${msg}`);
      loggerRef.current.log('event', 'app', `Disconnect failed: ${msg}`);
    }
  }, []);

  const print = useCallback(async (canvas: HTMLCanvasElement) => {
    const client = clientRef.current;
    if (!client || !client.isConnected) {
      setStatusMessage('Not connected');
      return;
    }

    try {
      setIsPrinting(true);
      setStatusMessage('Printing...');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas context');

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      loggerRef.current.log(
        'event', 'app',
        `Print started: ${imageData.width}x${imageData.height}px, dither=${printOptions.dither}, brightness=${printOptions.brightness}, intensity=${printOptions.intensity}`,
      );

      await client.print(imageData, {
        dither: printOptions.dither,
        brightness: printOptions.brightness,
        intensity: printOptions.intensity,
      });
      setStatusMessage('Print complete');
      loggerRef.current.log('event', 'app', 'Print complete');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setStatusMessage(`Print failed: ${msg}`);
      loggerRef.current.log('event', 'app', `Print failed: ${msg}`);
    } finally {
      setIsPrinting(false);
    }
  }, [printOptions]);

  useEffect(() => {
    const client = getClient();
    const logger = loggerRef.current;

    const offConnected = client.on('connected', (event) => {
      setIsConnected(true);
      setStatusMessage('Connected');
      logger.log('event', 'printer', `Connected to ${event.device?.name ?? event.device?.id ?? 'device'}`);
    });

    const offDisconnected = client.on('disconnected', () => {
      setIsConnected(false);
      setStatusMessage('Disconnected');
      logger.log('event', 'printer', 'Disconnected');
    });

    const offError = client.on('error', (event) => {
      const msg = event.error?.message ?? 'Unknown error';
      setStatusMessage(`Error: ${msg}`);
      logger.log('event', 'printer', `Error: ${msg}`);
    });

    const offProgress = client.on('printProgress', (event) => {
      const pct = Math.round(event.progress);
      setStatusMessage(`Printing... ${pct}%`);
      logger.log('event', 'printer', `Progress: ${pct}%`);
    });

    const offState = client.on('stateChange', (event) => {
      const s = event.state;
      setBatteryLow(s.battery_low);
      const flags = [
        s.printing && 'printing',
        s.paper_jam && 'PAPER JAM',
        s.out_of_paper && 'OUT OF PAPER',
        s.cover_open && 'COVER OPEN',
        s.battery_low && 'BATTERY LOW',
        s.overheat && 'OVERHEAT',
      ].filter(Boolean);
      logger.log('received', 'state', flags.length > 0 ? flags.join(', ') : 'idle');
    });

    return () => {
      offConnected();
      offDisconnected();
      offError();
      offProgress();
      offState();
    };
  }, [getClient]);

  return {
    isConnected,
    isPrinting,
    statusMessage,
    batteryLow,
    printOptions,
    setPrintOptions,
    connect,
    disconnect,
    print,
    logs,
    clearLogs,
  };
}
