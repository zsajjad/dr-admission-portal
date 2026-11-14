'use client';

import * as React from 'react';

import { format } from 'date-fns';

import { Block as DeactivateIcon, Edit as EditIcon, Replay as ReactivateIcon } from '@mui/icons-material';
import { Avatar, Box, Button, Card, CardContent, Chip, CircularProgress, Grid, Stack, Typography } from '@mui/material';

import FormattedMessage from '@/theme/FormattedMessage';

import messages from './messages';

export interface DetailHeaderField {
  key: string;
  label: React.ReactNode;
  value?: React.ReactNode;
  /** Codes and numbers read left to right in Urdu too */
  dir?: 'ltr';
}

export interface DetailHeaderProps {
  /** A short code or letter for the square mark, e.g. a branch or van code */
  mark?: React.ReactNode;
  /** Background of the mark, e.g. a van's color; the brand green when left out */
  markColor?: string;
  /** The record's own name */
  title: React.ReactNode;
  /** Extra chips after the title (the active chip is added from `isActive`) */
  chips?: React.ReactNode;
  isActive?: boolean;
  fields?: DetailHeaderField[];
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
  onEdit?: () => void;
  /** Deactivate when active, reactivate when not */
  onToggleActive?: () => void;
  isToggling?: boolean;
  /** More buttons, above Edit */
  actions?: React.ReactNode;
}

function When({ at, by }: { at: string; by?: string }) {
  return (
    <>
      <span dir="ltr">{format(new Date(at), 'd MMM yyyy, h:mm a')}</span>
      {by ? (
        <Typography component="span" variant="body2" color="text.secondary">
          {' '}
          <FormattedMessage {...messages.by} values={{ name: by }} />
        </Typography>
      ) : null}
    </>
  );
}

/**
 * The top card of a record's page: its name as the title, a status chip, its few facts in a row
 * and its actions on the right. Same shape as the staff user and section pages.
 */
export function DetailHeader({
  mark,
  markColor,
  title,
  chips,
  isActive,
  fields = [],
  createdAt,
  createdBy,
  updatedAt,
  updatedBy,
  onEdit,
  onToggleActive,
  isToggling,
  actions,
}: DetailHeaderProps): React.JSX.Element {
  const allFields: DetailHeaderField[] = [
    ...fields,
    ...(createdAt
      ? [
          {
            key: 'added',
            label: <FormattedMessage {...messages.added} />,
            value: <When at={createdAt} by={createdBy} />,
          },
        ]
      : []),
    ...(updatedAt
      ? [
          {
            key: 'last-changed',
            label: <FormattedMessage {...messages.lastChanged} />,
            value: <When at={updatedAt} by={updatedBy} />,
          },
        ]
      : []),
  ];
  const hasActions = !!(actions || onEdit || onToggleActive);

  return (
    <Card>
      <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems={{ md: 'flex-start' }}>
          {mark ? (
            <Avatar
              variant="rounded"
              sx={(theme) => ({
                width: 72,
                height: 72,
                fontSize: 24,
                fontWeight: 700,
                bgcolor: markColor ?? 'primary.main',
                color: markColor ? theme.palette.getContrastText(markColor) : 'primary.contrastText',
              })}
            >
              {mark}
            </Avatar>
          ) : null}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" useFlexGap>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                {title}
              </Typography>
              {chips}
              {isActive === undefined ? null : (
                <Chip
                  size="small"
                  color={isActive ? 'success' : 'default'}
                  label={<FormattedMessage {...(isActive ? messages.active : messages.deactivated)} />}
                />
              )}
            </Stack>
            {allFields.length > 0 ? (
              <Grid container spacing={2} sx={{ mt: 1.5 }}>
                {allFields.map((field) => (
                  <Grid key={field.key} size={{ xs: 6, md: 3 }}>
                    <Typography variant="caption" color="text.secondary" component="div">
                      {field.label}
                    </Typography>
                    <Typography variant="body1" component="div" dir={field.dir} sx={{ overflowWrap: 'anywhere' }}>
                      {field.value ?? '--'}
                    </Typography>
                  </Grid>
                ))}
              </Grid>
            ) : null}
          </Box>
          {hasActions ? (
            <Stack spacing={1} sx={{ flexShrink: 0, minWidth: 200 }}>
              {actions}
              {onEdit ? (
                <Button variant="outlined" size="small" startIcon={<EditIcon />} onClick={onEdit}>
                  <FormattedMessage {...messages.edit} />
                </Button>
              ) : null}
              {onToggleActive ? (
                <Button
                  variant="outlined"
                  size="small"
                  color={isActive ? 'error' : 'primary'}
                  disabled={isToggling}
                  startIcon={
                    isToggling ? (
                      <CircularProgress size={16} color="inherit" />
                    ) : isActive ? (
                      <DeactivateIcon />
                    ) : (
                      <ReactivateIcon />
                    )
                  }
                  onClick={onToggleActive}
                >
                  <FormattedMessage {...(isActive ? messages.deactivate : messages.reactivate)} />
                </Button>
              ) : null}
            </Stack>
          ) : null}
        </Stack>
      </CardContent>
    </Card>
  );
}
