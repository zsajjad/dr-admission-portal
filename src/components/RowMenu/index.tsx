'use client';

import * as React from 'react';

import { MoreVert as MoreIcon } from '@mui/icons-material';
import { IconButton, ListItemIcon, ListItemText, Menu, MenuItem, Tooltip } from '@mui/material';

import { useFormattedMessage } from '@/theme/FormattedMessage';

import messages from './messages';

export interface RowMenuItem {
  key: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}

export interface RowMenuProps {
  items: RowMenuItem[];
}

/**
 * The ⋮ at the end of a table row: the actions that are used less often, so the row keeps
 * only its one or two main buttons. Clicks never reach the row (a row click opens the record).
 */
export function RowMenu({ items }: RowMenuProps): React.JSX.Element | null {
  const [anchor, setAnchor] = React.useState<HTMLElement | null>(null);
  const moreLabel = useFormattedMessage(messages.more);

  if (items.length === 0) return null;

  return (
    <>
      <Tooltip title={moreLabel}>
        <IconButton
          size="small"
          aria-label={moreLabel}
          aria-haspopup="menu"
          aria-expanded={anchor ? 'true' : undefined}
          onClick={(e) => {
            e.stopPropagation();
            setAnchor(e.currentTarget);
          }}
        >
          <MoreIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchor}
        open={!!anchor}
        onClose={() => setAnchor(null)}
        onClick={(e) => e.stopPropagation()}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        {items.map((item) => (
          <MenuItem
            key={item.key}
            dense
            disabled={item.disabled}
            onClick={() => {
              setAnchor(null);
              item.onClick();
            }}
          >
            {item.icon ? <ListItemIcon>{item.icon}</ListItemIcon> : null}
            <ListItemText>{item.label}</ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
