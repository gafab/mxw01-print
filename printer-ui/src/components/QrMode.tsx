import { useState, useEffect, useCallback } from 'react';
import AdvancedOptions from './AdvancedOptions';
import { renderQrToCanvas } from '../utils/canvas';
import type { PrintOptions, QrOptions, QrType, QrErrorLevel } from '../types';
import { DEFAULT_QR_OPTIONS, PRINTER_WIDTH } from '../types';

interface QrModeProps {
  printOptions: PrintOptions;
  onPrintOptionsChange: (options: PrintOptions) => void;
  onPreviewUpdate: (canvas: HTMLCanvasElement | null) => void;
  onPrint: () => void;
  isPrinting: boolean;
}

const QR_TYPES: { value: QrType; label: string }[] = [
  { value: 'text', label: 'Text' },
  { value: 'url', label: 'URL' },
  { value: 'wifi', label: 'WiFi' },
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone' },
  { value: 'sms', label: 'SMS' },
  { value: 'vcard', label: 'vCard' },
];

const ERROR_LEVELS: { value: QrErrorLevel; label: string }[] = [
  { value: 'L', label: 'Low (7%)' },
  { value: 'M', label: 'Medium (15%)' },
  { value: 'Q', label: 'Quartile (25%)' },
  { value: 'H', label: 'High (30%)' },
];

