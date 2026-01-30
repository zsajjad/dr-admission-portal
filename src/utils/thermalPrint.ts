/**
 * Thermal Printer Utility with ESC/POS Direct Printing
 *
 * This utility provides two printing methods:
 * 1. ESC/POS direct printing via Web Serial API (preferred for thermal printers)
 * 2. Browser print dialog fallback
 *
 * Based on POS-80XX Series Thermal Receipt Printer programming manual
 */
import QRCode from 'qrcode';

// ============================================================================
// Web Serial API Type Declarations
// ============================================================================

interface SerialPortInfo {
  usbVendorId?: number;
  usbProductId?: number;
}

interface SerialOptions {
  baudRate: number;
  dataBits?: 7 | 8;
  stopBits?: 1 | 2;
  parity?: 'none' | 'even' | 'odd';
  bufferSize?: number;
  flowControl?: 'none' | 'hardware';
}

interface SerialPort {
  readonly readable: ReadableStream<Uint8Array> | null;
  readonly writable: WritableStream<Uint8Array> | null;
  getInfo(): SerialPortInfo;
  open(options: SerialOptions): Promise<void>;
  close(): Promise<void>;
}

interface Serial {
  getPorts(): Promise<SerialPort[]>;
  requestPort(options?: { filters?: { usbVendorId?: number; usbProductId?: number }[] }): Promise<SerialPort>;
}

// ============================================================================
// WebUSB API Type Declarations
// ============================================================================

interface USBDeviceFilter {
  vendorId?: number;
  productId?: number;
  classCode?: number;
  subclassCode?: number;
  protocolCode?: number;
  serialNumber?: string;
}

interface USBDeviceRequestOptions {
  filters: USBDeviceFilter[];
}

interface USBEndpoint {
  endpointNumber: number;
  direction: 'in' | 'out';
  type: 'bulk' | 'interrupt' | 'isochronous';
  packetSize: number;
}

interface USBAlternateInterface {
  alternateSetting: number;
  interfaceClass: number;
  interfaceSubclass: number;
  interfaceProtocol: number;
  interfaceName?: string;
  endpoints: USBEndpoint[];
}

interface USBInterface {
  interfaceNumber: number;
  alternate: USBAlternateInterface;
  alternates: USBAlternateInterface[];
  claimed: boolean;
}

interface USBConfiguration {
  configurationValue: number;
  configurationName?: string;
  interfaces: USBInterface[];
}

interface USBDevice {
  readonly vendorId: number;
  readonly productId: number;
  readonly deviceClass: number;
  readonly deviceSubclass: number;
  readonly deviceProtocol: number;
  readonly deviceVersionMajor: number;
  readonly deviceVersionMinor: number;
  readonly deviceVersionSubminor: number;
  readonly manufacturerName?: string;
  readonly productName?: string;
  readonly serialNumber?: string;
  readonly configuration?: USBConfiguration;
  readonly configurations: USBConfiguration[];
  readonly opened: boolean;

  open(): Promise<void>;
  close(): Promise<void>;
  selectConfiguration(configurationValue: number): Promise<void>;
  claimInterface(interfaceNumber: number): Promise<void>;
  releaseInterface(interfaceNumber: number): Promise<void>;
  selectAlternateInterface(interfaceNumber: number, alternateSetting: number): Promise<void>;
  controlTransferIn(setup: USBControlTransferParameters, length: number): Promise<USBInTransferResult>;
  controlTransferOut(setup: USBControlTransferParameters, data?: BufferSource): Promise<USBOutTransferResult>;
  transferIn(endpointNumber: number, length: number): Promise<USBInTransferResult>;
  transferOut(endpointNumber: number, data: BufferSource): Promise<USBOutTransferResult>;
  clearHalt(direction: 'in' | 'out', endpointNumber: number): Promise<void>;
  reset(): Promise<void>;
}

interface USBControlTransferParameters {
  requestType: 'standard' | 'class' | 'vendor';
  recipient: 'device' | 'interface' | 'endpoint' | 'other';
  request: number;
  value: number;
  index: number;
}

interface USBInTransferResult {
  data?: DataView;
  status: 'ok' | 'stall' | 'babble';
}

interface USBOutTransferResult {
  bytesWritten: number;
  status: 'ok' | 'stall';
}

interface USB {
  getDevices(): Promise<USBDevice[]>;
  requestDevice(options: USBDeviceRequestOptions): Promise<USBDevice>;
}

declare global {
  interface Navigator {
    serial?: Serial;
    usb: USB;
  }
}

// ============================================================================
// Types and Interfaces
// ============================================================================

export interface QRPrintData {
  gr: string;
}

export interface PrinterConfig {
  paperWidth: 58 | 80; // mm
  charsPerLine: number;
  dpi: number;
  baudRate: number; // Common: 9600, 19200, 38400, 57600, 115200
}

export interface ThermalPrinterConnection {
  port: SerialPort;
  writer: WritableStreamDefaultWriter<Uint8Array>;
  reader: ReadableStreamDefaultReader<Uint8Array>;
}

export type TextAlign = 'left' | 'center' | 'right';
export type TextSize = 'normal' | 'double-width' | 'double-height' | 'double';
export type CutMode = 'full' | 'partial';

// ============================================================================
// ESC/POS Command Constants (from POS-80XX manual)
// ============================================================================

const ESC = 0x1b; // Escape
const GS = 0x1d; // Group Separator
const LF = 0x0a; // Line Feed
const CR = 0x0d; // Carriage Return
const HT = 0x09; // Horizontal Tab
const NUL = 0x00; // Null

