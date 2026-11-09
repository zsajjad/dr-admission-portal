/**
 * One USB connection to the fee desk's receipt printer, kept open for the
 * whole session.
 *
 * Why it works this way (see knowledge-base/known-issues.md, issue 6):
 * - Opening and closing the printer for every slip made it stop responding
 *   during the 2026 fee days. Now it's opened once and reused.
 * - Prints go through a queue, so two quick clicks can't mix their bytes.
 * - A print that doesn't finish within WRITE_TIMEOUT_MS fails with a clear
 *   error, instead of leaving the button spinning.
 * - The printer is remembered. After a page reload, or after it's unplugged
 *   and plugged back in, it reconnects without asking.
 * - Failures are thrown as PrinterError with a code the UI can explain. There
 *   is no silent fallback to the browser's print window.
 */
import { getUsb, type USBConfiguration, type USBConnectionEvent, type USBDevice, type USBDeviceFilter } from './webusb';

export type PrinterStatus = 'unsupported' | 'disconnected' | 'connecting' | 'ready' | 'printing' | 'error';

export type PrinterErrorCode =
  | 'unsupported'
  | 'no-device-selected'
  | 'windows-driver'
  | 'in-use'
  | 'not-a-printer'
  | 'timeout'
  | 'disconnected'
  | 'unknown';

export class PrinterError extends Error {
  constructor(
    readonly code: PrinterErrorCode,
    message: string,
  ) {
    super(message);
    this.name = 'PrinterError';
  }
}

export interface PrinterState {
  status: PrinterStatus;
  /** e.g. "POS-80 (Printer)" */
  deviceName?: string;
  error?: PrinterError;
}

const STORAGE_KEY = 'dr.thermalPrinter.device';
const WRITE_TIMEOUT_MS = 15_000;

/** Devices Chrome offers in its printer picker */
const PICKER_FILTERS: USBDeviceFilter[] = [
  { classCode: 7 }, // any USB printer-class device, whatever its maker
  { vendorId: 0x0483 }, // STMicroelectronics (the POS-80s used in 2026)
  { vendorId: 0x0416 }, // Winbond / Nuvoton
  { vendorId: 0x0fe6 }, // ICS Advent
  { vendorId: 0x04b8 }, // Epson
  { vendorId: 0x067b }, // Prolific USB-serial
  { vendorId: 0x1a86 }, // QinHeng CH340
];

/** Interface classes Chrome won't let a page claim (audio, HID, storage, video, wireless…) */
const PROTECTED_CLASSES = new Set([0x01, 0x03, 0x08, 0x0b, 0x0e, 0x10, 0xe0]);

/** Preference when a device has several interfaces: printer, then vendor-specific, then CDC data */
const CLASS_PREFERENCE: Record<number, number> = { 0x07: 3, 0xff: 2, 0x0a: 1 };

interface StoredDevice {
  vendorId: number;
  productId: number;
  serialNumber?: string;
}

interface OutputTarget {
  interfaceNumber: number;
  alternateSetting: number;
  endpointNumber: number;
}

function isWindows(): boolean {
  return typeof navigator !== 'undefined' && /windows/i.test(navigator.userAgent);
}

function describeDevice(device: USBDevice): string {
  const name = [device.manufacturerName, device.productName].filter(Boolean).join(' ').trim();
  return name || `USB device ${device.vendorId.toString(16)}:${device.productId.toString(16)}`;
}

function findOutputTarget(configuration: USBConfiguration | null): OutputTarget | null {
  let best: (OutputTarget & { score: number }) | null = null;
  for (const iface of configuration?.interfaces ?? []) {
    for (const alt of iface.alternates) {
      if (PROTECTED_CLASSES.has(alt.interfaceClass)) continue;
      const out = alt.endpoints.find((e) => e.direction === 'out' && e.type === 'bulk');
      if (!out) continue;
      const score = CLASS_PREFERENCE[alt.interfaceClass] ?? 0;
      if (!best || score > best.score) {
        best = {
          interfaceNumber: iface.interfaceNumber,
          alternateSetting: alt.alternateSetting,
          endpointNumber: out.endpointNumber,
          score,
        };
      }
    }
  }
  return best;
}

function readStoredDevice(): StoredDevice | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredDevice) : null;
  } catch {
    return null;
  }
}

