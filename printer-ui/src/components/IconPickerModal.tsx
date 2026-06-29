import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import type { IconEntry } from '../types';
import { getIconList, filterIcons } from '../utils/icons';
import { getFlagList, filterFlags, svgToDataUri } from '../utils/flags';

interface IconPickerModalProps {
  selectedIcons: IconEntry[];
  onToggle: (icon: IconEntry) => void;
  onClose: () => void;
}

const PAGE_SIZE = 120;
type Source = 'icons' | 'flags';

export default function IconPickerModal({ selectedIcons, onToggle, onClose }: IconPickerModalProps) {
  const [source, setSource] = useState<Source>('icons');
  const [allIcons, setAllIcons] = useState<IconEntry[]>([]);
  const [allFlags, setAllFlags] = useState<IconEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const loaderRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getIconList().then((icons) => {
      setAllIcons(icons);
      if (source === 'icons') setLoading(false);
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (source === 'flags' && allFlags.length === 0) {
      setLoading(true);
      getFlagList().then((flags) => {
        setAllFlags(flags);
        setLoading(false);
      });
    } else if (source === 'icons') {
      setLoading(allIcons.length === 0);
    }
    setSearch('');
    setVisibleCount(PAGE_SIZE);
  }, [source]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-focus search on open
  useEffect(() => {
    searchRef.current?.focus();
  }, []);

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Prevent body scroll while open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  const filtered = useMemo(
    () => source === 'flags' ? filterFlags(allFlags, search) : filterIcons(allIcons, search),
    [source, allIcons, allFlags, search],
  );
  const visibleIcons = useMemo(() => filtered.slice(0, visibleCount), [filtered, visibleCount]);

  useEffect(() => { setVisibleCount(PAGE_SIZE); }, [search]);

  // Infinite scroll inside the grid
  useEffect(() => {
    const el = loaderRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && visibleCount < filtered.length) {
          setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, filtered.length));
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [visibleCount, filtered.length]);

  const isSelected = useCallback(
    (icon: IconEntry) => selectedIcons.some((s) =>
      icon.svg ? s.name === icon.name : s.path === icon.path
    ),
    [selectedIcons],
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Sheet on mobile, centered dialog on sm+ */}
      <div className="bg-white w-full sm:rounded-2xl sm:max-w-2xl sm:max-h-[88vh] max-h-[92dvh] flex flex-col shadow-2xl rounded-t-2xl">

        {/* Drag handle (mobile only) */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-gray-300" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Add Icons</h2>
            {selectedIcons.length > 0 && (
              <p className="text-xs text-gray-500 mt-0.5">
                {selectedIcons.length} icon{selectedIcons.length !== 1 ? 's' : ''} selected
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="Close"
          >
            <svg viewBox="0 0 16 16" className="w-4 h-4">
              <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="2" fill="none" />
            </svg>
          </button>
        </div>

        {/* Source tabs */}
        <div className="flex border-b border-gray-100 px-4 gap-1 pt-1">
          {(['icons', 'flags'] as Source[]).map((s) => (
            <button
              key={s}
              onClick={() => setSource(s)}
              className={`px-4 py-2 text-sm font-medium capitalize rounded-t-lg transition-colors ${
                source === s
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              {s === 'flags' ? 'World Flags' : 'MDI Icons'}
            </button>
          ))}
        </div>

        {/* Search bar */}
        <div className="px-4 py-3 border-b border-gray-100">
          <div className="relative">
            <svg viewBox="0 0 20 20" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none">
              <path
                d="M12.9 14.32a8 8 0 111.41-1.41l4.38 4.37-1.41 1.42-4.38-4.38zM8 14a6 6 0 100-12 6 6 0 000 12z"
                fill="currentColor"
              />
            </svg>
            <input
              ref={searchRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search icons…"
              className="w-full pl-9 pr-9 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label="Clear search"
              >
                <svg viewBox="0 0 16 16" className="w-3.5 h-3.5">
                  <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="2" fill="none" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Icon grid */}
        <div className="flex-1 overflow-y-auto min-h-0 p-3">
          {loading ? (
            <div className="flex items-center justify-center h-40 text-sm text-gray-500">
              Loading icons…
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 gap-2 text-gray-400">
              <svg viewBox="0 0 24 24" className="w-8 h-8 opacity-40">
                <path d="M9.5 3A6.5 6.5 0 0116 9.5c0 1.61-.59 3.09-1.56 4.23l.27.27h.79l5 5-1.5 1.5-5-5v-.79l-.27-.27A6.516 6.516 0 019.5 16 6.5 6.5 0 013 9.5 6.5 6.5 0 019.5 3m0 2C7 5 5 7 5 9.5S7 14 9.5 14 14 12 14 9.5 12 5 9.5 5z" fill="currentColor" />
              </svg>
              <span className="text-sm">No icons match &ldquo;{search}&rdquo;</span>
            </div>
          ) : (
            <>
              <div className={source === 'flags'
                ? 'grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-1'
                : 'grid grid-cols-8 sm:grid-cols-10 md:grid-cols-12 gap-1'
              }>
                {visibleIcons.map((icon) => {
                  const selected = isSelected(icon);
                  return (
                    <button
                      key={icon.name}
                      onClick={() => onToggle(icon)}
                      title={icon.name}
                      className={`relative flex flex-col items-center justify-center gap-0.5 p-1.5 rounded-lg transition-all ${
                        selected
                          ? 'bg-blue-100 ring-2 ring-blue-500 ring-inset'
                          : 'hover:bg-gray-100 active:bg-gray-200'
                      }`}
                    >
                      {icon.svg ? (
                        <img
                          src={svgToDataUri(icon.svg)}
                          alt={icon.name}
                          className="w-full h-auto object-contain"
                          style={{ aspectRatio: '4/3' }}
                        />
                      ) : (
                        <svg viewBox="0 0 24 24" className="w-full aspect-square">
                          <path d={icon.path} fill="currentColor" />
                        </svg>
                      )}
                      {icon.svg && (
                        <span className="text-[9px] text-gray-500 leading-tight text-center truncate w-full">
                          {icon.name}
                        </span>
                      )}
                      {selected && (
                        <div className="absolute top-0.5 right-0.5 w-3.5 h-3.5 bg-blue-600 rounded-full flex items-center justify-center">
                          <svg viewBox="0 0 12 12" className="w-2.5 h-2.5 text-white">
                            <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" fill="none" />
                          </svg>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
              <div ref={loaderRef} className="py-3 text-center text-xs text-gray-400">
                {visibleCount < filtered.length
                  ? `Showing ${visibleCount} of ${filtered.length.toLocaleString()} — scroll for more`
                  : `${filtered.length.toLocaleString()} icon${filtered.length !== 1 ? 's' : ''}`}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-4 border-t border-gray-100 flex items-center justify-between gap-3">
          <span className="text-sm text-gray-500">
            {!loading && `${filtered.length.toLocaleString()} found`}
          </span>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-500 transition-colors"
          >
            Done{selectedIcons.length > 0 ? ` (${selectedIcons.length})` : ''}
          </button>
        </div>
      </div>
    </div>
  );
}