/** ESC/POS Commands based on the thermal printer manual */
const COMMANDS = {
  /** ESC @ - Initialize printer */
  INIT: new Uint8Array([ESC, 0x40]),

  /** ESC = 1 - Enable printer (peripheral device) - CRITICAL for printing to work */
  ENABLE_PRINTER: new Uint8Array([ESC, 0x3d, 0x01]),

  /** ESC t 0 - Select character code table (PC437 US Standard) */
  CODE_TABLE_PC437: new Uint8Array([ESC, 0x74, 0x00]),

  /** ESC ! 0 - Select print mode (normal) */
  PRINT_MODE_NORMAL: new Uint8Array([ESC, 0x21, 0x00]),

  /** LF - Print and line feed */
  LINE_FEED: new Uint8Array([LF]),

  /** ESC d n - Print and feed n lines */
  feedLines: (n: number) => new Uint8Array([ESC, 0x64, n]),

  /** ESC a n - Select justification (0=left, 1=center, 2=right) */
  ALIGN_LEFT: new Uint8Array([ESC, 0x61, 0]),
  ALIGN_CENTER: new Uint8Array([ESC, 0x61, 1]),
  ALIGN_RIGHT: new Uint8Array([ESC, 0x61, 2]),

  /** ESC E n - Turn emphasized (bold) mode on/off */
  BOLD_ON: new Uint8Array([ESC, 0x45, 1]),
  BOLD_OFF: new Uint8Array([ESC, 0x45, 0]),

  /** ESC - n - Turn underline mode on/off */
  UNDERLINE_OFF: new Uint8Array([ESC, 0x2d, 0]),
  UNDERLINE_1DOT: new Uint8Array([ESC, 0x2d, 1]),
  UNDERLINE_2DOT: new Uint8Array([ESC, 0x2d, 2]),

  /** GS ! n - Select character size */
  SIZE_NORMAL: new Uint8Array([GS, 0x21, 0x00]),
  SIZE_DOUBLE_WIDTH: new Uint8Array([GS, 0x21, 0x10]),
  SIZE_DOUBLE_HEIGHT: new Uint8Array([GS, 0x21, 0x01]),
  SIZE_DOUBLE: new Uint8Array([GS, 0x21, 0x11]),

  /** GS B n - Turn white/black reverse printing mode on/off */
  REVERSE_ON: new Uint8Array([GS, 0x42, 1]),
  REVERSE_OFF: new Uint8Array([GS, 0x42, 0]),

  /** ESC { n - Turn upside-down printing mode on/off */
  UPSIDE_DOWN_ON: new Uint8Array([ESC, 0x7b, 1]),
  UPSIDE_DOWN_OFF: new Uint8Array([ESC, 0x7b, 0]),

  /** GS V m - Select cut mode and cut paper */
  CUT_FULL: new Uint8Array([GS, 0x56, 0]),
  CUT_PARTIAL: new Uint8Array([GS, 0x56, 1]),

  /** GS V m n - Feed paper and cut */
  cutWithFeed: (feedDots: number) => new Uint8Array([GS, 0x56, 66, feedDots]),

  /** ESC p m t1 t2 - Generate pulse (open cash drawer) */
  openDrawer: (pin: 0 | 1 = 0) => new Uint8Array([ESC, 0x70, pin, 25, 250]),

  /** ESC 2 - Select default line spacing (1/6 inch) */
  LINE_SPACING_DEFAULT: new Uint8Array([ESC, 0x32]),

  /** ESC 3 n - Set line spacing to n dots */
  lineSpacing: (n: number) => new Uint8Array([ESC, 0x33, n]),

  /** GS h n - Set barcode height (in dots) */
  barcodeHeight: (n: number) => new Uint8Array([GS, 0x68, n]),

  /** GS w n - Set barcode width (2-6) */
  barcodeWidth: (n: number) => new Uint8Array([GS, 0x77, Math.max(2, Math.min(6, n))]),

  /** GS H n - Select HRI character print position */
  HRI_NONE: new Uint8Array([GS, 0x48, 0]),
  HRI_ABOVE: new Uint8Array([GS, 0x48, 1]),
  HRI_BELOW: new Uint8Array([GS, 0x48, 2]),
  HRI_BOTH: new Uint8Array([GS, 0x48, 3]),

  /** GS f n - Select font for HRI characters */
  HRI_FONT_A: new Uint8Array([GS, 0x66, 0]),
  HRI_FONT_B: new Uint8Array([GS, 0x66, 1]),
} as const;

// ============================================================================
// Printer Configuration Presets
// ============================================================================

export const PRINTER_CONFIGS: Record<string, PrinterConfig> = {
  '58mm': { paperWidth: 58, charsPerLine: 32, dpi: 203, baudRate: 115200 },
  '80mm': { paperWidth: 80, charsPerLine: 48, dpi: 203, baudRate: 115200 },
};

// POS-80 USB identifiers (STMicroelectronics chip)
const POS80_VENDOR_ID = 0x0483; // 1155
const POS80_PRODUCT_ID = 0x5743; // 22339

// ============================================================================
// WebUSB Direct Printing Class
// ============================================================================

/**
 * WebUSB-based thermal printer for direct ESC/POS communication
 * This bypasses the OS print system and sends commands directly to the printer
 */
export class WebUSBThermalPrinter {
  private device: USBDevice | null = null;
  private interfaceNumber = 0;
  private endpointOut = 1;
  private config: PrinterConfig;
  private encoder = new TextEncoder();

  constructor(config: PrinterConfig = PRINTER_CONFIGS['80mm']) {
    this.config = config;
  }

  /**
   * Check if WebUSB is supported
   */
  static isSupported(): boolean {
    return 'usb' in navigator;
  }

  /**
   * Connect to the thermal printer via WebUSB
   * Works on Windows, macOS, and Linux
   */
  async connect(): Promise<void> {
    if (!WebUSBThermalPrinter.isSupported()) {
      throw new Error('WebUSB is not supported in this browser');
    }

    try {
      // First, try to get already paired devices
      const pairedDevices = await navigator.usb.getDevices();
      let device = pairedDevices.find((d) => d.vendorId === POS80_VENDOR_ID || d.productId === POS80_PRODUCT_ID);

      // If no paired device, request one
      if (!device) {
        device = await navigator.usb.requestDevice({
          filters: [
            { vendorId: POS80_VENDOR_ID, productId: POS80_PRODUCT_ID },
            { vendorId: POS80_VENDOR_ID }, // Any device from this vendor
            // Common thermal printer vendor IDs for better Windows compatibility
            { vendorId: 0x0fe6 }, // ICS Advent
            { vendorId: 0x0416 }, // Winbond
            { vendorId: 0x04b8 }, // Epson
            { vendorId: 0x067b }, // Prolific (USB-Serial)
            { vendorId: 0x1a86 }, // QinHeng (CH340)
          ],
        });
      }

      this.device = device;
      await this.device.open();

      // Select configuration
      if (this.device.configuration === null) {
        await this.device.selectConfiguration(1);
      }

      // Find the printer interface and endpoint
      // Try multiple interface classes for better compatibility
      const interfaces = this.device.configuration?.interfaces || [];
      let foundInterface = false;

      for (const iface of interfaces) {
        if (foundInterface) break;

        for (const alternate of iface.alternates) {
          // Look for: printer class (7), vendor-specific (255), or CDC (10)
          if (
            alternate.interfaceClass === 7 || // Printer
            alternate.interfaceClass === 255 || // Vendor-specific
            alternate.interfaceClass === 10 || // CDC Data
            alternate.interfaceClass === 2 // CDC Control
          ) {
            this.interfaceNumber = iface.interfaceNumber;

            // Find OUT endpoint (bulk or interrupt)
            for (const endpoint of alternate.endpoints) {
              if (endpoint.direction === 'out') {
                this.endpointOut = endpoint.endpointNumber;
                foundInterface = true;
                break;
              }
            }
            if (foundInterface) break;
          }
        }
      }

      // Fallback: use first interface with OUT endpoint
      if (!foundInterface) {
        for (const iface of interfaces) {
          for (const alternate of iface.alternates) {
            for (const endpoint of alternate.endpoints) {
              if (endpoint.direction === 'out') {
                this.interfaceNumber = iface.interfaceNumber;
                this.endpointOut = endpoint.endpointNumber;
                foundInterface = true;
                break;
              }
            }
            if (foundInterface) break;
          }
          if (foundInterface) break;
        }
      }

      // Claim the interface (this is where Windows often fails without WinUSB)
      try {
        await this.device.claimInterface(this.interfaceNumber);
      } catch (claimError) {
        // On Windows, provide specific guidance
        const isWin =
          typeof navigator !== 'undefined' &&
          (navigator.platform?.toLowerCase().includes('win') || navigator.userAgent?.toLowerCase().includes('windows'));

        if (isWin) {
          throw new Error(
            'Unable to claim interface. On Windows, you may need to install WinUSB driver using Zadig (zadig.akeo.ie). ' +
              'Select your printer and install "WinUSB" driver.',
          );
        }
        throw claimError;
      }

      // Initialize printer
      await this.initialize();
    } catch (error) {
      if (error instanceof Error && error.name === 'NotFoundError') {
        throw new Error('No printer selected');
      }
      throw error;
    }
  }

