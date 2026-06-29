interface PrinterBarProps {
  isConnected: boolean;
  isPrinting: boolean;
  statusMessage: string;
  batteryLow: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
}

export default function PrinterBar({
  isConnected,
  isPrinting,
  statusMessage,
  batteryLow,
  onConnect,
  onDisconnect,
}: PrinterBarProps) {
  return (
    <header className="bg-gray-900 text-white">
      <div className="max-w-[1400px] mx-auto px-4 py-3 flex items-center gap-3">
        <span className="text-sm font-semibold tracking-wide text-gray-300 hidden sm:block shrink-0">
          MXW01 Printer
        </span>
        <span className="hidden sm:block text-gray-600 shrink-0">·</span>

        <div
          className={`w-2.5 h-2.5 rounded-full shrink-0 ${
            isConnected ? 'bg-green-400' : 'bg-red-400'
          }`}
        />
        <span className="text-sm flex-1 truncate text-gray-300">{statusMessage}</span>

        {isConnected && (
          <span
            className="text-lg shrink-0"
            title={batteryLow ? 'Battery low' : 'Battery OK'}
          >
            {batteryLow ? '🪫' : '🔋'}
          </span>
        )}

        <button
          onClick={isConnected ? onDisconnect : onConnect}
          disabled={isPrinting}
          className="px-4 py-1.5 rounded text-sm font-medium transition-colors shrink-0 disabled:opacity-50 disabled:cursor-not-allowed bg-blue-600 hover:bg-blue-500"
        >
          {isConnected ? 'Disconnect' : 'Connect'}
        </button>
      </div>
    </header>
  );
}
