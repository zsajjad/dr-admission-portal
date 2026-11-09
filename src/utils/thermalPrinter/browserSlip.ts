/**
 * Prints the admission slip through the browser's print window, on whatever
 * printer the laptop has set up. Staff choose this explicitly from the print
 * error dialog; it is never used as a silent fallback.
 */
import QRCode from 'qrcode';

import { type AdmissionSlipData, formatSlipTimestamp, slipQrPayload } from './escpos';

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export async function printAdmissionSlipInBrowser(data: AdmissionSlipData): Promise<void> {
  const qrDataUrl = await QRCode.toDataURL(slipQrPayload(data.grNumber), { width: 200, margin: 1 });

  const printWindow = window.open('', '_blank', 'width=400,height=600');
  if (!printWindow) {
    throw new Error('Could not open the print window. Allow pop-ups for this site and try again.');
  }

  const rows: [string, string][] = [
    ['Name:', data.name],
    ['Father Name:', data.fatherName],
    ['Class:', data.classLevelName],
    ['Gender:', data.gender],
    ['GR Number:', data.grNumber],
  ];

  printWindow.document.write(`<!DOCTYPE html>
<html>
  <head>
    <title>Admission Slip - ${escapeHtml(data.grNumber)}</title>
    <style>
      @page { size: 80mm auto; margin: 3mm; }
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: 'Courier New', monospace; font-size: 12px; padding: 5mm; max-width: 76mm; }
      .header { text-align: center; font-size: 16px; font-weight: bold; padding-bottom: 8px; margin-bottom: 8px; border-bottom: 2px solid #000; }
      .row { display: flex; justify-content: space-between; margin: 4px 0; font-size: 11px; }
      .label { font-weight: bold; }
      .value { text-align: right; max-width: 55%; word-break: break-word; }
      .interaction { text-align: center; font-size: 14px; font-weight: bold; margin: 10px 0; padding: 8px; background: #000; color: #fff; }
      .qr { text-align: center; margin: 15px 0; padding: 10px 0; border-top: 1px dashed #000; border-bottom: 1px dashed #000; }
      .qr img { width: 120px; height: 120px; }
      .gr { margin-top: 5px; font-weight: bold; }
      .footer { text-align: center; font-size: 10px; margin-top: 10px; color: #666; }
      @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
    </style>
  </head>
  <body>
    <div class="header">ADMISSION SLIP</div>
    ${rows
      .map(
        ([label, value]) =>
          `<div class="row"><span class="label">${label}</span><span class="value">${escapeHtml(value)}</span></div>`,
      )
      .join('\n    ')}
    ${data.isInteractionRequired ? '<div class="interaction">*** INTERACTION REQUIRED ***</div>' : ''}
    <div class="qr">
      <img src="${qrDataUrl}" alt="QR code" />
      <div class="gr">${escapeHtml(data.grNumber)}</div>
    </div>
    <div class="footer">${formatSlipTimestamp(new Date())}</div>
    <script>
      window.onload = function () {
        window.onafterprint = function () { window.close(); };
        window.print();
      };
    </script>
  </body>
</html>`);
  printWindow.document.close();
}
