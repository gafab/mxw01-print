import { useState, useEffect, useCallback } from 'react';
import AdvancedOptions from './AdvancedOptions';
import { renderTextToCanvas } from '../utils/canvas';
import type { PrintOptions, TextOptions } from '../types';
import { DEFAULT_TEXT_OPTIONS, PRINTER_WIDTH } from '../types';

interface TextModeProps {
  printOptions: PrintOptions;
  onPrintOptionsChange: (options: PrintOptions) => void;
  onPreviewUpdate: (canvas: HTMLCanvasElement | null) => void;
  onPrint: () => void;
  isPrinting: boolean;
}

const FONT_FAMILIES = [
  { value: 'sans-serif', label: 'Sans Serif' },
  { value: 'serif', label: 'Serif' },
  { value: 'monospace', label: 'Monospace' },
];

export default function TextMode({
  printOptions,
  onPrintOptionsChange,
  onPreviewUpdate,
  onPrint,
  isPrinting,
}: TextModeProps) {
  const [options, setOptions] = useState<TextOptions>(DEFAULT_TEXT_OPTIONS);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const updatePreview = useCallback(() => {
    if (!options.text.trim()) {
      onPreviewUpdate(null);
      return;
    }
    const canvas = renderTextToCanvas(options);
    onPreviewUpdate(canvas);
  }, [options, onPreviewUpdate]);

  useEffect(() => {
    updatePreview();
  }, [updatePreview]);

  return (
    <div className="space-y-4">
      <textarea
        value={options.text}
        onChange={(e) => setOptions({ ...options, text: e.target.value })}
        placeholder="Enter text to print..."
        rows={4}
        className="w-full border border-gray-300 rounded px-3 py-2 text-sm resize-y"
      />

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          Font Size: {options.fontSize}px
        </label>
        <input
          type="range"
          min={12}
          max={72}
          value={options.fontSize}
          onChange={(e) => setOptions({ ...options, fontSize: Number(e.target.value) })}
          className="w-full"
        />
      </div>

      <button
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="text-sm text-blue-600 hover:text-blue-800"
      >
        {showAdvanced ? 'Hide Advanced' : 'Show Advanced'}
      </button>

      {showAdvanced && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Font Family</label>
              <select
                value={options.fontFamily}
                onChange={(e) => setOptions({ ...options, fontFamily: e.target.value })}
                className="w-full text-sm border border-gray-300 rounded px-2 py-1.5"
              >
                {FONT_FAMILIES.map((f) => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Alignment</label>
              <div className="flex gap-1">
                {(['left', 'center', 'right'] as const).map((a) => (
                  <button
                    key={a}
                    onClick={() => setOptions({ ...options, align: a })}
                    className={`flex-1 text-sm py-1.5 rounded border ${
                      options.align === a
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'border-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    {a[0].toUpperCase() + a.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setOptions({ ...options, bold: !options.bold })}
              className={`px-3 py-1.5 text-sm rounded border font-bold ${
                options.bold
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'border-gray-300 hover:bg-gray-100'
              }`}
            >
              B
            </button>
            <button
              onClick={() => setOptions({ ...options, italic: !options.italic })}
              className={`px-3 py-1.5 text-sm rounded border italic ${
                options.italic
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'border-gray-300 hover:bg-gray-100'
              }`}
            >
              I
            </button>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Line Height: {options.lineHeight.toFixed(1)}
            </label>
            <input
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={options.lineHeight}
              onChange={(e) => setOptions({ ...options, lineHeight: Number(e.target.value) })}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Rotation</label>
            <div className="flex gap-1">
              {([0, 90, 270] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setOptions({
                    ...options,
                    rotation: r,
                    width: r === 0 ? Math.min(options.width, PRINTER_WIDTH) : options.width,
                  })}
                  className={`flex-1 text-sm py-1.5 rounded border ${
                    options.rotation === r
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  {r === 0 ? '0°' : r === 90 ? '90° ↻' : '270° ↺'}
                </button>
              ))}
            </div>
            {options.rotation !== 0 && (
              <p className="text-xs text-gray-500 mt-1">
                El ancho controla el largo del papel impreso (eje de avance).
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              {options.rotation !== 0 ? `Largo: ${options.width}px` : `Width: ${options.width}px`}
            </label>
            <input
              type="range"
              min={100}
              max={options.rotation !== 0 ? 2000 : PRINTER_WIDTH}
              value={options.width}
              onChange={(e) => setOptions({ ...options, width: Number(e.target.value) })}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Padding: {options.padding}px
            </label>
            <input
              type="range"
              min={0}
              max={32}
              value={options.padding}
              onChange={(e) => setOptions({ ...options, padding: Number(e.target.value) })}
              className="w-full"
            />
          </div>

          <AdvancedOptions options={printOptions} onChange={onPrintOptionsChange} />
        </div>
      )}

      <button
        onClick={onPrint}
        disabled={isPrinting || !options.text.trim()}
        className="w-full py-2.5 bg-blue-600 text-white rounded font-medium hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPrinting ? 'Printing...' : 'Print'}
      </button>
    </div>
  );
}