  /**
   * Disconnect from the printer
   */
  async disconnect(): Promise<void> {
    if (this.device) {
      try {
        await this.device.releaseInterface(this.interfaceNumber);
        await this.device.close();
      } catch {
        // Ignore errors
      }
      this.device = null;
    }
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.device !== null && this.device.opened;
  }

  /**
   * Write raw bytes to the printer
   */
  async writeRaw(data: Uint8Array): Promise<void> {
    if (!this.device || !this.device.opened) {
      throw new Error('Printer not connected');
    }
    // Create a new ArrayBuffer to ensure compatibility with WebUSB on all platforms
    const buffer = new ArrayBuffer(data.length);
    new Uint8Array(buffer).set(data);
    await this.device.transferOut(this.endpointOut, buffer);
  }

  /**
   * Initialize the printer with full setup sequence
   * Based on POS-80XX manual - sends ESC @, ESC = 1, ESC t 0, ESC ! 0
   */
  async initialize(): Promise<void> {
    // Send all init commands in one buffer for reliability
    const initSequence = new Uint8Array([
      ...COMMANDS.INIT, // ESC @ - Initialize printer
      ...COMMANDS.ENABLE_PRINTER, // ESC = 1 - Enable printer (critical!)
      ...COMMANDS.CODE_TABLE_PC437, // ESC t 0 - Select code table
      ...COMMANDS.PRINT_MODE_NORMAL, // ESC ! 0 - Normal print mode
    ]);
    await this.writeRaw(initSequence);
  }

  /**
   * Print text
   */
  async printText(text: string, lineFeed = true): Promise<void> {
    const encoded = this.encoder.encode(text);
    await this.writeRaw(encoded);
    if (lineFeed) {
      await this.writeRaw(COMMANDS.LINE_FEED);
    }
  }

  /**
   * Print line with formatting
   */
  async printLine(
    text: string,
    options?: {
      align?: TextAlign;
      bold?: boolean;
      size?: TextSize;
    },
  ): Promise<void> {
    if (options?.align) {
      const cmd =
        options.align === 'center'
          ? COMMANDS.ALIGN_CENTER
          : options.align === 'right'
            ? COMMANDS.ALIGN_RIGHT
            : COMMANDS.ALIGN_LEFT;
      await this.writeRaw(cmd);
    }

    if (options?.bold) {
      await this.writeRaw(COMMANDS.BOLD_ON);
    }

    if (options?.size) {
      const cmd =
        options.size === 'double-width'
          ? COMMANDS.SIZE_DOUBLE_WIDTH
          : options.size === 'double-height'
            ? COMMANDS.SIZE_DOUBLE_HEIGHT
            : options.size === 'double'
              ? COMMANDS.SIZE_DOUBLE
              : COMMANDS.SIZE_NORMAL;
      await this.writeRaw(cmd);
    }

    await this.printText(text);

    // Reset
    if (options?.bold) await this.writeRaw(COMMANDS.BOLD_OFF);
    if (options?.size && options.size !== 'normal') await this.writeRaw(COMMANDS.SIZE_NORMAL);
    if (options?.align && options.align !== 'left') await this.writeRaw(COMMANDS.ALIGN_LEFT);
  }

  /**
   * Feed lines
   */
  async feedLines(n: number): Promise<void> {
    await this.writeRaw(COMMANDS.feedLines(n));
  }

  /**
   * Print empty line
   */
  async printEmptyLine(): Promise<void> {
    await this.writeRaw(COMMANDS.LINE_FEED);
  }

  /**
   * Print separator
   */
  async printSeparator(char = '-'): Promise<void> {
    const line = char.repeat(this.config.charsPerLine);
    await this.printText(line);
  }

  /**
   * Print key-value pair
   */
  async printKeyValue(label: string, value: string): Promise<void> {
    const totalWidth = this.config.charsPerLine;
    const spacesNeeded = totalWidth - label.length - value.length;

    if (spacesNeeded > 0) {
      const text = label + ' '.repeat(spacesNeeded) + value;
      await this.printText(text);
    } else {
      await this.printText(label + ': ' + value);
    }
  }

  /**
   * Print QR code using raster bit image
   */
  async printQRCode(data: string, moduleSize = 6): Promise<void> {
    const qr = await QRCode.create(data, { errorCorrectionLevel: 'M' });
    const modules = qr.modules;
    const moduleCount = modules.size;

    const scale = moduleSize;
    const qrWidth = moduleCount * scale;
    const qrHeight = moduleCount * scale;
    const bytesPerRow = Math.ceil(qrWidth / 8);

    const rasterData: number[] = [];

    for (let y = 0; y < qrHeight; y++) {
      const moduleY = Math.floor(y / scale);
      for (let byteIndex = 0; byteIndex < bytesPerRow; byteIndex++) {
        let byte = 0;
        for (let bit = 0; bit < 8; bit++) {
          const x = byteIndex * 8 + bit;
          const moduleX = Math.floor(x / scale);
          if (x < qrWidth && modules.get(moduleY, moduleX)) {
            byte |= 0x80 >> bit;
          }
        }
        rasterData.push(byte);
      }
    }

    // GS v 0 - Print raster bit image
    const xL = bytesPerRow & 0xff;
    const xH = (bytesPerRow >> 8) & 0xff;
    const yL = qrHeight & 0xff;
    const yH = (qrHeight >> 8) & 0xff;

    const command = new Uint8Array([GS, 0x76, 0x30, 0, xL, xH, yL, yH, ...rasterData]);

    await this.writeRaw(COMMANDS.ALIGN_CENTER);
    await this.writeRaw(command);
    await this.writeRaw(COMMANDS.ALIGN_LEFT);
  }

  /**
   * Print QR code with label
   */
  async printQRCodeWithLabel(data: string, label: string, size = 6): Promise<void> {
    await this.printQRCode(data, size);
    await this.printLine(label, { align: 'center', bold: true });
  }

