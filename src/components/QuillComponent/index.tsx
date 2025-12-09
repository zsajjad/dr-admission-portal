// components/QuillEditor.tsx
'use client';

import React, { useEffect, useRef } from 'react';

import type { QuillOptions } from 'quill';

import 'quill/dist/quill.snow.css';
import { Box } from '@mui/material';

export interface QuillEditorProps {
  value?: string;
  onChange?: (html: string) => void;
  options?: QuillOptions;
  className?: string;
}

export const QuillEditor: React.FC<QuillEditorProps> = ({ value, onChange, options }) => {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const quillRef = useRef<InstanceType<typeof import('quill').default> | null>(null);
  const [isClient, setIsClient] = React.useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || !editorRef.current || quillRef.current) return;

    // Dynamic import of Quill to avoid SSR issues
    import('quill').then((Quill) => {
      if (!editorRef.current || quillRef.current) return;

      quillRef.current = new Quill.default(editorRef.current, {
        theme: 'snow',
        placeholder: options?.placeholder ?? 'Write something...',
        modules: {
          toolbar: {
            container: '#quill-toolbar', // ✅ connect toolbar
          },
          ...options?.modules,
        },
      });

      // ✅ set initial value
      if (value) {
        quillRef.current.clipboard.dangerouslyPasteHTML(value);
      }

      // ✅ text-change listener
      quillRef.current.on('text-change', () => {
        if (!quillRef.current) return;
        const html = quillRef.current.root.innerHTML;
        const isEmpty =
          quillRef.current.getText().trim().length === 0 || html === '<p><br></p>' || html === '<div><br></div>';

        onChange?.(isEmpty ? '' : html);
      });
    });
  }, [isClient, onChange, options, value]);

  // ✅ Sync external value changes
  useEffect(() => {
    if (!quillRef.current || value === undefined) return;
    const current = quillRef.current.root.innerHTML;
    if (value !== current) {
      quillRef.current.clipboard.dangerouslyPasteHTML(value);
    }
  }, [value]);

  if (!isClient) {
    return (
      <Box
        sx={{
          border: '1px solid rgba(0, 0, 0, 0.23)',
          borderRadius: 1,
          px: 1,
          py: 0.5,
          minHeight: '150px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'text.secondary',
        }}
      >
        Loading editor...
      </Box>
    );
  }

  return (
    <Box
      sx={{
        border: '1px solid rgba(0, 0, 0, 0.23)',
        borderRadius: 1,
        px: 1,
        py: 0.5,
        '& .ql-toolbar': {
          border: 'none',
          borderBottom: '1px solid rgba(0,0,0,0.23)',
        },
        '& .ql-container': {
          border: 'none',
          minHeight: '150px',
          maxHeight: '250px',
          overflow: 'auto',
        },
      }}
    >
      {/* ✅ Toolbar with actual buttons */}
      <div id="quill-toolbar" />

      {/* Editor container */}
      <div ref={editorRef} />
    </Box>
  );
};
