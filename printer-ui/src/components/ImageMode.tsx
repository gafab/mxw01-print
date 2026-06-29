import { useState, useEffect, useCallback, useRef } from 'react';
import AdvancedOptions from './AdvancedOptions';
import { renderImageToCanvas } from '../utils/canvas';
import type { PrintOptions, ImageOptions } from '../types';
import { DEFAULT_IMAGE_OPTIONS, PRINTER_WIDTH } from '../types';

interface ImageModeProps {
  printOptions: PrintOptions;
  onPrintOptionsChange: (options: PrintOptions) => void;
  onPreviewUpdate: (canvas: HTMLCanvasElement | null) => void;
  onPrint: () => void;
  isPrinting: boolean;
}

export default function ImageMode({
  printOptions,
  onPrintOptionsChange,
  onPreviewUpdate,
  onPrint,
  isPrinting,
}: ImageModeProps) {
  const [options, setOptions] = useState<ImageOptions>(DEFAULT_IMAGE_OPTIONS);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updatePreview = useCallback(() => {
    if (!image) {
      onPreviewUpdate(null);
      return;
    }
    const canvas = renderImageToCanvas(image, options);
    onPreviewUpdate(canvas);
  }, [image, options, onPreviewUpdate]);

  useEffect(() => {
    updatePreview();
  }, [updatePreview]);

  const loadImage = useCallback((file: File) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      setImage(img);
    };
    img.src = url;
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) {
        loadImage(file);
      }
    },
    [loadImage],
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        loadImage(file);
      }
    },
    [loadImage],
  );

  return (
    <div className="space-y-4">
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragging
            ? 'border-blue-400 bg-blue-50'
            : image
              ? 'border-green-300 bg-green-50'
              : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        {image ? (
          <p className="text-sm text-green-700">
            Image loaded ({image.naturalWidth}x{image.naturalHeight}) — click or drop to replace
          </p>
        ) : (
          <div className="text-gray-500">
            <p className="text-sm">Drop an image here or click to select</p>
            <p className="text-xs mt-1">Supports PNG, JPG, GIF, WebP</p>
          </div>
        )}
      </div>

      <button
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="text-sm text-blue-600 hover:text-blue-800"
      >
        {showAdvanced ? 'Hide Advanced' : 'Show Advanced'}
      </button>

      {showAdvanced && (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Rotation</label>
            <div className="flex gap-1">
              {([0, 90, 180, 270] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setOptions({ ...options, rotation: r })}
                  className={`flex-1 text-sm py-1.5 rounded border ${
                    options.rotation === r
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  {r}°
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="invert"
              checked={options.invert}
              onChange={(e) => setOptions({ ...options, invert: e.target.checked })}
              className="rounded"
            />
            <label htmlFor="invert" className="text-sm text-gray-700">Invert colors</label>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Width: {options.width}px
            </label>
            <input
              type="range"
              min={10}
              max={PRINTER_WIDTH}
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
        disabled={isPrinting || !image}
        className="w-full py-2.5 bg-blue-600 text-white rounded font-medium hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPrinting ? 'Printing...' : 'Print'}
      </button>
    </div>
  );
}