function matchesStored(device: USBDevice, stored: StoredDevice | null): boolean {
  if (!stored) return false;
  if (device.vendorId !== stored.vendorId || device.productId !== stored.productId) return false;
  return !stored.serialNumber || !device.serialNumber || stored.serialNumber === device.serialNumber;
}

function withTimeout<T>(promise: Promise<T>, ms: number, onTimeout: () => PrinterError): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(onTimeout()), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

function toPrinterError(error: unknown): PrinterError {
  if (error instanceof PrinterError) return error;
  const name = error instanceof Error ? error.name : '';
  const message = error instanceof Error ? error.message : String(error);
  if (name === 'NotFoundError' && /no device selected/i.test(message)) {
    return new PrinterError('no-device-selected', 'No printer was chosen.');
  }
  if (name === 'NotFoundError' || name === 'AbortError' || /disconnected/i.test(message)) {
    return new PrinterError('disconnected', 'The printer was disconnected.');
  }
  return new PrinterError('unknown', message || 'Printing failed.');
}

class UsbThermalPrinter {
  private state: PrinterState = { status: 'disconnected' };
  private listeners = new Set<() => void>();
  private device: USBDevice | null = null;
  private target: OutputTarget | null = null;
  private queue: Promise<unknown> = Promise.resolve();
  private initialized = false;

  getState = (): PrinterState => this.state;

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  private setState(next: PrinterState) {
    this.state = next;
    this.listeners.forEach((listener) => listener());
  }

  private isReady(): boolean {
    return !!this.device?.opened && !!this.target;
  }

  /** Call once from the UI. Listens for plugging and unplugging, and reconnects to a remembered printer. */
  init(): void {
    if (this.initialized || typeof window === 'undefined') return;
    this.initialized = true;

    const usb = getUsb();
    if (!usb) {
      this.setState({
        status: 'unsupported',
        error: new PrinterError('unsupported', 'This browser cannot use USB printers.'),
      });
      return;
    }

    usb.addEventListener('disconnect', this.handleDisconnect);
    usb.addEventListener('connect', this.handleConnect);
    void this.connect({ prompt: false }).catch(() => undefined);
  }

  private handleDisconnect = (event: USBConnectionEvent) => {
    if (event.device !== this.device) return;
    this.device = null;
    this.target = null;
    this.setState({ status: 'disconnected' });
  };

  private handleConnect = (event: USBConnectionEvent) => {
    if (this.isReady() || !matchesStored(event.device, readStoredDevice())) return;
    void this.connect({ prompt: false }).catch(() => undefined);
  };

  /**
   * Connects to the remembered printer. With `prompt: true` (only from a click),
   * opens Chrome's picker when no printer has been chosen yet.
   */
  async connect({ prompt }: { prompt: boolean }): Promise<void> {
    if (this.isReady()) return;

    const usb = getUsb();
    if (!usb) throw new PrinterError('unsupported', 'This browser cannot use USB printers.');

    this.setState({ status: 'connecting', deviceName: this.state.deviceName });
    try {
      let device = await this.findGrantedDevice();
      if (!device && prompt) device = await usb.requestDevice({ filters: PICKER_FILTERS });
      if (!device) {
        this.setState({ status: 'disconnected' });
        return;
      }
      await this.openAndClaim(device);
      this.remember(device);
      this.setState({ status: 'ready', deviceName: describeDevice(device) });
    } catch (error) {
      const printerError = toPrinterError(error);
      await this.closeQuietly();
      this.setState(
        printerError.code === 'no-device-selected'
          ? { status: 'disconnected' }
          : { status: 'error', error: printerError, deviceName: this.state.deviceName },
      );
      throw printerError;
    }
  }

