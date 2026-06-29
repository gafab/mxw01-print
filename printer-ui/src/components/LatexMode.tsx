import { useState, useEffect, useCallback, useMemo } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import AdvancedOptions from './AdvancedOptions';
import { renderLatexToCanvas } from '../utils/canvas';
import type { PrintOptions, LatexOptions } from '../types';
import { DEFAULT_LATEX_OPTIONS } from '../types';

interface LatexModeProps {
  printOptions: PrintOptions;
  onPrintOptionsChange: (options: PrintOptions) => void;
  onPreviewUpdate: (canvas: HTMLCanvasElement | null) => void;
  onPrint: () => void;
  isPrinting: boolean;
}

const EXAMPLES = [
  { label: 'Fraction', latex: '\\frac{x^2 + y^2}{z}' },
  { label: 'Integral', latex: '\\int_0^{\\infty} e^{-x^2} dx = \\frac{\\sqrt{\\pi}}{2}' },
  { label: 'Matrix', latex: '\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}' },
  { label: 'Sum', latex: '\\sum_{n=1}^{\\infty} \\frac{1}{n^2} = \\frac{\\pi^2}{6}' },
];

export default function LatexMode({
  printOptions,
  onPrintOptionsChange,
  onPreviewUpdate,
  onPrint,
  isPrinting,
}: LatexModeProps) {
  const [options, setOptions] = useState<LatexOptions>(DEFAULT_LATEX_OPTIONS);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Live KaTeX preview HTML (rendered in the component with real fonts)
  const previewResult = useMemo(() => {
    if (!options.latex.trim()) return null;
    try {
      return {
        html: katex.renderToString(options.latex, {
          displayMode: options.displayMode,
          throwOnError: false,
          output: 'html',
        }),
        error: null,
      };
    } catch (err) {
      return { html: null, error: String(err) };
    }
  }, [options.latex, options.displayMode]);

  const updatePreview = useCallback(async () => {
    if (!options.latex.trim()) {
      onPreviewUpdate(null);
      return;
    }
    const canvas = await renderLatexToCanvas(options);
    onPreviewUpdate(canvas);
  }, [options, onPreviewUpdate]);

  useEffect(() => {
    updatePreview();
  }, [updatePreview]);

  return (
    <div className="space-y-4">
      {/* LaTeX editor */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">LaTeX</label>
        <textarea
          value={options.latex}
          onChange={(e) => setOptions({ ...options, latex: e.target.value })}
          placeholder={'e.g. \\frac{x^2 + y^2}{z}'}
          rows={4}
          spellCheck={false}
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm font-mono resize-y"
        />
      </div>

      {/* Example snippets */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Examples</label>
        <div className="flex flex-wrap gap-1">
          {EXAMPLES.map(({ label, latex }) => (
            <button
              key={label}
              onClick={() => setOptions({ ...options, latex })}
              className="px-2 py-1 text-xs rounded border border-gray-300 hover:bg-gray-100 text-gray-600"
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Live preview */}
      {options.latex.trim() && (
        <div className="border border-gray-200 rounded-lg bg-white overflow-x-auto">
          <div className="px-3 py-1.5 border-b border-gray-100 flex items-center gap-2">
            <span className="text-xs font-medium text-gray-500">Preview</span>
            {previewResult?.error && (
              <span className="text-xs text-red-500">parse error</span>
            )}
          </div>
          <div
            className="p-3 flex items-center min-h-[48px]"
            style={{
              justifyContent:
                options.align === 'left'
                  ? 'flex-start'
                  : options.align === 'right'
                  ? 'flex-end'
                  : 'center',
              fontSize: options.fontSize,
            }}
            dangerouslySetInnerHTML={{ __html: previewResult?.html ?? '' }}
          />
        </div>
      )}

      {/* Display mode + align */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Mode</label>
          <div className="flex gap-1">
            {([true, false] as const).map((dm) => (
              <button
                key={String(dm)}
                onClick={() => setOptions({ ...options, displayMode: dm })}
                className={`flex-1 text-xs py-1.5 rounded border ${
                  options.displayMode === dm
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'border-gray-300 hover:bg-gray-100'
                }`}
              >
                {dm ? 'Display' : 'Inline'}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Align</label>
          <div className="flex gap-1">
            {(['left', 'center', 'right'] as const).map((a) => (
              <button
                key={a}
                onClick={() => setOptions({ ...options, align: a })}
                className={`flex-1 text-xs py-1.5 rounded border ${
                  options.align === a
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'border-gray-300 hover:bg-gray-100'
                }`}
              >
                {a[0].toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Font size */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          Font Size: {options.fontSize}px
        </label>
        <input
          type="range"
          min={12}
          max={48}
          value={options.fontSize}
          onChange={(e) => setOptions({ ...options, fontSize: Number(e.target.value) })}
          className="w-full"
        />
      </div>

      {/* Advanced toggle */}
      <button
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="text-sm text-blue-600 hover:text-blue-800"
      >
        {showAdvanced ? 'Hide Advanced' : 'Show Advanced'}
      </button>

      {showAdvanced && (
        <div className="space-y-3">
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
        disabled={isPrinting || !options.latex.trim()}
        className="w-full py-2.5 bg-blue-600 text-white rounded font-medium hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPrinting ? 'Printing...' : 'Print'}
      </button>
    </div>
  );
}
