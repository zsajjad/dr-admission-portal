'use client';

import { useState } from 'react';

import Link from 'next/link';

import {
  ContentCopy as CopyIcon,
  Description as DocumentsIcon,
  Edit as EditIcon,
  ExpandMore as MenuIcon,
  JoinInner as MergeIcon,
  Lock as LockIcon,
  Phone as PhoneIcon,
} from '@mui/icons-material';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';

import { OldGrs } from '@/domains/studentMerge/components/OldGrs';
import mergeMessages from '@/domains/studentMerge/messages';

import { AssetViewer } from '@/components/Asset';

import { Gender, Permission, StudentProfile, StudentProfileAdmission } from '@/providers/service/app.schemas';

import { FormattedMessage, useFormattedMessage } from '@/theme/FormattedMessage';

import { usePermissions } from '@/hooks/usePermissions';

import { routes } from '@/router/routes';

import { DocumentsDialog } from '../dialogs/DocumentsDialog';
import { EditContactDialog } from '../dialogs/EditContactDialog';
import { EditIdentityDialog } from '../dialogs/EditIdentityDialog';
import messages from '../messages';
import {
  admissionStatusColor,
  admissionStatusMessage,
  ageInYears,
  cardStyle,
  contrastText,
  formatBirthDate,
} from '../utils';

type DialogName = 'identity' | 'contact' | 'documents';

interface ProfileHeaderProps {
  profile: StudentProfile;
  /** This session's admission, when there is one; the chips show it (or else the latest active admission) */
  current?: StudentProfileAdmission;
}

/**
 * Who the student is and where they are this session, in a few lines. The identity, contact and
 * document edits are in the Edit menu; the full details are further down the page.
 */