  /**
   * Cut paper
   */
  async cut(mode: CutMode = 'partial'): Promise<void> {
    await this.feedLines(3);
    await this.writeRaw(mode === 'full' ? COMMANDS.CUT_FULL : COMMANDS.CUT_PARTIAL);
  }
}

// ============================================================================
// Thermal Printer Class - ESC/POS Direct Printing
// ============================================================================

/**
 * ThermalPrinter class for direct ESC/POS communication via Web Serial API
 */
export class ThermalPrinter {
  private connection: ThermalPrinterConnection | null = null;
  private config: PrinterConfig;
  private encoder = new TextEncoder();

  constructor(config: PrinterConfig = PRINTER_CONFIGS['80mm']) {
    this.config = config;
  }

  // --------------------------------------------------------------------------
  // Connection Management
  // --------------------------------------------------------------------------

  /**
   * Check if Web Serial API is supported
   */
  static isSupported(): boolean {
    return 'serial' in navigator;
  }

  /**
   * Request and connect to a serial port
   */
  async connect(): Promise<void> {
    if (!ThermalPrinter.isSupported()) {
      throw new Error('Web Serial API is not supported in this browser');
    }

    try {
      // Request port from user
      const port = await navigator.serial!.requestPort();

      // Open the port with USB thermal printer settings
      // Common baud rates: 9600, 19200, 38400, 57600, 115200
      await port.open({
        baudRate: this.config.baudRate,
        dataBits: 8,
        stopBits: 1,
        parity: 'none',
        flowControl: 'none',
      });

      if (!port.writable || !port.readable) {
        throw new Error('Port is not writable or readable');
      }

      const writer = port.writable.getWriter();
      const reader = port.readable.getReader();

      this.connection = { port, writer, reader };

      // Initialize printer
      await this.initialize();
    } catch (error) {
      if (error instanceof Error && error.name === 'NotFoundError') {
        throw new Error('No serial port selected');
      }
      throw error;
    }
  }

