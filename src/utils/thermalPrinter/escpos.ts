/**
 * Builds the bytes for an admission slip in ESC/POS, the command language of
 * POS-80 receipt printers. The whole slip is one buffer, so it goes to the
 * printer in a single USB transfer.
 */
import QRCode from 'qrcode';

export interface AdmissionSlipData {
  name: string;
  fatherName: string;
  classLevelName: string;
  gender: string;
  grNumber: string;
  /** Prints "INTERACTION REQUIRED" so the student is sent to the interview */
  isInteractionRequired?: boolean;
}

/** Font A on 80 mm paper */
const CHARS_PER_LINE = 48;
/** Dot size of one QR module; 6 gives a QR about 2 cm wide */
const QR_MODULE_DOTS = 6;

const ESC = 0x1b;
const GS = 0x1d;
const LF = 0x0a;

type Align = 'left' | 'center';
type Size = 'normal' | 'double' | 'double-height';

const SIZE_BYTE: Record<Size, number> = { normal: 0x00, double: 0x11, 'double-height': 0x01 };

/**
 * The printer is in its English code page, so anything outside printable ASCII
 * would print as junk. Names are English-only on the website; this also strips
 * control characters that could act as printer commands.
 */
export function toPrintableAscii(text: string): string {
  return text
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\x20-\x7e]/g, '?');
}

/** `2026-01-31 20:05`. Avoids toLocaleString, which can contain non-ASCII spaces. */
export function formatSlipTimestamp(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** The QR payload on slips. The mobile app's scanner reads this JSON. */
export function slipQrPayload(grNumber: string): string {
  return JSON.stringify({ gr: grNumber });
}

class EscPosBuilder {
  private chunks: number[] = [];

  private push(...bytes: number[]): this {
    for (const b of bytes) this.chunks.push(b);
    return this;
  }

  init(): this {
    // ESC @ reset, ESC = 1 select printer, ESC t 0 code page PC437, ESC ! 0 normal mode
    return this.push(ESC, 0x40, ESC, 0x3d, 0x01, ESC, 0x74, 0x00, ESC, 0x21, 0x00);
  }

  align(align: Align): this {
    return this.push(ESC, 0x61, align === 'center' ? 1 : 0);
  }

  bold(on: boolean): this {
    return this.push(ESC, 0x45, on ? 1 : 0);
  }

  size(size: Size): this {
    return this.push(GS, 0x21, SIZE_BYTE[size]);
  }

  text(text: string): this {
    const ascii = toPrintableAscii(text);
    for (let i = 0; i < ascii.length; i++) this.chunks.push(ascii.charCodeAt(i));
    return this;
  }

  line(text = ''): this {
    return this.text(text).push(LF);
  }

  separator(char: string): this {
    return this.line(char.repeat(CHARS_PER_LINE));
  }

  keyValue(label: string, value: string): this {
    const safeValue = toPrintableAscii(value);
    const gap = CHARS_PER_LINE - label.length - safeValue.length;
    if (gap > 0) return this.line(label + ' '.repeat(gap) + safeValue);
    // Too long for one line: label, then the value indented on its own line(s)
    return this.line(label).line('  ' + safeValue);
  }

  /** GS v 0: the QR drawn as a raster image, so it doesn't depend on the printer's QR support */
  qrCode(data: string, moduleDots: number): this {
    const { modules } = QRCode.create(data, { errorCorrectionLevel: 'M' });
    const size = modules.size * moduleDots;
    const bytesPerRow = Math.ceil(size / 8);

    this.push(GS, 0x76, 0x30, 0, bytesPerRow & 0xff, bytesPerRow >> 8, size & 0xff, size >> 8);
    for (let y = 0; y < size; y++) {
      const row = Math.floor(y / moduleDots);
      for (let byteIndex = 0; byteIndex < bytesPerRow; byteIndex++) {
        let byte = 0;
        for (let bit = 0; bit < 8; bit++) {
          const x = byteIndex * 8 + bit;
          if (x < size && modules.get(row, Math.floor(x / moduleDots))) byte |= 0x80 >> bit;
        }
        this.chunks.push(byte);
      }
    }
    return this;
  }

  /** Feed 3 lines, then a partial cut */
  cut(): this {
    return this.push(ESC, 0x64, 3, GS, 0x56, 1);
  }

  build(): Uint8Array {
    return Uint8Array.from(this.chunks);
  }
}

/** The 2026 slip layout, as one ESC/POS buffer */
export function buildAdmissionSlip(data: AdmissionSlipData, printedAt: Date = new Date()): Uint8Array {
  const slip = new EscPosBuilder()
    .init()
    .align('center')
    .bold(true)
    .size('double')
    .line('ADMISSION SLIP')
    .size('normal')
    .bold(false)
    .align('left')
    .line()
    .separator('=')
    .line()
    .keyValue('Name:', data.name)
    .keyValue('Father Name:', data.fatherName)
    .keyValue('Class:', data.classLevelName)
    .keyValue('Gender:', data.gender)
    .keyValue('GR Number:', data.grNumber);

  if (data.isInteractionRequired) {
    slip
      .line()
      .align('center')
      .bold(true)
      .size('double-height')
      .line('*** INTERACTION REQUIRED ***')
      .size('normal')
      .bold(false)
      .align('left');
  }

  return slip
    .line()
    .separator('-')
    .line()
    .align('center')
    .qrCode(slipQrPayload(data.grNumber), QR_MODULE_DOTS)
    .bold(true)
    .line(data.grNumber)
    .bold(false)
    .align('left')
    .line()
    .line()
    .separator('-')
    .align('center')
    .line(formatSlipTimestamp(printedAt))
    .align('left')
    .line()
    .cut()
    .build();
}