export default function QrMode({
  printOptions,
  onPrintOptionsChange,
  onPreviewUpdate,
  onPrint,
  isPrinting,
}: QrModeProps) {
  const [options, setOptions] = useState<QrOptions>(DEFAULT_QR_OPTIONS);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [error, setError] = useState('');

  const updatePreview = useCallback(async () => {
    try {
      setError('');
      const canvas = await renderQrToCanvas(options);
      if (canvas.height <= 1) {
        onPreviewUpdate(null);
      } else {
        onPreviewUpdate(canvas);
      }
    } catch {
      setError('Could not generate QR code — check your input');
      onPreviewUpdate(null);
    }
  }, [options, onPreviewUpdate]);

  useEffect(() => {
    updatePreview();
  }, [updatePreview]);

  const hasContent = (): boolean => {
    switch (options.type) {
      case 'text':
      case 'url':
        return !!options.content.trim();
      case 'wifi':
        return !!options.wifiSsid.trim();
      case 'email':
        return !!options.emailAddress.trim();
      case 'phone':
      case 'sms':
        return !!options.phoneNumber.trim();
      case 'vcard':
        return !!options.vcardName.trim();
      default:
        return false;
    }
  };

  const inputClass = 'w-full border border-gray-300 rounded px-3 py-2 text-sm';
  const labelClass = 'block text-xs font-medium text-gray-600 mb-1';

  return (
    <div className="space-y-4">
      {/* QR Type selector */}
      <div className="flex flex-wrap gap-1.5">
        {QR_TYPES.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setOptions({ ...options, type: value })}
            className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
              options.type === value
                ? 'bg-blue-600 text-white border-blue-600'
                : 'border-gray-300 hover:bg-gray-100'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Type-specific fields */}
      {(options.type === 'text' || options.type === 'url') && (
        <div>
          <label className={labelClass}>
            {options.type === 'url' ? 'URL' : 'Text Content'}
          </label>
          {options.type === 'url' ? (
            <input
              type="url"
              value={options.content}
              onChange={(e) => setOptions({ ...options, content: e.target.value })}
              placeholder="https://example.com"
              className={inputClass}
            />
          ) : (
            <textarea
              value={options.content}
              onChange={(e) => setOptions({ ...options, content: e.target.value })}
              placeholder="Enter text..."
              rows={3}
              className={`${inputClass} resize-y`}
            />
          )}
        </div>
      )}

      {options.type === 'wifi' && (
        <div className="space-y-3">
          <div>
            <label className={labelClass}>Network Name (SSID)</label>
            <input
              type="text"
              value={options.wifiSsid}
              onChange={(e) => setOptions({ ...options, wifiSsid: e.target.value })}
              placeholder="MyNetwork"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Password</label>
            <input
              type="text"
              value={options.wifiPassword}
              onChange={(e) => setOptions({ ...options, wifiPassword: e.target.value })}
              placeholder="Password"
              className={inputClass}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Encryption</label>
              <select
                value={options.wifiEncryption}
                onChange={(e) => setOptions({ ...options, wifiEncryption: e.target.value as 'WPA' | 'WEP' | 'nopass' })}
                className={inputClass}
              >
                <option value="WPA">WPA/WPA2</option>
                <option value="WEP">WEP</option>
                <option value="nopass">None</option>
              </select>
            </div>
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={options.wifiHidden}
                  onChange={(e) => setOptions({ ...options, wifiHidden: e.target.checked })}
                  className="rounded"
                />
                Hidden network
              </label>
            </div>
          </div>
        </div>
      )}

      {options.type === 'email' && (
        <div className="space-y-3">
          <div>
            <label className={labelClass}>Email Address</label>
            <input
              type="email"
              value={options.emailAddress}
              onChange={(e) => setOptions({ ...options, emailAddress: e.target.value })}
              placeholder="user@example.com"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Subject (optional)</label>
            <input
              type="text"
              value={options.emailSubject}
              onChange={(e) => setOptions({ ...options, emailSubject: e.target.value })}
              placeholder="Subject"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Body (optional)</label>
            <textarea
              value={options.emailBody}
              onChange={(e) => setOptions({ ...options, emailBody: e.target.value })}
              placeholder="Message body..."
              rows={2}
              className={`${inputClass} resize-y`}
            />
          </div>
        </div>
      )}

      {(options.type === 'phone' || options.type === 'sms') && (
        <div className="space-y-3">
          <div>
            <label className={labelClass}>Phone Number</label>
            <input
              type="tel"
              value={options.phoneNumber}
              onChange={(e) => setOptions({ ...options, phoneNumber: e.target.value })}
              placeholder="+1234567890"
              className={inputClass}
            />
          </div>
          {options.type === 'sms' && (
            <div>
              <label className={labelClass}>Message (optional)</label>
              <textarea
                value={options.smsBody}
                onChange={(e) => setOptions({ ...options, smsBody: e.target.value })}
                placeholder="SMS body..."
                rows={2}
                className={`${inputClass} resize-y`}
              />
            </div>
          )}
        </div>
      )}

      {options.type === 'vcard' && (
        <div className="space-y-3">
          <div>
            <label className={labelClass}>Full Name</label>
            <input
              type="text"
              value={options.vcardName}
              onChange={(e) => setOptions({ ...options, vcardName: e.target.value })}
              placeholder="John Doe"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Organization (optional)</label>
            <input
              type="text"
              value={options.vcardOrg}
              onChange={(e) => setOptions({ ...options, vcardOrg: e.target.value })}
              placeholder="Company Inc."
              className={inputClass}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Phone (optional)</label>
              <input
                type="tel"
                value={options.vcardPhone}
                onChange={(e) => setOptions({ ...options, vcardPhone: e.target.value })}
                placeholder="+1234567890"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Email (optional)</label>
              <input
                type="email"
                value={options.vcardEmail}
                onChange={(e) => setOptions({ ...options, vcardEmail: e.target.value })}
                placeholder="user@example.com"
                className={inputClass}
              />
            </div>
          </div>
          <div>
            <label className={labelClass}>Website (optional)</label>
            <input
              type="url"
              value={options.vcardUrl}
              onChange={(e) => setOptions({ ...options, vcardUrl: e.target.value })}
              placeholder="https://example.com"
              className={inputClass}
            />
          </div>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      {/* Size + Error Level + Margin */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>QR Size: {options.size}px</label>
          <input
            type="range"
            min={100}
            max={PRINTER_WIDTH}
            value={options.size}
            onChange={(e) => setOptions({ ...options, size: Number(e.target.value) })}
            className="w-full"
          />
        </div>
        <div>
          <label className={labelClass}>Error Correction</label>
          <select
            value={options.errorLevel}
            onChange={(e) => setOptions({ ...options, errorLevel: e.target.value as QrErrorLevel })}
            className={inputClass}
          >
            {ERROR_LEVELS.map((l) => (
              <option key={l.value} value={l.value}>{l.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className={labelClass}>Margin: {options.margin} modules</label>
        <input
          type="range"
          min={0}
          max={10}
          value={options.margin}
          onChange={(e) => setOptions({ ...options, margin: Number(e.target.value) })}
          className="w-full"
        />
      </div>

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
        disabled={isPrinting || !hasContent()}
        className="w-full py-2.5 bg-blue-600 text-white rounded font-medium hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPrinting ? 'Printing...' : 'Print QR'}
      </button>
    </div>
  );
}
