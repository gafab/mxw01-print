import type { PrintMode } from '../types';

const TABS: { mode: PrintMode; label: string; icon: string }[] = [
  { mode: 'text',       label: 'Text',       icon: 'T'  },
  { mode: 'image',      label: 'Image',      icon: '🖼' },
  { mode: 'icon',       label: 'Icon',       icon: '★'  },
  { mode: 'qr',         label: 'QR Code',    icon: '▦'  },
  { mode: 'barcode',    label: 'Barcode',    icon: '▋▋' },
  { mode: 'datamatrix', label: 'Data Matrix',icon: '▪▪' },
  { mode: 'latex',      label: 'LaTeX',      icon: 'Σ'  },
  { mode: 'receipt',    label: 'Receipt',    icon: '🧾' },
];

interface ModeTabsProps {
  activeMode: PrintMode;
  onModeChange: (mode: PrintMode) => void;
}

export default function ModeTabs({ activeMode, onModeChange }: ModeTabsProps) {
  return (
    <>
      {/* Mobile: horizontal scrollable tabs */}
      <nav className="flex overflow-x-auto border-b border-gray-200 bg-white lg:hidden">
        {TABS.map(({ mode, label }) => (
          <button
            key={mode}
            onClick={() => onModeChange(mode)}
            className={`flex-shrink-0 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap border-b-2 ${
              activeMode === mode
                ? 'text-blue-600 border-blue-600'
                : 'text-gray-500 border-transparent hover:text-gray-700'
            }`}
          >
            {label}
          </button>
        ))}
      </nav>

      {/* Desktop: vertical sidebar tabs */}
      <nav className="hidden lg:flex lg:flex-col bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="px-4 py-3 border-b border-gray-100">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Mode</span>
        </div>
        {TABS.map(({ mode, label, icon }) => (
          <button
            key={mode}
            onClick={() => onModeChange(mode)}
            className={`flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-left transition-colors border-b border-gray-50 last:border-b-0 ${
              activeMode === mode
                ? 'text-blue-700 bg-blue-50 border-l-2 border-l-blue-600'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
            }`}
          >
            <span className="text-base w-5 text-center select-none">{icon}</span>
            {label}
          </button>
        ))}
      </nav>
    </>
  );
}
