/*
 * ThermalPrinter Messages
 *
 * Text for the fee desk receipt printer status and print errors.
 */
import { defineMessages } from 'react-intl';

const scope = 'app.components.ThermalPrinter';

export default defineMessages({
  statusReady: {
    id: `${scope}.statusReady`,
    defaultMessage: 'Printer ready: {name}',
  },
  statusConnecting: {
    id: `${scope}.statusConnecting`,
    defaultMessage: 'Connecting to printer…',
  },
  statusPrinting: {
    id: `${scope}.statusPrinting`,
    defaultMessage: 'Printing…',
  },
  statusDisconnected: {
    id: `${scope}.statusDisconnected`,
    defaultMessage: 'Printer not connected',
  },
  statusError: {
    id: `${scope}.statusError`,
    defaultMessage: 'Printer problem',
  },
  statusUnsupported: {
    id: `${scope}.statusUnsupported`,
    defaultMessage: 'Use Chrome or Edge to print slips',
  },
  connect: {
    id: `${scope}.connect`,
    defaultMessage: 'Connect printer',
  },
  reconnect: {
    id: `${scope}.reconnect`,
    defaultMessage: 'Reconnect',
  },
  changePrinter: {
    id: `${scope}.changePrinter`,
    defaultMessage: 'Change printer',
  },
  testPrint: {
    id: `${scope}.testPrint`,
    defaultMessage: 'Test print',
  },

  errorTitle: {
    id: `${scope}.errorTitle`,
    defaultMessage: 'The slip did not print',
  },
  errorTitleFor: {
    id: `${scope}.errorTitleFor`,
    defaultMessage: 'The slip for {grNumber} did not print',
  },
  retry: {
    id: `${scope}.retry`,
    defaultMessage: 'Retry',
  },
  printInBrowser: {
    id: `${scope}.printInBrowser`,
    defaultMessage: 'Print with browser instead',
  },
  close: {
    id: `${scope}.close`,
    defaultMessage: 'Close',
  },
  browserHint: {
    id: `${scope}.browserHint`,
    defaultMessage:
      "“Print with browser” opens the browser's print window. Use it only with an ordinary office printer; the receipt printer can't print from it.",
  },
  technicalDetail: {
    id: `${scope}.technicalDetail`,
    defaultMessage: 'Details: {detail}',
  },

  error_unsupported: {
    id: `${scope}.error_unsupported`,
    defaultMessage:
      "This browser can't reach USB printers. Open the portal in Google Chrome or Microsoft Edge (over https), then print again.",
  },
  'error_no-device-selected': {
    id: `${scope}.error_no-device-selected`,
    defaultMessage:
      "No printer was chosen. Press Retry and pick the printer from the list. If it isn't listed, check that it's switched on and the USB cable is firmly in, then retry.",
  },
  'error_windows-driver': {
    id: `${scope}.error_windows-driver`,
    defaultMessage:
      "Windows is holding the printer, so the portal can't use it. Set this laptop up once with Zadig (WinUSB driver), as in the fee desk printer setup guide, then unplug the printer, plug it back in and press Retry.",
  },
  'error_in-use': {
    id: `${scope}.error_in-use`,
    defaultMessage:
      "Another tab or program is using the printer. Close any other portal tabs. On a Mac, remove the printer from System Settings › Printers & Scanners if it's listed there. Then unplug the printer, plug it back in and press Retry.",
  },
  'error_not-a-printer': {
    id: `${scope}.error_not-a-printer`,
    defaultMessage:
      "The chosen USB device doesn't look like a receipt printer. Close this, press “Change printer” and pick the printer.",
  },
  error_timeout: {
    id: `${scope}.error_timeout`,
    defaultMessage:
      'The printer stopped responding. Check that it has paper, the cover is shut and the light is not blinking red, then press Retry.',
  },
  error_disconnected: {
    id: `${scope}.error_disconnected`,
    defaultMessage: 'The printer was unplugged or switched off. Reconnect it, then press Retry.',
  },
  error_unknown: {
    id: `${scope}.error_unknown`,
    defaultMessage: 'Printing failed. Unplug the printer, plug it back in, then press Retry.',
  },
});