  /** Forgets the current printer and asks for another one. Call from a click. */
  async changePrinter(): Promise<void> {
    const device = this.device;
    await this.closeQuietly();
    window.localStorage.removeItem(STORAGE_KEY);
    try {
      await device?.forget?.();
    } catch {
      // Older Chrome: the permission stays, which is harmless
    }
    this.setState({ status: 'disconnected' });
    const usb = getUsb();
    if (!usb) throw new PrinterError('unsupported', 'This browser cannot use USB printers.');
    try {
      const picked = await usb.requestDevice({ filters: PICKER_FILTERS });
      this.setState({ status: 'connecting' });
      await this.openAndClaim(picked);
      this.remember(picked);
      this.setState({ status: 'ready', deviceName: describeDevice(picked) });
    } catch (error) {
      const printerError = toPrinterError(error);
      await this.closeQuietly();
      this.setState(
        printerError.code === 'no-device-selected'
          ? { status: 'disconnected' }
          : { status: 'error', error: printerError },
      );
      throw printerError;
    }
  }

  /** Sends one complete job (e.g. a slip from buildAdmissionSlip). Call from a click. */
  print(bytes: Uint8Array): Promise<void> {
    const job = this.queue.then(() => this.runJob(bytes));
    this.queue = job.catch(() => undefined);
    return job;
  }

  private async runJob(bytes: Uint8Array): Promise<void> {
    if (!this.isReady()) await this.connect({ prompt: true });
    if (!this.isReady()) throw new PrinterError('no-device-selected', 'No printer was chosen.');

    const device = this.device!;
    const { endpointNumber } = this.target!;
    const deviceName = this.state.deviceName;
    this.setState({ status: 'printing', deviceName });

    try {
      const buffer = new ArrayBuffer(bytes.byteLength);
      new Uint8Array(buffer).set(bytes);
      const result = await withTimeout(
        device.transferOut(endpointNumber, buffer),
        WRITE_TIMEOUT_MS,
        () => new PrinterError('timeout', 'The printer stopped responding.'),
      );
      if (result.status === 'stall') {
        await device.clearHalt('out', endpointNumber).catch(() => undefined);
        throw new PrinterError('timeout', 'The printer refused the job.');
      }
      if (result.bytesWritten < bytes.byteLength) {
        throw new PrinterError('timeout', 'The printer accepted only part of the slip.');
      }
      this.setState({ status: 'ready', deviceName });
    } catch (error) {
      const printerError = toPrinterError(error);
      // Closing cancels a stuck transfer, so the next attempt starts clean
      await this.closeQuietly();
      this.setState({ status: 'error', error: printerError, deviceName });
      throw printerError;
    }
  }

  private async findGrantedDevice(): Promise<USBDevice | null> {
    const granted = (await getUsb()?.getDevices()) ?? [];
    const stored = readStoredDevice();
    // `configuration` can be null until the device is opened; `configurations` is always filled in
    const looksLikePrinter = (d: USBDevice) => d.configurations.some((c) => findOutputTarget(c) !== null);
    return granted.find((d) => matchesStored(d, stored)) ?? granted.find(looksLikePrinter) ?? null;
  }

  private async openAndClaim(device: USBDevice): Promise<void> {
    try {
      if (!device.opened) await device.open();
      if (device.configuration === null) await device.selectConfiguration(1);
    } catch (error) {
      throw this.accessError(error);
    }

    const target = findOutputTarget(device.configuration);
    if (!target) {
      await device.close().catch(() => undefined);
      throw new PrinterError('not-a-printer', `${describeDevice(device)} doesn't look like a receipt printer.`);
    }

    try {
      await device.claimInterface(target.interfaceNumber);
      if (target.alternateSetting !== 0) {
        await device.selectAlternateInterface(target.interfaceNumber, target.alternateSetting);
      }
    } catch (error) {
      await device.close().catch(() => undefined);
      throw this.accessError(error);
    }

    this.device = device;
    this.target = target;
  }

  private accessError(error: unknown): PrinterError {
    const detail = error instanceof Error ? error.message : String(error);
    return isWindows()
      ? new PrinterError('windows-driver', `Windows is holding the printer (${detail}).`)
      : new PrinterError('in-use', `Another program or tab is using the printer (${detail}).`);
  }

  private remember(device: USBDevice) {
    const stored: StoredDevice = {
      vendorId: device.vendorId,
      productId: device.productId,
      serialNumber: device.serialNumber,
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
  }

  private async closeQuietly(): Promise<void> {
    const device = this.device;
    this.device = null;
    this.target = null;
    if (device?.opened) await device.close().catch(() => undefined);
  }
}

/** The portal's one receipt printer connection */
export const thermalPrinter = new UsbThermalPrinter();
