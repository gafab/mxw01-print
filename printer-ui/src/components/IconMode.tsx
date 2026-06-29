import { useState, useEffect, useCallback } from 'react';
import AdvancedOptions from './AdvancedOptions';
import IconArrange from './IconArrange';
import IconPickerModal from './IconPickerModal';
import { renderIconsToCanvas } from '../utils/canvas';
import { svgToDataUri } from '../utils/flags';
import { loadIconSets, addIconSet, deleteIconSet, type IconSet } from '../utils/iconSets';
import type { PrintOptions, IconOptions, IconEntry, IconSize } from '../types';
import { DEFAULT_ICON_OPTIONS } from '../types';

interface IconModeProps {
  printOptions: PrintOptions;
  onPrintOptionsChange: (options: PrintOptions) => void;
  onPreviewUpdate: (canvas: HTMLCanvasElement | null) => void;
  onPrint: () => void;
  isPrinting: boolean;
}

const SIZE_OPTIONS: { value: IconSize; label: string }[] = [
  { value: 24, label: 'Small' },
  { value: 32, label: 'Medium' },
  { value: 48, label: 'Large' },
  { value: 64, label: 'XL' },
  { value: 96, label: 'XXL' },
  { value: 128, label: 'XXXL' },
];

export default function IconMode({
  printOptions,
  onPrintOptionsChange,
  onPreviewUpdate,
  onPrint,
  isPrinting,
}: IconModeProps) {
  const [options, setOptions] = useState<IconOptions>(DEFAULT_ICON_OPTIONS);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  // Icon sets state
  const [iconSets, setIconSets] = useState<IconSet[]>(() => loadIconSets());
  const [setName, setSetName] = useState('');
  const [showSaveInput, setShowSaveInput] = useState(false);

  const updatePreview = useCallback(() => {
    if (options.selectedIcons.length === 0) {
      onPreviewUpdate(null);
      return;
    }
    renderIconsToCanvas(options).then(onPreviewUpdate);
  }, [options, onPreviewUpdate]);

  useEffect(() => {
    updatePreview();
  }, [updatePreview]);

  const toggleIcon = useCallback((icon: IconEntry) => {
    setOptions((prev) => {
      const match = (s: IconEntry) => icon.svg ? s.name === icon.name : s.path === icon.path;
      const exists = prev.selectedIcons.some(match);
      const selectedIcons = exists
        ? prev.selectedIcons.filter((s) => !match(s))
        : [...prev.selectedIcons, icon];
      return { ...prev, selectedIcons };
    });
  }, []);

  const clearSelection = useCallback(() => {
    setOptions((prev) => ({ ...prev, selectedIcons: [] }));
  }, []);

  const handleReorder = useCallback((reordered: IconEntry[]) => {
    setOptions((prev) => ({ ...prev, selectedIcons: reordered }));
  }, []);

  // Icon set actions
  const handleSaveSet = useCallback(() => {
    const name = setName.trim();
    if (!name || options.selectedIcons.length === 0) return;
    const updated = addIconSet({
      name,
      icons: options.selectedIcons,
      size: options.size,
      columns: options.columns,
      spacing: options.spacing,
    });
    setIconSets(updated);
    setSetName('');
    setShowSaveInput(false);
  }, [setName, options]);

  const handleLoadSet = useCallback((set: IconSet) => {
    setOptions({
      selectedIcons: set.icons,
      size: set.size,
      columns: set.columns,
      spacing: set.spacing,
    });
  }, []);

  const handleDeleteSet = useCallback((id: string) => {
    const updated = deleteIconSet(id);
    setIconSets(updated);
  }, []);

  return (
    <>
      <div className="space-y-4">
        {/* Icon Sets */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-medium text-gray-600 uppercase tracking-wide">Saved Sets</h3>
            {options.selectedIcons.length > 0 && (
              <button
                onClick={() => setShowSaveInput(!showSaveInput)}
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                {showSaveInput ? 'Cancel' : 'Save Current'}
              </button>
            )}
          </div>

          {showSaveInput && (
            <div className="flex gap-2">
              <input
                type="text"
                value={setName}
                onChange={(e) => setSetName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveSet()}
                placeholder="Set name..."
                className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm"
                autoFocus
              />
              <button
                onClick={handleSaveSet}
                disabled={!setName.trim()}
                className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-500 disabled:opacity-50"
              >
                Save
              </button>
            </div>
          )}

          {iconSets.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {iconSets.map((set) => (
                <div
                  key={set.id}
                  className="group flex items-center gap-1 bg-gray-100 hover:bg-gray-200 rounded-full pl-3 pr-1 py-1 text-sm transition-colors"
                >
                  <button
                    onClick={() => handleLoadSet(set)}
                    className="text-gray-700 hover:text-gray-900"
                    title={`Load "${set.name}" (${set.icons.length} icons)`}
                  >
                    {set.name}
                    <span className="text-gray-400 ml-1 text-xs">{set.icons.length}</span>
                  </button>
                  <button
                    onClick={() => handleDeleteSet(set.id)}
                    className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-0.5"
                    title="Delete set"
                  >
                    <svg viewBox="0 0 16 16" className="w-3.5 h-3.5">
                      <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="2" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-400">No saved sets yet</p>
          )}
        </div>

        <hr className="border-gray-200" />

        {/* Add Icons button + selection summary */}
        <div className="space-y-2">
          <button
            onClick={() => setShowPicker(true)}
            className="w-full flex items-center justify-center gap-2 py-2.5 border-2 border-dashed border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="currentColor" />
            </svg>
            {options.selectedIcons.length === 0 ? 'Add Icons' : 'Add / Remove Icons'}
          </button>

          {options.selectedIcons.length > 0 && (
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                {/* Mini icon preview strip */}
                <div className="flex -space-x-1">
                  {options.selectedIcons.slice(0, 5).map((icon, i) => (
                    <div
                      key={i}
                      className="w-6 h-6 bg-gray-100 border border-white rounded-full flex items-center justify-center overflow-hidden"
                    >
                      {icon.svg ? (
                        <img
                          src={svgToDataUri(icon.svg)}
                          alt={icon.name}
                          className="w-4 h-3 object-contain"
                        />
                      ) : (
                        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5">
                          <path d={icon.path} fill="currentColor" />
                        </svg>
                      )}
                    </div>
                  ))}
                  {options.selectedIcons.length > 5 && (
                    <div className="w-6 h-6 bg-gray-200 border border-white rounded-full flex items-center justify-center text-[9px] font-bold text-gray-500">
                      +{options.selectedIcons.length - 5}
                    </div>
                  )}
                </div>
                <span className="text-gray-600">
                  {options.selectedIcons.length} icon{options.selectedIcons.length !== 1 ? 's' : ''}
                </span>
              </div>
              <button onClick={clearSelection} className="text-red-500 hover:text-red-700 text-xs">
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* Settings */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Icon Size</label>
            <select
              value={options.size}
              onChange={(e) => setOptions({ ...options, size: Number(e.target.value) as IconSize })}
              className="w-full text-sm border border-gray-300 rounded px-2 py-1.5"
            >
              {SIZE_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>{s.label} ({s.value}px)</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Columns: {options.columns}</label>
            <input
              type="range"
              min={2}
              max={8}
              value={options.columns}
              onChange={(e) => setOptions({ ...options, columns: Number(e.target.value) })}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Spacing: {options.spacing}px</label>
            <input
              type="range"
              min={4}
              max={32}
              value={options.spacing}
              onChange={(e) => setOptions({ ...options, spacing: Number(e.target.value) })}
              className="w-full"
            />
          </div>
        </div>

        {/* Drag & drop arrangement */}
        <IconArrange
          icons={options.selectedIcons}
          size={options.size}
          columns={options.columns}
          spacing={options.spacing}
          onReorder={handleReorder}
        />

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
          disabled={isPrinting || options.selectedIcons.length === 0}
          className="w-full py-2.5 bg-blue-600 text-white rounded font-medium hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPrinting ? 'Printing…' : `Print ${options.selectedIcons.length} Icon${options.selectedIcons.length !== 1 ? 's' : ''}`}
        </button>
      </div>

      {showPicker && (
        <IconPickerModal
          selectedIcons={options.selectedIcons}
          onToggle={toggleIcon}
          onClose={() => setShowPicker(false)}
        />
      )}
    </>
  );
}
