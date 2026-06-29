import { useState, useCallback, useRef } from 'react';
import type { IconEntry, IconSize } from '../types';
import { svgToDataUri } from '../utils/flags';

interface IconArrangeProps {
  icons: IconEntry[];
  size: IconSize;
  columns: number;
  spacing: number;
  onReorder: (icons: IconEntry[]) => void;
}

export default function IconArrange({ icons, size, columns, spacing, onReorder }: IconArrangeProps) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const dragCounter = useRef(0);

  const handleDragStart = useCallback((e: React.DragEvent, index: number) => {
    setDragIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(index));
  }, []);

  const handleDragEnter = useCallback((index: number) => {
    dragCounter.current++;
    setOverIndex(index);
  }, []);

  const handleDragLeave = useCallback(() => {
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setOverIndex(null);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent, targetIndex: number) => {
      e.preventDefault();
      dragCounter.current = 0;
      const sourceIndex = dragIndex;
      setDragIndex(null);
      setOverIndex(null);

      if (sourceIndex === null || sourceIndex === targetIndex) return;

      const reordered = [...icons];
      const [moved] = reordered.splice(sourceIndex, 1);
      reordered.splice(targetIndex, 0, moved);
      onReorder(reordered);
    },
    [dragIndex, icons, onReorder],
  );

  const handleDragEnd = useCallback(() => {
    dragCounter.current = 0;
    setDragIndex(null);
    setOverIndex(null);
  }, []);

  if (icons.length === 0) return null;

  const cellPx = size + spacing;
  const previewScale = Math.min(1, 360 / (columns * cellPx + spacing));
  const gridWidth = (columns * cellPx + spacing) * previewScale;

  return (
    <div className="bg-gray-50 border border-gray-200 rounded p-3">
      <h4 className="text-xs font-medium text-gray-500 mb-2">
        Arrange Icons <span className="font-normal text-gray-400">(drag to reorder)</span>
      </h4>
      <div className="flex justify-center">
        <div
          className="relative bg-white border border-gray-200 shadow-sm"
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${columns}, ${cellPx * previewScale}px)`,
            gap: 0,
            padding: (spacing / 2) * previewScale,
            width: gridWidth,
          }}
        >
          {icons.map((icon, index) => (
            <div
              key={`${icon.name}-${index}`}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragEnter={() => handleDragEnter(index)}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
              className={`flex items-center justify-center cursor-grab active:cursor-grabbing transition-all ${
                dragIndex === index ? 'opacity-30' : ''
              } ${overIndex === index && dragIndex !== index ? 'ring-2 ring-blue-400 rounded' : ''}`}
              style={{
                width: cellPx * previewScale,
                height: cellPx * previewScale,
                padding: (spacing / 2) * previewScale,
              }}
              title={icon.name}
            >
              {icon.svg ? (
                <img
                  src={svgToDataUri(icon.svg)}
                  alt={icon.name}
                  style={{
                    width: size * previewScale,
                    height: size * previewScale * (3 / 4),
                    objectFit: 'contain',
                  }}
                />
              ) : (
                <svg
                  viewBox="0 0 24 24"
                  style={{
                    width: size * previewScale,
                    height: size * previewScale,
                  }}
                >
                  <path d={icon.path} fill="currentColor" />
                </svg>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