export function ProfileHeader({ profile, current }: ProfileHeaderProps) {
  const { student, admissions, permissions } = profile;
  const [dialog, setDialog] = useState<DialogName | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [copied, setCopied] = useState(false);
  const { has } = usePermissions();

  const copyLabel = useFormattedMessage(messages.copyGr);
  const copiedLabel = useFormattedMessage(messages.copied);
  const notAllowed = useFormattedMessage(messages.editIdentityNotAllowed);

  const latest = current ?? admissions.find((a) => a.isActive);
  const open = (name: DialogName) => {
    setMenuAnchor(null);
    setDialog(name);
  };
  const age = ageInYears(student.dateOfBirth);
  const initials = student.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase();

  const handleCopy = async () => {
    await navigator.clipboard?.writeText(student.grNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Card sx={cardStyle}>
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Stack direction="row" spacing={2} alignItems="flex-start">
          {student.photoAsset ? (
            <Box sx={{ width: 72, height: 72, borderRadius: 2, overflow: 'hidden', flexShrink: 0 }}>
              <AssetViewer
                assetId={student.photoAsset.id}
                width={72}
                height={72}
                style={{ objectFit: 'cover' }}
                zoomable
              />
            </Box>
          ) : (
            <Avatar variant="rounded" sx={{ width: 72, height: 72, fontSize: 26, bgcolor: 'primary.light' }}>
              {initials}
            </Avatar>
          )}

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap" useFlexGap>
              <Typography variant="h5" sx={{ fontWeight: 700, lineHeight: 1.3 }}>
                {student.name}
              </Typography>
              <Chip
                label={student.grNumber}
                variant="outlined"
                sx={{ fontFamily: 'monospace', fontWeight: 600 }}
                dir="ltr"
              />
              <Tooltip title={copied ? copiedLabel : copyLabel}>
                <IconButton size="small" onClick={handleCopy}>
                  <CopyIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>
            <OldGrs grNumber={student.grNumber} />
            <Typography variant="body1" color="text.secondary" sx={{ mt: 0.25 }}>
              <FormattedMessage
                {...(student.gender === Gender.FEMALE ? messages.daughterOf : messages.sonOf)}
                values={{ name: student.fatherName }}
              />
              {' · '}
              <FormattedMessage {...(student.gender === Gender.FEMALE ? messages.female : messages.male)} />
              {age !== undefined && (
                <>
                  {' · '}
                  <FormattedMessage {...messages.ageYears} values={{ years: String(age) }} />
                </>
              )}
              {' · '}
              <span dir="ltr">{formatBirthDate(student.dateOfBirth)}</span>
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }} flexWrap="wrap" useFlexGap>
              <PhoneIcon fontSize="small" color="action" />
              <Typography variant="body2" dir="ltr">
                {[student.phone, student.alternatePhone].filter(Boolean).join(' · ')}
              </Typography>
            </Stack>
            {latest && (
              <Stack direction="row" spacing={1} sx={{ mt: 1 }} flexWrap="wrap" useFlexGap>
                <Chip size="small" color="primary" variant="outlined" label={latest.session.name} />
                <Chip size="small" label={latest.classLevel.name} />
                <Chip
                  size="small"
                  variant={latest.section ? 'filled' : 'outlined'}
                  color={latest.section ? 'default' : 'warning'}
                  label={
                    latest.section ? (
                      <FormattedMessage {...messages.sectionLetter} values={{ letter: latest.section.letter }} />
                    ) : (
                      <FormattedMessage {...messages.sectionNotPlacedShort} />
                    )
                  }
                />
                <Chip size="small" label={`${latest.branch.code} · ${latest.area.name}`} />
                {latest.van && (
                  <Chip
                    size="small"
                    label={latest.van.name}
                    sx={{ bgcolor: latest.van.colorHex, color: contrastText(latest.van.colorHex), fontWeight: 600 }}
                  />
                )}
                <Chip
                  size="small"
                  color={admissionStatusColor(latest.status)}
                  label={<FormattedMessage {...admissionStatusMessage(latest.status)} />}
                />
                <Chip
                  size="small"
                  color={latest.isFeePaid ? 'success' : 'default'}
                  variant={latest.isFeePaid ? 'filled' : 'outlined'}
                  label={<FormattedMessage {...(latest.isFeePaid ? messages.feePaid : messages.feeUnpaid)} />}
                />
              </Stack>
            )}
          </Box>

          <Box sx={{ flexShrink: 0 }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<EditIcon />}
              endIcon={<MenuIcon />}
              disabled={!student.isActive}
              onClick={(e) => setMenuAnchor(e.currentTarget)}
            >
              <FormattedMessage {...messages.editMenu} />
            </Button>
            <Menu
              anchorEl={menuAnchor}
              open={!!menuAnchor}
              onClose={() => setMenuAnchor(null)}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
              <Tooltip title={permissions.canEditIdentity ? '' : notAllowed} placement="left">
                <span>
                  <MenuItem disabled={!permissions.canEditIdentity} onClick={() => open('identity')}>
                    <ListItemIcon>
                      {permissions.canEditIdentity ? <EditIcon fontSize="small" /> : <LockIcon fontSize="small" />}
                    </ListItemIcon>
                    <ListItemText>
                      <FormattedMessage {...messages.editIdentity} />
                    </ListItemText>
                  </MenuItem>
                </span>
              </Tooltip>
              <MenuItem onClick={() => open('contact')}>
                <ListItemIcon>
                  <PhoneIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>
                  <FormattedMessage {...messages.editContact} />
                </ListItemText>
              </MenuItem>
              <MenuItem onClick={() => open('documents')}>
                <ListItemIcon>
                  <DocumentsIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>
                  <FormattedMessage {...messages.editDocuments} />
                </ListItemText>
              </MenuItem>
              {has(Permission.studentsmerge) && (
                <MenuItem component={Link} href={routes.studentMerge.withRecord(student.id)}>
                  <ListItemIcon>
                    <MergeIcon fontSize="small" color="warning" />
                  </ListItemIcon>
                  <ListItemText>
                    <FormattedMessage {...mergeMessages.findDuplicates} />
                  </ListItemText>
                </MenuItem>
              )}
            </Menu>
          </Box>
        </Stack>
      </CardContent>

      {permissions.canEditIdentity && (
        <EditIdentityDialog open={dialog === 'identity'} student={student} onClose={() => setDialog(null)} />
      )}
      <EditContactDialog open={dialog === 'contact'} student={student} onClose={() => setDialog(null)} />
      <DocumentsDialog open={dialog === 'documents'} student={student} onClose={() => setDialog(null)} />
    </Card>
  );
}
