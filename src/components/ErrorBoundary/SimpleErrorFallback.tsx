'use client';

import * as React from 'react';

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
        minHeight: '100vh',
        padding: '24px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        backgroundColor: '#f5f5f5',
      }}
    >
      <div
        style={{
          maxWidth: '400px',
          textAlign: 'center',
          backgroundColor: '#fff',
          padding: '32px',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        }}
      >
        <h1 style={{ fontSize: '24px', marginBottom: '16px', color: '#333' }}>Something went wrong</h1>
        <p style={{ fontSize: '16px', marginBottom: '24px', color: '#666' }}>
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
                backgroundColor: '#1976d2',
                border: 'none',
                borderRadius: '4px',
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
              color: '#1976d2',
              backgroundColor: 'transparent',
              border: '1px solid #1976d2',
              borderRadius: '4px',
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
