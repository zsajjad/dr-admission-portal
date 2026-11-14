'use client';

import * as React from 'react';

// This page shows when the theme itself may have failed, so the brand colors are written out here
// (the same values as palette.brand and palette.text in theme/color-schemes.ts).
const BRAND_GREEN = '#0F4D3A';
const IVORY = '#FAF6EC';
const STROKE = '#E6DECB';
const INK = '#1E2B25';
const INK_SOFT = '#55635B';

interface SimpleErrorFallbackProps {
  resetErrorBoundary?: () => void;
}

export function SimpleErrorFallback({ resetErrorBoundary }: SimpleErrorFallbackProps): React.JSX.Element {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        // Fixed to the window: the body's default margin would leave a white frame around the ivory.
        position: 'fixed',
        inset: 0,
        padding: '24px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        backgroundColor: IVORY,
      }}
    >
      <div
        style={{
          maxWidth: '400px',
          textAlign: 'center',
          backgroundColor: '#fff',
          padding: '32px',
          borderRadius: '20px',
          border: `1px solid ${STROKE}`,
        }}
      >
        <h1 style={{ fontSize: '24px', marginBottom: '16px', color: INK }}>Something went wrong</h1>
        <p style={{ fontSize: '16px', marginBottom: '24px', color: INK_SOFT }}>
          An unexpected error occurred. Please try again.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          {resetErrorBoundary && (
            <button
              onClick={resetErrorBoundary}
              style={{
                padding: '10px 20px',
                fontSize: '14px',
                fontWeight: 500,
                color: '#fff',
                backgroundColor: BRAND_GREEN,
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
              }}
            >
              Try again
            </button>
          )}
          <button
            onClick={() => (window.location.href = '/')}
            style={{
              padding: '10px 20px',
              fontSize: '14px',
              fontWeight: 500,
              color: BRAND_GREEN,
              backgroundColor: 'transparent',
              border: `1px solid ${BRAND_GREEN}`,
              borderRadius: '12px',
              cursor: 'pointer',
            }}
          >
            Go back to home
          </button>
        </div>
      </div>
    </div>
  );
}
