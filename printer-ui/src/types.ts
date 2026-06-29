export type PrintMode = 'text' | 'image' | 'icon' | 'qr' | 'barcode' | 'datamatrix' | 'latex' | 'receipt';

export type DitherMethod = 'threshold' | 'steinberg' | 'bayer' | 'atkinson' | 'pattern';

export interface PrintOptions {
  dither: DitherMethod;
  brightness: number;
  intensity: number;
}

export interface TextOptions {
  text: string;
  fontSize: number;
  fontFamily: string;
  bold: boolean;
  italic: boolean;
  align: CanvasTextAlign;
  lineHeight: number;
  width: number;
  padding: number;
  rotation: 0 | 90 | 270;
}

export interface ImageOptions {
  rotation: 0 | 90 | 180 | 270;
  invert: boolean;
  width: number;
  aspectRatioLocked: boolean;
  padding: number;
}

export type IconSize = number;

export interface IconEntry {
  name: string;
  path: string;
  /** Full SVG string — present for flags, absent for MDI icons */
  svg?: string;
}

export interface IconOptions {
  size: IconSize;
  columns: number;
  spacing: number;
  selectedIcons: IconEntry[];
}

export const PRINTER_WIDTH = 384;

export const DEFAULT_PRINT_OPTIONS: PrintOptions = {
  dither: 'steinberg',
  brightness: 128,
  intensity: 93,
};

export const DEFAULT_TEXT_OPTIONS: TextOptions = {
  text: '',
  fontSize: 24,
  fontFamily: 'sans-serif',
  bold: false,
  italic: false,
  align: 'left',
  lineHeight: 1.4,
  width: PRINTER_WIDTH,
  padding: 0,
  rotation: 0,
};

export const DEFAULT_IMAGE_OPTIONS: ImageOptions = {
  rotation: 0,
  invert: false,
  width: PRINTER_WIDTH,
  aspectRatioLocked: true,
  padding: 0,
};

export const DEFAULT_ICON_OPTIONS: IconOptions = {
  size: 32,
  columns: 4,
  spacing: 16,
  selectedIcons: [],
};

export type QrType = 'text' | 'url' | 'wifi' | 'email' | 'phone' | 'sms' | 'vcard';

export type QrErrorLevel = 'L' | 'M' | 'Q' | 'H';

export interface QrOptions {
  type: QrType;
  size: number;
  errorLevel: QrErrorLevel;
  margin: number;
  // Text / URL
  content: string;
  // WiFi
  wifiSsid: string;
  wifiPassword: string;
  wifiEncryption: 'WPA' | 'WEP' | 'nopass';
  wifiHidden: boolean;
  // Email
  emailAddress: string;
  emailSubject: string;
  emailBody: string;
  // Phone / SMS
  phoneNumber: string;
  smsBody: string;
  // vCard
  vcardName: string;
  vcardOrg: string;
  vcardPhone: string;
  vcardEmail: string;
  vcardUrl: string;
}

export const DEFAULT_QR_OPTIONS: QrOptions = {
  type: 'text',
  size: PRINTER_WIDTH,
  errorLevel: 'M',
  margin: 0,
  content: '',
  wifiSsid: '',
  wifiPassword: '',
  wifiEncryption: 'WPA',
  wifiHidden: false,
  emailAddress: '',
  emailSubject: '',
  emailBody: '',
  phoneNumber: '',
  smsBody: '',
  vcardName: '',
  vcardOrg: '',
  vcardPhone: '',
  vcardEmail: '',
  vcardUrl: '',
};

export type BarcodeFormat =
  | 'code128'
  | 'code39'
  | 'ean13'
  | 'ean8'
  | 'upca'
  | 'upce'
  | 'itf14'
  | 'interleaved2of5'
  | 'code93'
  | 'codabar'
  | 'pdf417';

export interface BarcodeOptions {
  format: BarcodeFormat;
  content: string;
  scaleX: number;
  scaleY: number;
  includeText: boolean;
  height: number;
}

export const DEFAULT_BARCODE_OPTIONS: BarcodeOptions = {
  format: 'code128',
  content: '',
  scaleX: 3,
  scaleY: 3,
  includeText: true,
  height: 15,
};

export interface DataMatrixOptions {
  content: string;
  scale: number;
  rectangular: boolean;
}

export const DEFAULT_DATAMATRIX_OPTIONS: DataMatrixOptions = {
  content: '',
  scale: 4,
  rectangular: false,
};

export interface LatexOptions {
  latex: string;
  fontSize: number;
  displayMode: boolean;
  align: 'left' | 'center' | 'right';
  padding: number;
}

export const DEFAULT_LATEX_OPTIONS: LatexOptions = {
  latex: '',
  fontSize: 20,
  displayMode: true,
  align: 'center',
  padding: 8,
};

export type DividerStyle = 'dashed' | 'solid' | 'double';

export interface ReceiptItem {
  name: string;
  qty: number;
  price: number;
}

export interface ReceiptOptions {
  title: string;
  subtitle: string;
  showDateTime: boolean;
  dividerStyle: DividerStyle;
  currencySymbol: string;
  items: ReceiptItem[];
  taxRate: number;
  discount: number;
  paymentMethod: string;
  amountTendered: number;
  footerText: string;
  showBarcode: boolean;
  receiptNumber: string;
}

export const DEFAULT_RECEIPT_OPTIONS: ReceiptOptions = {
  title: 'MY STORE',
  subtitle: '123 Main St',
  showDateTime: true,
  dividerStyle: 'dashed',
  currencySymbol: '$',
  items: [{ name: 'Item', qty: 1, price: 0 }],
  taxRate: 10,
  discount: 0,
  paymentMethod: 'Cash',
  amountTendered: 0,
  footerText: 'Thank you for shopping!',
  showBarcode: false,
  receiptNumber: '',
};
