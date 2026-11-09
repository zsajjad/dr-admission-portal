import { useEffect, useSyncExternalStore } from 'react';

import { PrinterState, thermalPrinter } from '@/utils/thermalPrinter';

const SERVER_STATE: PrinterState = { status: 'disconnected' };

/** Live state of the fee desk's receipt printer. Reconnects to a remembered printer on first use. */
export function useThermalPrinter(): PrinterState {
  useEffect(() => {
    thermalPrinter.init();
  }, []);

  return useSyncExternalStore(thermalPrinter.subscribe, thermalPrinter.getState, () => SERVER_STATE);
}
