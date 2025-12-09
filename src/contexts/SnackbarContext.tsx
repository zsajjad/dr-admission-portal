'use client';

import React, { createContext, PropsWithChildren, useContext } from 'react';

import { AlertProps } from '@mui/material';
import { SlideProps } from '@mui/material/Slide';
import Snackbar, { SnackbarOrigin } from '@mui/material/Snackbar';

type snackbarContextType = {
  show: (newState: HandleClickProps) => void;
  hide: () => void;
};

const SnackbarContext = createContext<snackbarContextType>({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  show: function (newState: HandleClickProps): void {
    throw new Error('Function not implemented.');
  },
  hide: function (): void {
    throw new Error('Function not implemented.');
  },
});

export function useSnackbarContext(): snackbarContextType {
  return useContext(SnackbarContext) as unknown as snackbarContextType;
}

export interface State extends SnackbarOrigin {
  open: boolean;
  direction?: SlideProps['direction'];
  type?: AlertProps['severity'];
  message?: string;
}

export interface HandleClickProps extends Omit<State, 'open' | 'vertical' | 'horizontal'> {
  vertical?: SnackbarOrigin['vertical'];
  horizontal?: SnackbarOrigin['horizontal'];
}

export function SnackbarContextProvider(props: PropsWithChildren<unknown>) {
  const [state, setState] = React.useState<State>({
    open: false,
    vertical: 'bottom',
    horizontal: 'center',
  });
  const { vertical, horizontal, open } = state;

  const handleClick = ({
    vertical = state.vertical,
    horizontal = state.horizontal,
    ...newState
  }: {
    vertical?: SnackbarOrigin['vertical'];
    horizontal?: SnackbarOrigin['horizontal'];
    message?: string;
  }) => {
    setState({ vertical, horizontal, ...newState, open: true });
  };

  const handleClose = (_event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setState({ ...state, open: false });
  };

  return (
    <SnackbarContext.Provider
      value={{
        show: handleClick,
        hide: handleClose,
      }}
    >
      {props.children}
      <Snackbar
        anchorOrigin={{ vertical, horizontal }}
        open={open}
        onClose={handleClose}
        message={state.message}
        key={vertical + horizontal}
        autoHideDuration={4000}
      />
    </SnackbarContext.Provider>
  );
}
