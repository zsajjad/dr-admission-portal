'use client';

import * as React from 'react';

import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';

import {
  Box,
  Link,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';

/**
 * Renders Claude's answers: paragraphs, lists, headings and GitHub-style tables (as MUI tables).
 * Raw HTML in the text is not rendered. `dir="auto"` lets Urdu lines read right to left.
 */
const components: Components = {
  p: ({ children }) => (
    <Typography variant="body1" dir="auto" sx={{ mb: 1.5, whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>
      {children}
    </Typography>
  ),
  h1: ({ children }) => (
    <Typography variant="h6" dir="auto" sx={{ mt: 1, mb: 1 }}>
      {children}
    </Typography>
  ),
  h2: ({ children }) => (
    <Typography variant="subtitle1" dir="auto" sx={{ fontWeight: 600, mt: 1, mb: 1 }}>
      {children}
    </Typography>
  ),
  h3: ({ children }) => (
    <Typography variant="subtitle2" dir="auto" sx={{ fontWeight: 600, mt: 1, mb: 0.5 }}>
      {children}
    </Typography>
  ),
  ul: ({ children }) => (
    <Box component="ul" dir="auto" sx={{ mt: 0, mb: 1.5, pl: 3 }}>
      {children}
    </Box>
  ),
  ol: ({ children }) => (
    <Box component="ol" dir="auto" sx={{ mt: 0, mb: 1.5, pl: 3 }}>
      {children}
    </Box>
  ),
  li: ({ children }) => (
    <Typography component="li" variant="body1" dir="auto" sx={{ mb: 0.5, lineHeight: 1.7 }}>
      {children}
    </Typography>
  ),
  a: ({ children, href }) => (
    <Link href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </Link>
  ),
  code: ({ children }) => (
    <Box component="code" sx={{ px: 0.5, borderRadius: 0.5, bgcolor: 'action.hover', fontSize: '0.875em' }}>
      {children}
    </Box>
  ),
  table: ({ children }) => (
    <TableContainer component={Paper} variant="outlined" sx={{ my: 1.5, maxWidth: '100%', overflowX: 'auto' }}>
      <Table size="small">{children}</Table>
    </TableContainer>
  ),
  thead: ({ children }) => <TableHead sx={{ bgcolor: 'action.hover' }}>{children}</TableHead>,
  tbody: ({ children }) => <TableBody>{children}</TableBody>,
  tr: ({ children }) => <TableRow>{children}</TableRow>,
  th: ({ children, style }) => (
    <TableCell dir="auto" sx={{ fontWeight: 600, whiteSpace: 'nowrap', textAlign: style?.textAlign }}>
      {children}
    </TableCell>
  ),
  td: ({ children, style }) => (
    <TableCell dir="auto" sx={{ whiteSpace: 'nowrap', textAlign: style?.textAlign }}>
      {children}
    </TableCell>
  ),
};

export function Markdown({ text }: { text: string }): React.JSX.Element {
  return (
    <Box sx={{ '& > :last-child': { mb: 0 } }}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {text}
      </ReactMarkdown>
    </Box>
  );
}
