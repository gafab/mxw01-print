import { useEffect, useRef, useState } from 'react';
import { processImageForPrinter } from 'mxw01-thermal-printer';
import type { PrintOptions } from '../types';

interface PrintPreviewProps {
  sourceCanvas: HTMLCanvasElement | null;
  printOptions: PrintOptions;
}

export default function PrintPreview({ sourceCanvas, printOptions }: PrintPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (!sourceCanvas || sourceCanvas.width === 0 || sourceCanvas.height === 0) {
      canvas.width = 384;
      canvas.height = 100;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#ccc';
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('No content to preview', canvas.width / 2, canvas.height / 2);
      setDimensions(null);
      return;
    }

    const srcCtx = sourceCanvas.getContext('2d');
    if (!srcCtx) return;

    const imageData = srcCtx.getImageData(0, 0, sourceCanvas.width, sourceCanvas.height);
    const { processedData, width, height } = processImageForPrinter(imageData, {
      dither: printOptions.dither,
      brightness: printOptions.brightness,
      rotate: 0,
      flip: 'none',
    });

    canvas.width = width;
    canvas.height = height;
    const outData = ctx.createImageData(width, height);
    const pixels = new Uint32Array(outData.data.buffer);
    pixels.set(processedData);

    // Simulate intensity: map black pixels to a gray shade.
    // Higher intensity = darker burn = blacker. Lower = lighter gray.
    // intensity 0 → rgb(180,180,180), intensity 255 → rgb(0,0,0)
    // Non-linear curve so default (93) looks nearly black (~rgb(35,35,35))
    const t = printOptions.intensity / 255;
    const gray = Math.round(180 * Math.pow(1 - t, 2.5));
    if (gray > 0) {
      const buf = outData.data;
      for (let i = 0; i < buf.length; i += 4) {
        if (buf[i] === 0 && buf[i + 1] === 0 && buf[i + 2] === 0) {
          buf[i] = gray;
          buf[i + 1] = gray;
          buf[i + 2] = gray;
        }
      }
    }

    ctx.putImageData(outData, 0, 0);
    setDimensions({ width, height });
  }, [sourceCanvas, printOptions]);

  return (
    <div className="p-4">
      <h3 className="text-sm font-medium text-gray-600 mb-3 flex items-center gap-2">
        Print Preview
        {dimensions && (
          <span className="text-xs text-gray-400 font-normal bg-gray-100 px-2 py-0.5 rounded-full">
            {dimensions.width} × {dimensions.height}px
          </span>
        )}
      </h3>
      <div className="flex justify-center">
        <div className="bg-white shadow-sm border border-gray-200 rounded inline-block max-w-full overflow-auto">
          <canvas
            ref={canvasRef}
            className="block max-w-full h-auto"
            style={{ imageRendering: 'pixelated' }}
          />
        </div>
      </div>
    </div>
  );
}
