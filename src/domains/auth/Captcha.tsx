'use client';

import { useEffect, useMemo, useRef } from 'react';

import Script from 'next/script';

import { config } from '@/config';

declare global {
  interface Window {
    turnstile?: {
      render: (
        element: HTMLElement,
        options: {
          sitekey: string;
          callback?: (token: string) => void;
          'expired-callback'?: () => void;
          'error-callback'?: () => void;
          theme?: 'auto' | 'light' | 'dark';
          size?: 'normal' | 'compact' | 'invisible';
          appearance?: 'always' | 'execute' | 'interaction-only';
        },
      ) => string;
      reset: (widgetId: string) => void;
    };
  }
}

export function Captcha({
  onVerify,
  onExpire,
  resetKey,
}: {
  onVerify: (token: string) => void;
  onExpire: () => void;
  resetKey: number;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string | null>(null);
  const siteKey = useMemo(() => config.TURNSTILE_SITE_KEY || '', []);

  useEffect(() => {
    if (!siteKey) return;
    function render() {
      if (!containerRef.current || !window.turnstile) return;
      containerRef.current.innerHTML = '';
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        callback: (token) => onVerify(token),
        'expired-callback': () => onExpire(),
        theme: 'auto',
        size: 'normal',
      });
    }

    if (window.turnstile) {
      render();
    } else {
      const id = 'cf-turnstile-script';
      if (!document.getElementById(id)) {
        const s = document.createElement('script');
        s.id = id;
        s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
        s.async = true;
        s.defer = true;
        s.onload = () => render();
        document.body.appendChild(s);
      }
    }
  }, [siteKey, onVerify, onExpire, resetKey]);

  if (!siteKey) return null;

  return (
    <div>
      <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" strategy="lazyOnload" />
      <div ref={containerRef} />
    </div>
  );
}