  /**
   * Connect to a previously paired port
   */
  async connectToPairedPort(): Promise<boolean> {
    if (!ThermalPrinter.isSupported()) {
      return false;
    }

    try {
      const ports = await navigator.serial!.getPorts();
      if (ports.length === 0) {
        return false;
      }

      const port = ports[0];
      await port.open({
        baudRate: this.config.baudRate,
        dataBits: 8,
        stopBits: 1,
        parity: 'none',
        flowControl: 'none',
      });

      if (!port.writable || !port.readable) {
        return false;
      }

      const writer = port.writable.getWriter();
      const reader = port.readable.getReader();

      this.connection = { port, writer, reader };
      await this.initialize();
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Disconnect from the printer
   */
  async disconnect(): Promise<void> {
    if (this.connection) {
      try {
        this.connection.writer.releaseLock();
        this.connection.reader.releaseLock();
        await this.connection.port.close();
      } catch {
        // Ignore errors during disconnect
      }
      this.connection = null;
    }
  }

  /**
   * Check if connected to a printer
   */
  isConnected(): boolean {
    return this.connection !== null;
  }

  // --------------------------------------------------------------------------
  // Low-Level Commands
  // --------------------------------------------------------------------------

  /**
   * Write raw bytes to the printer
   */
  async writeRaw(data: Uint8Array): Promise<void> {
    if (!this.connection) {
      throw new Error('Printer not connected');
    }
    await this.connection.writer.write(data);
  }

  /**
   * Write multiple byte arrays sequentially
   */
  async writeMultiple(...dataArrays: Uint8Array[]): Promise<void> {
    for (const data of dataArrays) {
      await this.writeRaw(data);
    }
  }

  /**
   * Initialize the printer with full setup sequence
   * Based on POS-80XX manual - sends ESC @, ESC = 1, ESC t 0, ESC ! 0
   */
  async initialize(): Promise<void> {
    // Send all init commands in one buffer for reliability
    const initSequence = new Uint8Array([
      ...COMMANDS.INIT, // ESC @ - Initialize printer
      ...COMMANDS.ENABLE_PRINTER, // ESC = 1 - Enable printer (critical!)
      ...COMMANDS.CODE_TABLE_PC437, // ESC t 0 - Select code table
      ...COMMANDS.PRINT_MODE_NORMAL, // ESC ! 0 - Normal print mode
    ]);
    await this.writeRaw(initSequence);
  }

  // --------------------------------------------------------------------------
  // Text Printing
  // --------------------------------------------------------------------------

  /**
   * Print text with optional line feed
   */
  async printText(text: string, lineFeed = true): Promise<void> {
    const encoded = this.encoder.encode(text);
    await this.writeRaw(encoded);
    if (lineFeed) {
      await this.writeRaw(COMMANDS.LINE_FEED);
    }
  }

  /**
   * Print a line of text with formatting options
   */
  async printLine(
    text: string,
    options?: {
      align?: TextAlign;
      bold?: boolean;
      underline?: boolean | '1dot' | '2dot';
      size?: TextSize;
      reverse?: boolean;
    },
  ): Promise<void> {
    // Set alignment
    if (options?.align) {
      await this.setAlign(options.align);
    }

    // Set bold
    if (options?.bold !== undefined) {
      await this.writeRaw(options.bold ? COMMANDS.BOLD_ON : COMMANDS.BOLD_OFF);
    }

    // Set underline
    if (options?.underline !== undefined) {
      if (options.underline === false) {
        await this.writeRaw(COMMANDS.UNDERLINE_OFF);
      } else if (options.underline === '2dot') {
        await this.writeRaw(COMMANDS.UNDERLINE_2DOT);
      } else {
        await this.writeRaw(COMMANDS.UNDERLINE_1DOT);
      }
    }

    // Set size
    if (options?.size) {
      await this.setSize(options.size);
    }

    // Set reverse
    if (options?.reverse !== undefined) {
      await this.writeRaw(options.reverse ? COMMANDS.REVERSE_ON : COMMANDS.REVERSE_OFF);
    }

    // Print text
    await this.printText(text);

    // Reset formatting
    if (options?.bold) await this.writeRaw(COMMANDS.BOLD_OFF);
    if (options?.underline) await this.writeRaw(COMMANDS.UNDERLINE_OFF);
    if (options?.size && options.size !== 'normal') await this.writeRaw(COMMANDS.SIZE_NORMAL);
    if (options?.reverse) await this.writeRaw(COMMANDS.REVERSE_OFF);
    if (options?.align && options.align !== 'left') await this.writeRaw(COMMANDS.ALIGN_LEFT);
  }

  /**
   * Set text alignment
   */
  async setAlign(align: TextAlign): Promise<void> {
    const command =
      align === 'center' ? COMMANDS.ALIGN_CENTER : align === 'right' ? COMMANDS.ALIGN_RIGHT : COMMANDS.ALIGN_LEFT;
    await this.writeRaw(command);
  }

  /**
   * Set text size
   */
  async setSize(size: TextSize): Promise<void> {
    const command =
      size === 'double-width'
        ? COMMANDS.SIZE_DOUBLE_WIDTH
        : size === 'double-height'
          ? COMMANDS.SIZE_DOUBLE_HEIGHT
          : size === 'double'
            ? COMMANDS.SIZE_DOUBLE
            : COMMANDS.SIZE_NORMAL;
    await this.writeRaw(command);
  }

  /**
   * Feed paper by n lines
   */
  async feedLines(n: number): Promise<void> {
    await this.writeRaw(COMMANDS.feedLines(n));
  }

  /**
   * Print a blank line
   */
  async printEmptyLine(): Promise<void> {
    await this.writeRaw(COMMANDS.LINE_FEED);
  }

  /**
   * Print a separator line
   */
  async printSeparator(char = '-'): Promise<void> {
    const line = char.repeat(this.config.charsPerLine);
    await this.printText(line);
  }

  // --------------------------------------------------------------------------
  // QR Code Printing
  // --------------------------------------------------------------------------

  /**
   * Print a QR code using raster bit image (GS v 0)
   */
  async printQRCode(data: string, size = 6): Promise<void> {
    // Generate QR code as a matrix
    const qr = await QRCode.create(data, {
      errorCorrectionLevel: 'M',
    });

    const modules = qr.modules;
    const moduleCount = modules.size;

    // Scale the QR code
    const scale = size;
    const qrWidth = moduleCount * scale;
    const qrHeight = moduleCount * scale;

    // Calculate bytes per row (must be multiple of 8 bits)
    const bytesPerRow = Math.ceil(qrWidth / 8);
    const paddedWidth = bytesPerRow * 8;

    // Build raster data
    const rasterData: number[] = [];

    for (let y = 0; y < qrHeight; y++) {
      const moduleY = Math.floor(y / scale);

      for (let byteIndex = 0; byteIndex < bytesPerRow; byteIndex++) {
        let byte = 0;

        for (let bit = 0; bit < 8; bit++) {
          const x = byteIndex * 8 + bit;
          const moduleX = Math.floor(x / scale);

          // Check if this pixel should be black
          if (x < qrWidth && modules.get(moduleY, moduleX)) {
            byte |= 0x80 >> bit;
          }
        }

        rasterData.push(byte);
      }
    }

    // GS v 0 command - Print raster bit image
    // Format: GS v 0 m xL xH yL yH d1...dk
    // m = 0 (normal mode, 200 DPI)
    const xL = bytesPerRow & 0xff;
    const xH = (bytesPerRow >> 8) & 0xff;
    const yL = qrHeight & 0xff;
    const yH = (qrHeight >> 8) & 0xff;

    const command = new Uint8Array([GS, 0x76, 0x30, 0, xL, xH, yL, yH, ...rasterData]);

    await this.setAlign('center');
    await this.writeRaw(command);
    await this.printEmptyLine();
    await this.printEmptyLine();
    await this.setAlign('left');
  }

  /**
   * Print QR code with label underneath
   */
  async printQRCodeWithLabel(data: string, label: string, size = 6): Promise<void> {
    await this.printQRCode(data, size);
    await this.printEmptyLine();
    await this.printEmptyLine();
    await this.printLine(label, { align: 'center', bold: true });
  }

  // --------------------------------------------------------------------------
  // Barcode Printing
  // --------------------------------------------------------------------------

  /**
   * Print a barcode
   * @param data - Barcode data
   * @param type - Barcode type
   * @param options - Barcode options
   */
  async printBarcode(
    data: string,
    type: 'UPC-A' | 'UPC-E' | 'EAN13' | 'EAN8' | 'CODE39' | 'ITF' | 'CODABAR' | 'CODE93' | 'CODE128' = 'CODE128',
    options?: {
      height?: number;
      width?: number;
      hriPosition?: 'none' | 'above' | 'below' | 'both';
    },
  ): Promise<void> {
    // Set barcode height
    await this.writeRaw(COMMANDS.barcodeHeight(options?.height ?? 80));

    // Set barcode width
    await this.writeRaw(COMMANDS.barcodeWidth(options?.width ?? 3));

    // Set HRI position
    const hriCommand =
      options?.hriPosition === 'above'
        ? COMMANDS.HRI_ABOVE
        : options?.hriPosition === 'below'
          ? COMMANDS.HRI_BELOW
          : options?.hriPosition === 'both'
            ? COMMANDS.HRI_BOTH
            : COMMANDS.HRI_NONE;
    await this.writeRaw(hriCommand);

    // Barcode type codes (GS k m n d1...dn format)
    const typeCode: Record<string, number> = {
      'UPC-A': 65,
      'UPC-E': 66,
      EAN13: 67,
      EAN8: 68,
      CODE39: 69,
      ITF: 70,
      CODABAR: 71,
      CODE93: 72,
      CODE128: 73,
    };

    const m = typeCode[type];
    const encoded = this.encoder.encode(data);

    // For CODE128, we need to prepend the code set
    let barcodeData: Uint8Array;
    if (type === 'CODE128') {
      // Use Code B by default (supports uppercase, lowercase, digits, symbols)
      barcodeData = new Uint8Array([0x7b, 0x42, ...encoded]);
    } else {
      barcodeData = encoded;
    }

    // GS k m n d1...dn
    const command = new Uint8Array([GS, 0x6b, m, barcodeData.length, ...barcodeData]);

    await this.setAlign('center');
    await this.writeRaw(command);
    await this.setAlign('left');
    await this.printEmptyLine();
  }

  // --------------------------------------------------------------------------
  // Paper Cutting
  // --------------------------------------------------------------------------

  /**
   * Cut the paper
   */
  async cut(mode: CutMode = 'partial'): Promise<void> {
    await this.feedLines(3);
    await this.writeRaw(mode === 'full' ? COMMANDS.CUT_FULL : COMMANDS.CUT_PARTIAL);
  }

  /**
   * Cut paper with additional feed
   */
  async cutWithFeed(feedDots: number): Promise<void> {
    await this.writeRaw(COMMANDS.cutWithFeed(feedDots));
  }

  // --------------------------------------------------------------------------
  // Cash Drawer
  // --------------------------------------------------------------------------

  /**
   * Open the cash drawer
   */
  async openCashDrawer(pin: 0 | 1 = 0): Promise<void> {
    await this.writeRaw(COMMANDS.openDrawer(pin));
  }

  // --------------------------------------------------------------------------
  // Utility Methods
  // --------------------------------------------------------------------------

  /**
   * Print a receipt-style header
   */
  async printHeader(lines: string[]): Promise<void> {
    await this.setAlign('center');
    for (const line of lines) {
      await this.printLine(line, { bold: true });
    }
    await this.setAlign('left');
    await this.printSeparator('=');
  }

  /**
   * Print a two-column row (label: value)
   */
  async printKeyValue(label: string, value: string): Promise<void> {
    const totalWidth = this.config.charsPerLine;
    const labelWidth = label.length;
    const valueWidth = value.length;
    const spacesNeeded = totalWidth - labelWidth - valueWidth;

    if (spacesNeeded > 0) {
      const text = label + ' '.repeat(spacesNeeded) + value;
      await this.printText(text);
    } else {
      await this.printText(label);
      await this.printLine(value, { align: 'right' });
    }
  }

  /**
   * Print a complete receipt with QR code
   */
  async printReceipt(options: {
    header?: string[];
    qrData?: string;
    qrLabel?: string;
    body?: string[];
    footer?: string[];
    cut?: boolean;
  }): Promise<void> {
    await this.initialize();

    // Header
    if (options.header?.length) {
      await this.printHeader(options.header);
    }

    await this.printEmptyLine();

    // QR Code
    if (options.qrData) {
      await this.printQRCodeWithLabel(options.qrData, options.qrLabel ?? options.qrData, 6);
      await this.printEmptyLine();
    }

    // Body
    if (options.body?.length) {
      for (const line of options.body) {
        await this.printText(line);
      }
      await this.printEmptyLine();
    }

    // Footer
    if (options.footer?.length) {
      await this.printSeparator('-');
      await this.setAlign('center');
      for (const line of options.footer) {
        await this.printText(line);
      }
      await this.setAlign('left');
    }

    // Cut
    if (options.cut !== false) {
      await this.cut();
    }
  }
}

// ============================================================================
// Global Printer Instance
// ============================================================================

let printerInstance: ThermalPrinter | null = null;

/**
 * Get or create the global printer instance
 */
export function getPrinter(config?: PrinterConfig): ThermalPrinter {
  if (!printerInstance) {
    printerInstance = new ThermalPrinter(config);
  }
  return printerInstance;
}

/**
 * Reset the global printer instance
 */
export async function resetPrinter(): Promise<void> {
  if (printerInstance) {
    await printerInstance.disconnect();
    printerInstance = null;
  }
}

// ============================================================================
// High-Level API Functions
// ============================================================================

/**
 * Print a QR code via ESC/POS (connects to printer if needed)
 */
export async function printQRCodeDirect(grNumber: string): Promise<void> {
  const printer = getPrinter();

  if (!printer.isConnected()) {
    await printer.connect();
  }

  const data: QRPrintData = { gr: grNumber };
  const jsonData = JSON.stringify(data);

  await printer.printQRCodeWithLabel(jsonData, grNumber);
  await printer.cut();
}

/**
 * Print multiple QR codes via ESC/POS
 */
export async function printMultipleQRCodesDirect(grNumbers: string[]): Promise<void> {
  const printer = getPrinter();

  if (!printer.isConnected()) {
    await printer.connect();
  }

  for (const grNumber of grNumbers) {
    const data: QRPrintData = { gr: grNumber };
    const jsonData = JSON.stringify(data);

    await printer.printQRCodeWithLabel(jsonData, grNumber);
    await printer.feedLines(2);
    await printer.printSeparator('-');
    await printer.feedLines(1);
  }

  await printer.cut();
}

// ============================================================================
// Browser Print Dialog Fallback (Original Implementation)
// ============================================================================

/**
 * Generate a QR code as a data URL
 */
export async function generateQRCodeDataURL(data: QRPrintData): Promise<string> {
  const jsonData = JSON.stringify(data);
  return QRCode.toDataURL(jsonData, {
    width: 200,
    margin: 1,
    errorCorrectionLevel: 'M',
  });
}

/**
 * Print QR code via browser print dialog (fallback method)
 */
export async function printQRCodeBrowser(grNumber: string): Promise<void> {
  const data: QRPrintData = { gr: grNumber };
  const qrDataUrl = await generateQRCodeDataURL(data);

  const printWindow = window.open('', '_blank', 'width=300,height=350');

  if (!printWindow) {
    throw new Error('Could not open print window. Please allow popups for this site.');
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>QR Code - ${grNumber}</title>
        <style>
          @page {
            size: 80mm 50mm;
            margin: 2mm;
          }
          body {
            margin: 0;
            padding: 0;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            font-family: Arial, sans-serif;
          }
          .qr-container {
            text-align: center;
          }
          .qr-code {
            width: 150px;
            height: 150px;
          }
          .gr-number {
            margin-top: 5px;
            font-size: 14px;
            font-weight: bold;
          }
          @media print {
            body {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
          }
        </style>
      </head>
      <body>
        <div class="qr-container">
          <img class="qr-code" src="${qrDataUrl}" alt="QR Code" />
          <div class="gr-number">${grNumber}</div>
        </div>
        <script>
          window.onload = function() {
            window.print();
            window.onafterprint = function() {
              window.close();
            };
            setTimeout(function() {
              window.close();
            }, 5000);
          };
        </script>
      </body>
    </html>
  `);

  printWindow.document.close();
}

/**
 * Print multiple QR codes via browser print dialog (fallback method)
 */
export async function printMultipleQRCodesBrowser(grNumbers: string[]): Promise<void> {
  const qrCodes = await Promise.all(
    grNumbers.map(async (gr) => ({
      gr,
      dataUrl: await generateQRCodeDataURL({ gr }),
    })),
  );

  const printWindow = window.open('', '_blank', 'width=400,height=600');

  if (!printWindow) {
    throw new Error('Could not open print window. Please allow popups for this site.');
  }

  const qrHtml = qrCodes
    .map(
      ({ gr, dataUrl }) => `
      <div class="qr-item">
        <img class="qr-code" src="${dataUrl}" alt="QR Code" />
        <div class="gr-number">${gr}</div>
      </div>
    `,
    )
    .join('');

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>QR Codes</title>
        <style>
          @page {
            size: 80mm auto;
            margin: 2mm;
          }
          body {
            margin: 0;
            padding: 0;
            font-family: Arial, sans-serif;
          }
          .qr-item {
            page-break-inside: avoid;
            text-align: center;
            padding: 5mm 0;
            border-bottom: 1px dashed #ccc;
          }
          .qr-item:last-child {
            border-bottom: none;
          }
          .qr-code {
            width: 150px;
            height: 150px;
          }
          .gr-number {
            margin-top: 5px;
            font-size: 14px;
            font-weight: bold;
          }
          @media print {
            body {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .qr-item {
              page-break-after: always;
            }
            .qr-item:last-child {
              page-break-after: auto;
            }
          }
        </style>
      </head>
      <body>
        ${qrHtml}
        <script>
          window.onload = function() {
            window.print();
            window.onafterprint = function() {
              window.close();
            };
            setTimeout(function() {
              window.close();
            }, 10000);
          };
        </script>
      </body>
    </html>
  `);

  printWindow.document.close();
}

// ============================================================================
// Smart Print Functions (Auto-select method)
// ============================================================================

/**
 * Print QR code using best available method
 * Tries ESC/POS direct printing first, falls back to browser print dialog
 */
export async function printQRCode(grNumber: string): Promise<void> {
  if (ThermalPrinter.isSupported()) {
    try {
      await printQRCodeDirect(grNumber);
      return;
    } catch (error) {
      console.warn('ESC/POS printing failed, falling back to browser print:', error);
    }
  }

  await printQRCodeBrowser(grNumber);
}

/**
 * Print multiple QR codes using best available method
 */
export async function printMultipleQRCodes(grNumbers: string[]): Promise<void> {
  if (ThermalPrinter.isSupported()) {
    try {
      await printMultipleQRCodesDirect(grNumbers);
      return;
    } catch (error) {
      console.warn('ESC/POS printing failed, falling back to browser print:', error);
    }
  }

  await printMultipleQRCodesBrowser(grNumbers);
}

// ============================================================================
// Admission Slip Printing
// ============================================================================

export interface AdmissionSlipData {
  name: string;
  fatherName: string;
  classLevelName: string;
  gender: string;
  grNumber: string;
}

/**
 * Print an admission slip with student details and QR code
 */
export async function printAdmissionSlip(data: AdmissionSlipData): Promise<void> {
  const printer = getPrinter();

  if (!printer.isConnected()) {
    await printer.connect();
  }

  await printer.initialize();

  // Header
  await printer.printLine('ADMISSION SLIP', { align: 'center', bold: true, size: 'double' });
  await printer.printEmptyLine();
  await printer.printSeparator('=');
  await printer.printEmptyLine();

  // Student Details
  await printer.printKeyValue('Name:', data.name);
  await printer.printKeyValue('Father Name:', data.fatherName);
  await printer.printKeyValue('Class:', data.classLevelName);
  await printer.printKeyValue('Gender:', data.gender);
  await printer.printKeyValue('GR Number:', data.grNumber);

  await printer.printEmptyLine();
  await printer.printSeparator('-');
  await printer.printEmptyLine();

  // QR Code
  const qrData: QRPrintData = { gr: data.grNumber };
  await printer.printQRCodeWithLabel(JSON.stringify(qrData), data.grNumber, 8);

  await printer.printEmptyLine();
  await printer.printSeparator('-');
  await printer.printLine(new Date().toLocaleString(), { align: 'center' });
  await printer.printEmptyLine();

  // Cut paper
  await printer.cut('partial');
}

/**
 * Print multiple admission slips
 */
export async function printMultipleAdmissionSlips(slips: AdmissionSlipData[]): Promise<void> {
  const printer = getPrinter();

  if (!printer.isConnected()) {
    await printer.connect();
  }

  for (const data of slips) {
    await printer.initialize();

    // Header
    await printer.printLine('ADMISSION SLIP', { align: 'center', bold: true, size: 'double' });
    await printer.printEmptyLine();
    await printer.printSeparator('=');
    await printer.printEmptyLine();

    // Student Details
    await printer.printKeyValue('Name:', data.name);
    await printer.printKeyValue('Father Name:', data.fatherName);
    await printer.printKeyValue('Class:', data.classLevelName);
    await printer.printKeyValue('Gender:', data.gender);
    await printer.printKeyValue('GR Number:', data.grNumber);

    await printer.printEmptyLine();
    await printer.printSeparator('-');
    await printer.printEmptyLine();

    // QR Code
    const qrData: QRPrintData = { gr: data.grNumber };
    await printer.printQRCodeWithLabel(JSON.stringify(qrData), data.grNumber, 8);

    await printer.printEmptyLine();
    await printer.printSeparator('-');
    await printer.printLine(new Date().toLocaleString(), { align: 'center' });
    await printer.printEmptyLine();

    // Cut paper
    await printer.cut('partial');
  }
}

// ============================================================================
// Test Print Function
// ============================================================================

/**
 * Print admission slip via browser print dialog (works with any USB printer)
 */
export async function printAdmissionSlipBrowser(data: AdmissionSlipData): Promise<void> {
  const qrData: QRPrintData = { gr: data.grNumber };
  const qrDataUrl = await generateQRCodeDataURL(qrData);

  const printWindow = window.open('', '_blank', 'width=400,height=600');

  if (!printWindow) {
    throw new Error('Could not open print window. Please allow popups for this site.');
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Admission Slip - ${data.grNumber}</title>
        <style>
          @page {
            size: 80mm auto;
            margin: 3mm;
          }
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: 'Courier New', monospace;
            font-size: 12px;
            padding: 5mm;
            max-width: 76mm;
          }
          .header {
            text-align: center;
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 8px;
            padding-bottom: 8px;
            border-bottom: 2px solid #000;
          }
          .details {
            margin: 10px 0;
          }
          .row {
            display: flex;
            justify-content: space-between;
            margin: 4px 0;
            font-size: 11px;
          }
          .label {
            font-weight: bold;
          }
          .value {
            text-align: right;
            max-width: 55%;
            word-break: break-word;
          }
          .qr-section {
            text-align: center;
            margin: 15px 0;
            padding: 10px 0;
            border-top: 1px dashed #000;
            border-bottom: 1px dashed #000;
          }
          .qr-code {
            width: 120px;
            height: 120px;
          }
          .gr-label {
            margin-top: 5px;
            font-weight: bold;
            font-size: 12px;
          }
          .footer {
            text-align: center;
            font-size: 10px;
            margin-top: 10px;
            color: #666;
          }
          @media print {
            body {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">ADMISSION SLIP</div>
        
        <div class="details">
          <div class="row">
            <span class="label">Name:</span>
            <span class="value">${data.name}</span>
          </div>
          <div class="row">
            <span class="label">Father Name:</span>
            <span class="value">${data.fatherName}</span>
          </div>
          <div class="row">
            <span class="label">Class:</span>
            <span class="value">${data.classLevelName}</span>
          </div>
          <div class="row">
            <span class="label">Gender:</span>
            <span class="value">${data.gender}</span>
          </div>
          <div class="row">
            <span class="label">GR Number:</span>
            <span class="value">${data.grNumber}</span>
          </div>
        </div>

        <div class="qr-section">
          <img class="qr-code" src="${qrDataUrl}" alt="QR Code" />
          <div class="gr-label">${data.grNumber}</div>
        </div>

        <div class="footer">${new Date().toLocaleString()}</div>

        <script>
          window.onload = function() {
            window.print();
            window.onafterprint = function() {
              window.close();
            };
            setTimeout(function() {
              window.close();
            }, 10000);
          };
        </script>
      </body>
    </html>
  `);

  printWindow.document.close();
}

/**
 * Detect if running on Windows
 */
function isWindows(): boolean {
  if (typeof navigator === 'undefined') return false;
  return navigator.platform?.toLowerCase().includes('win') || navigator.userAgent?.toLowerCase().includes('windows');
}

/**
 * Print the admission slip content using a connected WebUSB printer
 */
async function printAdmissionSlipContent(printer: WebUSBThermalPrinter, data: AdmissionSlipData): Promise<void> {
  // Initialize
  await printer.initialize();

  // Header
  await printer.printLine('ADMISSION SLIP', { align: 'center', bold: true, size: 'double' });
  await printer.printEmptyLine();
  await printer.printSeparator('=');
  await printer.printEmptyLine();

  // Student details
  await printer.printKeyValue('Name:', data.name);
  await printer.printKeyValue('Father Name:', data.fatherName);
  await printer.printKeyValue('Class:', data.classLevelName);
  await printer.printKeyValue('Gender:', data.gender);
  await printer.printKeyValue('GR Number:', data.grNumber);

  await printer.printEmptyLine();
  await printer.printSeparator('-');
  await printer.printEmptyLine();

  // QR Code
  const qrData: QRPrintData = { gr: data.grNumber };
  await printer.printQRCodeWithLabel(JSON.stringify(qrData), data.grNumber, 6);

  await printer.printEmptyLine();
  await printer.printEmptyLine();
  await printer.printEmptyLine();
  await printer.printSeparator('-');
  await printer.printLine(new Date().toLocaleString(), { align: 'center' });
  await printer.printEmptyLine();

  // Cut
  await printer.cut('partial');
}

/**
 * Print admission slip via WebUSB (direct ESC/POS)
 * Works on Windows, macOS, and Linux with Chrome/Edge
 */
export async function printAdmissionSlipUSB(data: AdmissionSlipData): Promise<void> {
  // Check WebUSB support
  if (!WebUSBThermalPrinter.isSupported()) {
    const errorMsg = 'WebUSB is not supported. Please use Chrome or Edge browser.';
    console.error(errorMsg);
    alert(errorMsg);
    throw new Error(errorMsg);
  }

  const printer = new WebUSBThermalPrinter(PRINTER_CONFIGS['80mm']);

  try {
    await printer.connect();
    await printAdmissionSlipContent(printer, data);
    await printer.disconnect();
  } catch (error) {
    await printer.disconnect();

    // Provide helpful error messages
    const errorMessage = error instanceof Error ? error.message : String(error);

    // Check for common Windows-specific errors
    if (isWindows()) {
      if (
        errorMessage.includes('Unable to claim interface') ||
        errorMessage.includes('Access denied') ||
        errorMessage.includes('LIBUSB_ERROR') ||
        errorMessage.includes('SecurityError')
      ) {
        const windowsHelp = `
Printer access failed on Windows. This is usually because another driver is using the printer.

To fix this:
1. Open Device Manager
2. Find your printer under "USB Devices" or "Printers"
3. Right-click → Update driver → Browse my computer → Let me pick
4. Select "WinUSB Device" or use Zadig tool (zadig.akeo.ie) to install WinUSB driver

Alternatively, if your printer has a USB-Serial mode, you can use that instead.
        `.trim();
        console.error(windowsHelp);
        alert(windowsHelp);
        throw new Error('Windows: Unable to access printer. See console for instructions.');
      }
    }

    // Generic error for "No printer selected"
    if (errorMessage.includes('No printer selected')) {
      console.log('User cancelled printer selection');
      throw error;
    }

    // Other errors
    console.error('Print error:', error);
    throw error;
  }
}

/**
 * Test print function - prints a sample admission slip via WebUSB
 * Call this from browser console: testPrint()
 */
export async function testPrint(): Promise<void> {
  const testData: AdmissionSlipData = {
    name: 'Muhammad Ahmed',
    fatherName: 'Muhammad Ali',
    classLevelName: 'Grade 5 - Section A',
    gender: 'Male',
    grNumber: '9221-1-10-000100',
  };

  console.log('Starting test print for GR:', testData.grNumber);
  console.log('WebUSB supported:', WebUSBThermalPrinter.isSupported());

  try {
    await printAdmissionSlipUSB(testData);
    console.log('Test print completed successfully!');
  } catch (error) {
    console.error('Test print failed:', error);
    throw error;
  }
}

/**
 * Raw test with beeper to verify printer responds
 */
export async function rawTest(): Promise<void> {
  console.log('=== RAW TEST WITH BEEPER ===');

  const devices = await navigator.usb.getDevices();
  let device = devices.find((d) => d.vendorId === 0x0483) || null;

  if (!device) {
    device = await navigator.usb.requestDevice({
      filters: [{ vendorId: 0x0483 }],
    });
  }

  console.log('Device:', device.productName);
  await device.open();

  if (device.configuration === null) {
    await device.selectConfiguration(1);
  }

  await device.claimInterface(0);
  console.log('Connected');

  // Step 1: Beep to confirm printer responds
  console.log('Step 1: Sending beep command...');
  const beep = new Uint8Array([
    // ESC B n t - Beep: n=3 times, t=2 (100ms each)
    0x1b, 0x42, 0x03, 0x02,
  ]);
  await device.transferOut(1, beep);
  console.log('Beep sent - did you hear 3 beeps?');

  // Wait a moment
  await new Promise((r) => setTimeout(r, 500));

  // Step 2: Initialize and print
  console.log('Step 2: Sending print data...');
  const data = new Uint8Array([
    // ESC @ - Initialize printer
    0x1b, 0x40,

    // ESC = 1 - Enable printer (peripheral device)
    0x1b, 0x3d, 0x01,

    // ESC t 0 - Code table PC437
    0x1b, 0x74, 0x00,

    // ESC ! 0 - Normal print mode
    0x1b, 0x21, 0x00,

    // Print "TEST" followed by LF
    0x54, 0x45, 0x53, 0x54, 0x0a,

    // Print "1234" followed by LF
    0x31, 0x32, 0x33, 0x34, 0x0a,

    // Multiple LFs for spacing
    0x0a, 0x0a, 0x0a, 0x0a,

    // GS V 1 - Cut
    0x1d, 0x56, 0x01,
  ]);

  const result = await device.transferOut(1, data);
  console.log('Print result:', result.status, result.bytesWritten, 'bytes');

  // Step 3: Another beep to confirm completion
  await device.transferOut(1, beep);
  console.log('Final beep sent');

  await device.releaseInterface(0);
  await device.close();
  console.log('=== DONE ===');
  console.log('Did the printer:');
  console.log('  1. Beep 3 times at start?');
  console.log('  2. Print "TEST" and "1234"?');
  console.log('  3. Cut the paper?');
  console.log('  4. Beep 3 times at end?');
}

// Expose to window for browser console testing
if (typeof window !== 'undefined') {
  (window as unknown as Record<string, unknown>).testPrint = testPrint;
  (window as unknown as Record<string, unknown>).rawTest = rawTest;
  (window as unknown as Record<string, unknown>).printAdmissionSlip = printAdmissionSlip;
  (window as unknown as Record<string, unknown>).printAdmissionSlipBrowser = printAdmissionSlipBrowser;
  (window as unknown as Record<string, unknown>).printAdmissionSlipUSB = printAdmissionSlipUSB;
  (window as unknown as Record<string, unknown>).ThermalPrinter = ThermalPrinter;
  (window as unknown as Record<string, unknown>).WebUSBThermalPrinter = WebUSBThermalPrinter;
  (window as unknown as Record<string, unknown>).getPrinter = getPrinter;
}
