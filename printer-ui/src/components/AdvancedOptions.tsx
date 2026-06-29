import type { PrintOptions, DitherMethod } from '../types';

const DITHER_METHODS: { value: DitherMethod; label: string }[] = [
  { value: 'steinberg', label: 'Floyd-Steinberg' },
  { value: 'atkinson', label: 'Atkinson' },
  { value: 'bayer', label: 'Bayer (Ordered)' },
  { value: 'threshold', label: 'Threshold' },
  { value: 'pattern', label: 'Pattern' },
];

interface AdvancedOptionsProps {
  options: PrintOptions;
  onChange: (options: PrintOptions) => void;
}

export default function AdvancedOptions({ options, onChange }: AdvancedOptionsProps) {
  return (
    <div className="space-y-3 p-3 bg-gray-50 rounded border border-gray-200">
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Dithering</label>
        <select
          value={options.dither}
          onChange={(e) => onChange({ ...options, dither: e.target.value as DitherMethod })}
          className="w-full text-sm border border-gray-300 rounded px-2 py-1.5"
        >
          {DITHER_METHODS.map((m) => (
            <option key={m.value} value={m.value}>{m.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          Brightness: {options.brightness}
        </label>
        <input
          type="range"
          min={0}
          max={255}
          value={options.brightness}
          onChange={(e) => onChange({ ...options, brightness: Number(e.target.value) })}
          className="w-full"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          Intensity: {options.intensity}
        </label>
        <input
          type="range"
          min={0}
          max={255}
          value={options.intensity}
          onChange={(e) => onChange({ ...options, intensity: Number(e.target.value) })}
          className="w-full"
        />
      </div>
    </div>
  );
}
