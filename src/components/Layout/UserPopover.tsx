'use client';
import React from 'react';

import { LockKeyIcon } from '@phosphor-icons/react/dist/ssr/LockKey';
import { SignOutIcon } from '@phosphor-icons/react/dist/ssr/SignOut';

import RouterLink from 'next/link';

import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import ListItemIcon from '@mui/material/ListItemIcon';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import Popover from '@mui/material/Popover';
import Typography from '@mui/material/Typography';

import { FormattedMessage } from '@/theme/FormattedMessage';

import { useAuthContext } from '@/contexts/AuthContext';

import { routes } from '@/router/routes';

import messages from './messages';

export interface UserPopoverProps {
  anchorEl: Element | null;
  onClose: () => void;
  open: boolean;
}

export function UserPopover({ anchorEl, onClose, open }: UserPopoverProps): React.JSX.Element {
  const { user, signOut } = useAuthContext();

  return (
    <Popover
      anchorEl={anchorEl}
      anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
      onClose={onClose}
      open={open}
      slotProps={{ paper: { sx: { width: '240px' } } }}
    >
      <Box sx={{ p: '16px 20px ' }}>
        <Typography variant="subtitle1">{user?.name}</Typography>
        <Typography color="text.secondary" variant="body2">
          {user?.email}
        </Typography>
      </Box>
      <Divider />
      <MenuList disablePadding sx={{ p: '8px', '& .MuiMenuItem-root': { borderRadius: 1 } }}>
        <MenuItem component={RouterLink} href={routes.auth.changePassword} onClick={onClose}>
          <ListItemIcon>
            <LockKeyIcon fontSize="var(--icon-fontSize-md)" />
          </ListItemIcon>
          <FormattedMessage {...messages.changePassword} />
        </MenuItem>
        <MenuItem onClick={signOut}>
          <ListItemIcon>
            <SignOutIcon fontSize="var(--icon-fontSize-md)" />
          </ListItemIcon>
          <FormattedMessage {...messages.signOut} />
        </MenuItem>
      </MenuList>
    </Popover>
  );
}
