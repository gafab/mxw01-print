import { useState, useRef, useCallback } from 'react';
import { usePrinter } from './hooks/usePrinter';
import PrinterBar from './components/PrinterBar';
import ModeTabs from './components/ModeTabs';
import PrintPreview from './components/PrintPreview';
import PrinterLogs from './components/PrinterLogs';
import TextMode from './components/TextMode';
import ImageMode from './components/ImageMode';
import IconMode from './components/IconMode';
import QrMode from './components/QrMode';
import BarcodeMode from './components/BarcodeMode';
import DataMatrixMode from './components/DataMatrixMode';
import LatexMode from './components/LatexMode';
import ReceiptMode from './components/ReceiptMode';
import type { PrintMode } from './types';

export default function App() {
  const printer = usePrinter();
  const [mode, setMode] = useState<PrintMode>('text');
  const [previewCanvas, setPreviewCanvas] = useState<HTMLCanvasElement | null>(null);
  const printCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const handlePreviewUpdate = useCallback((canvas: HTMLCanvasElement | null) => {
    printCanvasRef.current = canvas;
    setPreviewCanvas(canvas);
  }, []);

  const handlePrint = useCallback(() => {
    if (printCanvasRef.current) {
      printer.print(printCanvasRef.current);
    }
  }, [printer]);

  const modeProps = {
    printOptions: printer.printOptions,
    onPrintOptionsChange: printer.setPrintOptions,
    onPreviewUpdate: handlePreviewUpdate,
    onPrint: handlePrint,
    isPrinting: printer.isPrinting,
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <PrinterBar
        isConnected={printer.isConnected}
        isPrinting={printer.isPrinting}
        statusMessage={printer.statusMessage}
        batteryLow={printer.batteryLow}
        onConnect={printer.connect}
        onDisconnect={printer.disconnect}
      />

      {/* ── Desktop layout ─────────────────────────────────────────────── */}
      <div className="hidden lg:flex flex-1 max-w-[1400px] mx-auto w-full px-6 py-6 gap-6 items-start">

        {/* Left column: mode selector + controls */}
        <div className="w-72 xl:w-80 shrink-0 flex flex-col gap-4">
          <ModeTabs activeMode={mode} onModeChange={setMode} />

          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
            {mode === 'text'       && <TextMode       {...modeProps} />}
            {mode === 'image'      && <ImageMode      {...modeProps} />}
            {mode === 'icon'       && <IconMode       {...modeProps} />}
            {mode === 'qr'         && <QrMode         {...modeProps} />}
            {mode === 'barcode'    && <BarcodeMode    {...modeProps} />}
            {mode === 'datamatrix' && <DataMatrixMode {...modeProps} />}
            {mode === 'latex'      && <LatexMode      {...modeProps} />}
            {mode === 'receipt'    && <ReceiptMode    {...modeProps} />}
          </div>
        </div>

        {/* Right column: preview + logs (sticky) */}
        <div className="flex-1 min-w-0 flex flex-col gap-4 sticky top-6">
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <PrintPreview sourceCanvas={previewCanvas} printOptions={printer.printOptions} />
          </div>
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <PrinterLogs logs={printer.logs} onClear={printer.clearLogs} />
          </div>
        </div>
      </div>

      {/* ── Mobile layout ──────────────────────────────────────────────── */}
      <div className="lg:hidden flex flex-col flex-1 bg-white">
        <ModeTabs activeMode={mode} onModeChange={setMode} />

        <div className="p-4 flex-1">
          {mode === 'text'       && <TextMode       {...modeProps} />}
          {mode === 'image'      && <ImageMode      {...modeProps} />}
          {mode === 'icon'       && <IconMode       {...modeProps} />}
          {mode === 'qr'         && <QrMode         {...modeProps} />}
          {mode === 'barcode'    && <BarcodeMode    {...modeProps} />}
          {mode === 'datamatrix' && <DataMatrixMode {...modeProps} />}
          {mode === 'latex'      && <LatexMode      {...modeProps} />}
          {mode === 'receipt'    && <ReceiptMode    {...modeProps} />}
        </div>

        <div className="border-t border-gray-200">
          <PrintPreview sourceCanvas={previewCanvas} printOptions={printer.printOptions} />
        </div>
        <PrinterLogs logs={printer.logs} onClear={printer.clearLogs} />
      </div>
    </div>
  );
}
