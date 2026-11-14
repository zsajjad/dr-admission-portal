'use client';

import { useCallback, useRef, useState } from 'react';

import type { ReportChatLookup } from '@/providers/service/app.schemas';

import { config } from '@/config';
import { getAuthenticationToken } from '@/services';

/** A tool call in progress or done, as streamed by POST /reports/chat. */
export interface StreamLookup extends Partial<ReportChatLookup> {
  id: string;
  tool: string;
  done: boolean;
}

export interface StreamState {
  /** The question being answered, until it's saved in the conversation. */
  question: string | null;
  text: string;
  lookups: StreamLookup[];
  streaming: boolean;
  status?: 'ok' | 'error' | 'refused';
  error?: string;
}

export interface ChatError {
  statusCode?: number;
  code?: string;
  message?: string;
}

const INITIAL: StreamState = { question: null, text: '', lookups: [], streaming: false };

interface AskOptions {
  question: string;
  conversationId?: string;
  /** Called as soon as the server has created (or continued) the conversation. */
  onConversation?: (conversationId: string) => void;
  onDone?: (conversationId: string) => void;
}

/**
 * Streams an answer from POST /reports/chat (server-sent events over fetch, since EventSource can't
 * POST). Limit and permission errors arrive as a normal JSON error before the stream starts.
 */
export function useChatStream() {
  const [state, setState] = useState<StreamState>(INITIAL);
  const abortRef = useRef<AbortController | null>(null);

  const reset = useCallback(() => setState(INITIAL), []);

  const stop = useCallback(() => abortRef.current?.abort(), []);

  const ask = useCallback(async ({ question, conversationId, onConversation, onDone }: AskOptions) => {
    const controller = new AbortController();
    abortRef.current = controller;
    setState({ ...INITIAL, question, streaming: true });

    let committed = '';
    let step = '';
    let currentConversation = conversationId;
    const show = () => setState((s) => ({ ...s, text: committed + (committed && step ? '\n\n' : '') + step }));

    const handle = (event: string, data: Record<string, unknown>) => {
      switch (event) {
        case 'turn':
          currentConversation = data.conversationId as string;
          onConversation?.(currentConversation);
          break;
        case 'text':
          step += data.delta as string;
          show();
          break;
        case 'reset':
          step = '';
          show();
          break;
        case 'tool_start':
          if (step) committed = committed ? `${committed}\n\n${step}` : step;
          step = '';
          show();
          setState((s) => ({
            ...s,
            lookups: [...s.lookups, { id: data.id as string, tool: data.tool as string, done: false }],
          }));
          break;
        case 'tool_done':
          setState((s) => ({
            ...s,
            lookups: s.lookups.map((l) =>
              l.id === data.id ? { ...(data as unknown as StreamLookup), done: true } : l,
            ),
          }));
          break;
        case 'error':
          setState((s) => ({ ...s, error: data.message as string }));
          break;
        case 'done':
          setState((s) => ({
            ...s,
            streaming: false,
            status: data.status as StreamState['status'],
            text: (data.answer as string) || s.text,
          }));
          break;
      }
    };

    try {
      const token = getAuthenticationToken();
      const res = await fetch(`${config.PUBLIC_API_DOMAIN}/reports/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'text/event-stream',
          'x-api-key': config.API_KEY,
          'x-channel': 'APP_PORTAL',
          medium: 'platform-web',
          ...(token ? { Authorization: token } : {}),
        },
        body: JSON.stringify({ question, ...(conversationId ? { conversationId } : {}) }),
        signal: controller.signal,
      });
      if (!res.ok || !res.body) {
        const body = (await res.json().catch(() => ({}))) as ChatError;
        throw { statusCode: res.status, ...body } as ChatError;
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let split: number;
        while ((split = buffer.indexOf('\n\n')) >= 0) {
          const block = buffer.slice(0, split);
          buffer = buffer.slice(split + 2);
          let event = 'message';
          const data: string[] = [];
          for (const line of block.split('\n')) {
            if (line.startsWith('event: ')) event = line.slice(7);
            else if (line.startsWith('data: ')) data.push(line.slice(6));
          }
          if (data.length) handle(event, JSON.parse(data.join('\n')));
        }
      }
      setState((s) => ({ ...s, streaming: false }));
      if (currentConversation) onDone?.(currentConversation);
    } catch (e) {
      const aborted = (e as Error)?.name === 'AbortError';
      setState((s) => ({
        ...s,
        streaming: false,
        error: aborted ? undefined : ((e as ChatError)?.message ?? 'Request failed'),
        status: aborted ? s.status : 'error',
      }));
      if (aborted && currentConversation) onDone?.(currentConversation);
      if (!aborted) throw e;
    } finally {
      abortRef.current = null;
    }
  }, []);

  return { state, ask, stop, reset };
}
