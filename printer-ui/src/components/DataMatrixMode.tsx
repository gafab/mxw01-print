import { useState, useEffect, useCallback } from 'react';
import AdvancedOptions from './AdvancedOptions';
import { renderDataMatrixToCanvas } from '../utils/canvas';
import type { PrintOptions, DataMatrixOptions } from '../types';
import { DEFAULT_DATAMATRIX_OPTIONS } from '../types';

interface DataMatrixModeProps {
  printOptions: PrintOptions;
  onPrintOptionsChange: (options: PrintOptions) => void;
  onPreviewUpdate: (canvas: HTMLCanvasElement | null) => void;
  onPrint: () => void;
  isPrinting: boolean;
}

export default function DataMatrixMode({
  printOptions,
  onPrintOptionsChange,
  onPreviewUpdate,
  onPrint,
  isPrinting,
}: DataMatrixModeProps) {
  const [options, setOptions] = useState<DataMatrixOptions>(DEFAULT_DATAMATRIX_OPTIONS);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [error, setError] = useState('');

  const updatePreview = useCallback(() => {
    try {
      setError('');
      const canvas = renderDataMatrixToCanvas(options);
      if (canvas.height <= 1) {
        onPreviewUpdate(null);
      } else {
        onPreviewUpdate(canvas);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid Data Matrix input');
      onPreviewUpdate(null);
    }
  }, [options, onPreviewUpdate]);

  useEffect(() => {
    updatePreview();
  }, [updatePreview]);

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Content</label>
        <textarea
          value={options.content}
          onChange={(e) => setOptions({ ...options, content: e.target.value })}
          placeholder="Enter data for Data Matrix..."
          rows={3}
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm resize-y"
        />
        <p className="text-xs text-gray-400 mt-1">
          Supports any text, URLs, serial numbers, etc. Up to ~2,335 alphanumeric characters.
        </p>
      </div>

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          Scale: {options.scale}x
        </label>
        <input
          type="range"
          min={1}
          max={10}
          value={options.scale}
          onChange={(e) => setOptions({ ...options, scale: Number(e.target.value) })}
          className="w-full"
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-gray-700">
        <input
          type="checkbox"
          checked={options.rectangular}
          onChange={(e) => setOptions({ ...options, rectangular: e.target.checked })}
          className="rounded"
        />
        Rectangular shape (instead of square)
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
        {isPrinting ? 'Printing...' : 'Print Data Matrix'}
      </button>
    </div>
  );
}
