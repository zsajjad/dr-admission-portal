/**
 * The parts of the WebUSB API this printer code uses.
 * TypeScript's DOM types don't include WebUSB, so they're declared here.
 */

export interface USBDeviceFilter {
  vendorId?: number;
  productId?: number;
  classCode?: number;
}

export interface USBEndpoint {
  endpointNumber: number;
  direction: 'in' | 'out';
  type: 'bulk' | 'interrupt' | 'isochronous';
}

export interface USBAlternateInterface {
  alternateSetting: number;
  interfaceClass: number;
  endpoints: USBEndpoint[];
}

export interface USBInterface {
  interfaceNumber: number;
  alternates: USBAlternateInterface[];
}

export interface USBConfiguration {
  configurationValue: number;
  interfaces: USBInterface[];
}

export interface USBOutTransferResult {
  bytesWritten: number;
  status: 'ok' | 'stall' | 'babble';
}

export interface USBDevice {
  readonly vendorId: number;
  readonly productId: number;
  readonly serialNumber?: string;
  readonly productName?: string;
  readonly manufacturerName?: string;
  readonly opened: boolean;
  readonly configuration: USBConfiguration | null;
  readonly configurations: USBConfiguration[];
  open(): Promise<void>;
  close(): Promise<void>;
  /** Chrome 101+ */
  forget?(): Promise<void>;
  selectConfiguration(configurationValue: number): Promise<void>;
  claimInterface(interfaceNumber: number): Promise<void>;
  selectAlternateInterface(interfaceNumber: number, alternateSetting: number): Promise<void>;
  transferOut(endpointNumber: number, data: BufferSource): Promise<USBOutTransferResult>;
  clearHalt(direction: 'in' | 'out', endpointNumber: number): Promise<void>;
}

export interface USBConnectionEvent extends Event {
  readonly device: USBDevice;
}

export interface USB {
  getDevices(): Promise<USBDevice[]>;
  requestDevice(options: { filters: USBDeviceFilter[] }): Promise<USBDevice>;
  addEventListener(type: 'connect' | 'disconnect', listener: (event: USBConnectionEvent) => void): void;
  removeEventListener(type: 'connect' | 'disconnect', listener: (event: USBConnectionEvent) => void): void;
}

/** Returns `navigator.usb`, or undefined when the browser has no WebUSB (Safari, Firefox, plain HTTP). */
export function getUsb(): USB | undefined {
  if (typeof navigator === 'undefined') return undefined;
  return (navigator as Navigator & { usb?: USB }).usb;
}
