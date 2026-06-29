import { useState, useEffect, useCallback } from 'react';
import AdvancedOptions from './AdvancedOptions';
import { renderReceiptToCanvas } from '../utils/canvas';
import type { PrintOptions, ReceiptOptions, ReceiptItem, DividerStyle } from '../types';
import { DEFAULT_RECEIPT_OPTIONS } from '../types';

interface ReceiptModeProps {
  printOptions: PrintOptions;
  onPrintOptionsChange: (options: PrintOptions) => void;
  onPreviewUpdate: (canvas: HTMLCanvasElement | null) => void;
  onPrint: () => void;
  isPrinting: boolean;
}

export default function ReceiptMode({
  printOptions,
  onPrintOptionsChange,
  onPreviewUpdate,
  onPrint,
  isPrinting,
}: ReceiptModeProps) {
  const [options, setOptions] = useState<ReceiptOptions>(DEFAULT_RECEIPT_OPTIONS);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const updatePreview = useCallback(() => {
    try {
      const canvas = renderReceiptToCanvas(options);
      onPreviewUpdate(canvas);
    } catch {
      onPreviewUpdate(null);
    }
  }, [options, onPreviewUpdate]);

  useEffect(() => {
    updatePreview();
  }, [updatePreview]);

  const updateItem = (index: number, field: keyof ReceiptItem, value: string | number) => {
    setOptions({
      ...options,
      items: options.items.map((item, i) =>
        i === index ? { ...item, [field]: value } : item,
      ),
    });
  };

  const addItem = () => {
    setOptions({ ...options, items: [...options.items, { name: '', qty: 1, price: 0 }] });
  };

  const removeItem = (index: number) => {
    if (options.items.length > 1) {
      setOptions({ ...options, items: options.items.filter((_, i) => i !== index) });
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="space-y-2">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Store Title</label>
          <input
            type="text"
            value={options.title}
            onChange={(e) => setOptions({ ...options, title: e.target.value })}
            placeholder="MY STORE"
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Subtitle / Address</label>
          <input
            type="text"
            value={options.subtitle}
            onChange={(e) => setOptions({ ...options, subtitle: e.target.value })}
            placeholder="123 Main St"
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Currency Symbol</label>
          <input
            type="text"
            value={options.currencySymbol}
            onChange={(e) => setOptions({ ...options, currencySymbol: e.target.value })}
            maxLength={3}
            className="w-16 border border-gray-300 rounded px-3 py-2 text-sm"
          />
        </div>
      </div>

      {/* Layout */}
      <div className="border-t border-gray-100 pt-3 space-y-2">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Divider Style</label>
          <div className="flex gap-1">
            {(['dashed', 'solid', 'double'] as DividerStyle[]).map((style) => (
              <button
                key={style}
                onClick={() => setOptions({ ...options, dividerStyle: style })}
                className={`flex-1 py-1.5 text-sm rounded border ${
                  options.dividerStyle === style
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'border-gray-300 hover:bg-gray-100'
                }`}
              >
                {style.charAt(0).toUpperCase() + style.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={options.showDateTime}
            onChange={(e) => setOptions({ ...options, showDateTime: e.target.checked })}
            className="rounded"
          />
          Show date &amp; time
        </label>
      </div>

      {/* Items */}
      <div className="border-t border-gray-100 pt-3">
        <label className="block text-xs font-medium text-gray-600 mb-2">Items</label>
        <div className="space-y-1.5">
          <div className="flex gap-1 text-xs text-gray-400 px-0.5">
            <span className="flex-1">Name</span>
            <span className="w-12 text-center">Qty</span>
            <span className="w-20 text-center">Price</span>
            <span className="w-5" />
          </div>
          {options.items.map((item, i) => (
            <div key={i} className="flex gap-1 items-center">
              <input
                type="text"
                value={item.name}
                onChange={(e) => updateItem(i, 'name', e.target.value)}
                placeholder="Item name"
                className="flex-1 border border-gray-300 rounded px-2 py-1.5 text-sm min-w-0"
              />
              <input
                type="number"
                value={item.qty}
                onChange={(e) => updateItem(i, 'qty', Math.max(1, Number(e.target.value)))}
                min={1}
                className="w-12 border border-gray-300 rounded px-2 py-1.5 text-sm text-center"
              />
              <input
                type="number"
                value={item.price}
                onChange={(e) => updateItem(i, 'price', Math.max(0, Number(e.target.value)))}
                min={0}
                step={0.01}
                placeholder="0.00"
                className="w-20 border border-gray-300 rounded px-2 py-1.5 text-sm"
              />
              <button
                onClick={() => removeItem(i)}
                disabled={options.items.length === 1}
                className="text-red-400 hover:text-red-600 disabled:opacity-30 px-1 text-sm"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        <button
          onClick={addItem}
          className="mt-2 text-sm text-blue-600 hover:text-blue-800"
        >
          + Add Item
        </button>
      </div>

      {/* Summary */}
      <div className="border-t border-gray-100 pt-3 grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Tax Rate (%)</label>
          <input
            type="number"
            value={options.taxRate}
            onChange={(e) => setOptions({ ...options, taxRate: Math.max(0, Number(e.target.value)) })}
            min={0}
            max={100}
            step={0.5}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Discount ({options.currencySymbol})</label>
          <input
            type="number"
            value={options.discount}
            onChange={(e) => setOptions({ ...options, discount: Math.max(0, Number(e.target.value)) })}
            min={0}
            step={0.01}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
          />
        </div>
      </div>

      {/* Payment */}
      <div className="border-t border-gray-100 pt-3 grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Payment Method</label>
          <input
            type="text"
            value={options.paymentMethod}
            onChange={(e) => setOptions({ ...options, paymentMethod: e.target.value })}
            placeholder="Cash"
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Amount Tendered</label>
          <input
            type="number"
            value={options.amountTendered}
            onChange={(e) => setOptions({ ...options, amountTendered: Math.max(0, Number(e.target.value)) })}
            min={0}
            step={0.01}
            placeholder="0.00"
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
          />
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-100 pt-3">
        <label className="block text-xs font-medium text-gray-600 mb-1">Footer Text</label>
        <input
          type="text"
          value={options.footerText}
          onChange={(e) => setOptions({ ...options, footerText: e.target.value })}
          placeholder="Thank you for shopping!"
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
        />
      </div>

      {/* Receipt # / Barcode */}
      <div className="border-t border-gray-100 pt-3 space-y-2">
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={options.showBarcode}
            onChange={(e) => setOptions({ ...options, showBarcode: e.target.checked })}
            className="rounded"
          />
          Print receipt barcode
        </label>
        {options.showBarcode && (
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Receipt Number</label>
            <input
              type="text"
              value={options.receiptNumber}
              onChange={(e) => setOptions({ ...options, receiptNumber: e.target.value })}
              placeholder="e.g. 000123"
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            />
          </div>
        )}
      </div>

      {/* Advanced */}
      <div className="border-t border-gray-100 pt-3">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          {showAdvanced ? 'Hide Advanced' : 'Show Advanced'}
        </button>
        {showAdvanced && (
          <div className="mt-3">
            <AdvancedOptions options={printOptions} onChange={onPrintOptionsChange} />
          </div>
        )}
      </div>

      <button
        onClick={onPrint}
        disabled={isPrinting || options.items.length === 0}
        className="w-full py-2.5 bg-blue-600 text-white rounded font-medium hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPrinting ? 'Printing...' : 'Print Receipt'}
      </button>
    </div>
  );
}
