import { useState, useEffect, useRef, useCallback } from 'react';
import type { PrinterLogEntry } from '../utils/printerLogger';

interface PrinterLogsProps {
  logs: PrinterLogEntry[];
  onClear: () => void;
}

const DIRECTION_STYLES = {
  sent: { bg: 'bg-blue-50', badge: 'bg-blue-100 text-blue-700', arrow: '\u2191' },
  received: { bg: 'bg-green-50', badge: 'bg-green-100 text-green-700', arrow: '\u2193' },
  event: { bg: 'bg-gray-50', badge: 'bg-gray-100 text-gray-600', arrow: '\u2022' },
} as const;

function formatTime(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
    + '.' + String(d.getMilliseconds()).padStart(3, '0');
}

export default function PrinterLogs({ logs, onClear }: PrinterLogsProps) {
  const [expanded, setExpanded] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoScroll && expanded && listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [logs.length, autoScroll, expanded]);

  const handleScroll = useCallback(() => {
    const el = listRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 30;
    setAutoScroll(atBottom);
  }, []);

  return (
    <div className="border-t border-gray-200 bg-white">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <svg
            viewBox="0 0 12 12"
            className={`w-3 h-3 text-gray-400 transition-transform ${expanded ? 'rotate-90' : ''}`}
          >
            <path d="M4 2l4 4-4 4" stroke="currentColor" strokeWidth="2" fill="none" />
          </svg>
          <span className="font-medium text-gray-700">Printer Logs</span>
          {logs.length > 0 && (
            <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">
              {logs.length}
            </span>
          )}
        </div>
        {expanded && logs.length > 0 && (
          <button
            onClick={(e) => { e.stopPropagation(); onClear(); }}
            className="text-xs text-red-500 hover:text-red-700"
          >
            Clear
          </button>
        )}
      </button>

      {expanded && (
        <div
          ref={listRef}
          onScroll={handleScroll}
          className="max-h-64 overflow-y-auto border-t border-gray-100 font-mono text-xs"
        >
          {logs.length === 0 ? (
            <p className="text-center text-gray-400 py-6">No logs yet — connect to the printer to see activity</p>
          ) : (
            logs.map((entry) => {
              const style = DIRECTION_STYLES[entry.direction];
              return (
                <div key={entry.id} className={`flex gap-2 px-3 py-1.5 border-b border-gray-50 ${style.bg}`}>
                  <span className="text-gray-400 shrink-0 w-20">{formatTime(entry.timestamp)}</span>
                  <span className={`shrink-0 px-1.5 py-0.5 rounded text-[10px] font-medium ${style.badge}`}>
                    {style.arrow} {entry.direction}
                  </span>
                  <span className="text-gray-500 shrink-0">[{entry.channel}]</span>
                  <span className="text-gray-800">{entry.message}</span>
                  {entry.data && (
                    <span className="text-gray-400 truncate" title={entry.data}>{entry.data}</span>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
