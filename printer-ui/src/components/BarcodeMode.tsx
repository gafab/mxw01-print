import { useState, useEffect, useCallback } from 'react';
import AdvancedOptions from './AdvancedOptions';
import { renderBarcodeToCanvas } from '../utils/canvas';
import type { PrintOptions, BarcodeOptions, BarcodeFormat } from '../types';
import { DEFAULT_BARCODE_OPTIONS } from '../types';

interface BarcodeModeProps {
  printOptions: PrintOptions;
  onPrintOptionsChange: (options: PrintOptions) => void;
  onPreviewUpdate: (canvas: HTMLCanvasElement | null) => void;
  onPrint: () => void;
  isPrinting: boolean;
}

const BARCODE_FORMATS: { value: BarcodeFormat; label: string; hint: string }[] = [
  { value: 'code128', label: 'Code 128', hint: 'Any ASCII character' },
  { value: 'code39', label: 'Code 39', hint: 'A-Z 0-9 - . $ / + % space' },
  { value: 'code93', label: 'Code 93', hint: 'Full ASCII' },
  { value: 'ean13', label: 'EAN-13', hint: '12-13 digits' },
  { value: 'ean8', label: 'EAN-8', hint: '7-8 digits' },
  { value: 'upca', label: 'UPC-A', hint: '11-12 digits' },
  { value: 'upce', label: 'UPC-E', hint: '6-8 digits' },
  { value: 'itf14', label: 'ITF-14', hint: '13-14 digits' },
  { value: 'interleaved2of5', label: 'Interleaved 2 of 5', hint: 'Even number of digits' },
  { value: 'codabar', label: 'Codabar', hint: '0-9 - $ : / . +' },
  { value: 'pdf417', label: 'PDF417', hint: 'Any text (2D stacked)' },
];

export default function BarcodeMode({
  printOptions,
  onPrintOptionsChange,
  onPreviewUpdate,
  onPrint,
  isPrinting,
}: BarcodeModeProps) {
  const [options, setOptions] = useState<BarcodeOptions>(DEFAULT_BARCODE_OPTIONS);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [error, setError] = useState('');

  const updatePreview = useCallback(() => {
    try {
      setError('');
      const canvas = renderBarcodeToCanvas(options);
      if (canvas.height <= 1) {
        onPreviewUpdate(null);
      } else {
        onPreviewUpdate(canvas);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid barcode input');
      onPreviewUpdate(null);
    }
  }, [options, onPreviewUpdate]);

  useEffect(() => {
    updatePreview();
  }, [updatePreview]);

  const currentFormat = BARCODE_FORMATS.find((f) => f.value === options.format);

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Barcode Format</label>
        <select
          value={options.format}
          onChange={(e) => setOptions({ ...options, format: e.target.value as BarcodeFormat })}
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
        >
          {BARCODE_FORMATS.map((f) => (
            <option key={f.value} value={f.value}>{f.label}</option>
          ))}
        </select>
        {currentFormat && (
          <p className="text-xs text-gray-400 mt-1">Accepts: {currentFormat.hint}</p>
        )}
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Content</label>
        <input
          type="text"
          value={options.content}
          onChange={(e) => setOptions({ ...options, content: e.target.value })}
          placeholder="Enter barcode data..."
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
        />
      </div>

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Scale X: {options.scaleX}
          </label>
          <input
            type="range"
            min={1}
            max={6}
            value={options.scaleX}
            onChange={(e) => setOptions({ ...options, scaleX: Number(e.target.value) })}
            className="w-full"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Scale Y: {options.scaleY}
          </label>
          <input
            type="range"
            min={1}
            max={6}
            value={options.scaleY}
            onChange={(e) => setOptions({ ...options, scaleY: Number(e.target.value) })}
            className="w-full"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          Bar Height: {options.height}mm
        </label>
        <input
          type="range"
          min={5}
          max={40}
          value={options.height}
          onChange={(e) => setOptions({ ...options, height: Number(e.target.value) })}
          className="w-full"
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-gray-700">
        <input
          type="checkbox"
          checked={options.includeText}
          onChange={(e) => setOptions({ ...options, includeText: e.target.checked })}
          className="rounded"
        />
        Show text below barcode
      </label>

      <button
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="text-sm text-blue-600 hover:text-blue-800"
      >
        {showAdvanced ? 'Hide Advanced' : 'Show Advanced'}
      </button>

      {showAdvanced && (
        <AdvancedOptions options={printOptions} onChange={onPrintOptionsChange} />
      )}

      <button
        onClick={onPrint}
        disabled={isPrinting || !options.content.trim()}
        className="w-full py-2.5 bg-blue-600 text-white rounded font-medium hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPrinting ? 'Printing...' : 'Print Barcode'}
      </button>
    </div>
  );
}
