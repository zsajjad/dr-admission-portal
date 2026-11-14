'use client';

import { useState } from 'react';

import Link from 'next/link';

import {
  ContentCopy as CopyIcon,
  Description as DocumentsIcon,
  Edit as EditIcon,
  JoinInner as MergeIcon,
  Lock as LockIcon,
  Phone as PhoneIcon,
} from '@mui/icons-material';
import { Avatar, Box, Button, Card, CardContent, Chip, IconButton, Stack, Tooltip, Typography } from '@mui/material';

import { OldGrs } from '@/domains/studentMerge/components/OldGrs';
import mergeMessages from '@/domains/studentMerge/messages';

import { AssetViewer } from '@/components/Asset';

import { Gender, Permission, StudentProfile } from '@/providers/service/app.schemas';

import { FormattedMessage, useFormattedMessage } from '@/theme/FormattedMessage';

import { usePermissions } from '@/hooks/usePermissions';

import { routes } from '@/router/routes';

import { DocumentsDialog } from '../dialogs/DocumentsDialog';
import { EditContactDialog } from '../dialogs/EditContactDialog';
import { EditIdentityDialog } from '../dialogs/EditIdentityDialog';
import messages from '../messages';
import { admissionStatusColor, admissionStatusMessage, ageInYears, cardStyle, formatBirthDate } from '../utils';

/** The most-used facts about the student, and the identity / contact / document edits */
export function ProfileHeader({ profile }: { profile: StudentProfile }) {
  const { student, admissions, permissions } = profile;
  const [dialog, setDialog] = useState<'identity' | 'contact' | 'documents' | null>(null);
  const [copied, setCopied] = useState(false);
  const { has } = usePermissions();

  const copyLabel = useFormattedMessage(messages.copyGr);
  const copiedLabel = useFormattedMessage(messages.copied);
  const notAllowed = useFormattedMessage(messages.editIdentityNotAllowed);

  const latest = admissions.find((a) => a.isActive);
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
      <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
        <Stack direction="row" spacing={2.5} alignItems="flex-start">
          {student.photoAsset ? (
            <Box sx={{ width: 96, height: 96, borderRadius: 2, overflow: 'hidden', flexShrink: 0 }}>
              <AssetViewer
                assetId={student.photoAsset.id}
                width={96}
                height={96}
                style={{ objectFit: 'cover' }}
                zoomable
              />
            </Box>
          ) : (
            <Avatar variant="rounded" sx={{ width: 96, height: 96, fontSize: 32, bgcolor: 'primary.light' }}>
              {initials}
            </Avatar>
          )}

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap" useFlexGap>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
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
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }} flexWrap="wrap" useFlexGap>
              <PhoneIcon fontSize="small" color="action" />
              <Typography variant="body2" dir="ltr">
                {[student.phone, student.alternatePhone].filter(Boolean).join(' · ')}
              </Typography>
            </Stack>
            {latest && (
              <Stack direction="row" spacing={1} sx={{ mt: 1.5 }} flexWrap="wrap" useFlexGap>
                <Chip size="small" color="primary" variant="outlined" label={latest.session.name} />
                <Chip size="small" label={latest.classLevel.name} />
                <Chip size="small" label={`${latest.branch.code} · ${latest.area.name}`} />
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

          <Stack spacing={1} sx={{ flexShrink: 0 }}>
            <Tooltip title={permissions.canEditIdentity ? '' : notAllowed}>
              <span>
                <Button
                  fullWidth
                  variant="contained"
                  size="small"
                  startIcon={permissions.canEditIdentity ? <EditIcon /> : <LockIcon />}
                  disabled={!permissions.canEditIdentity || !student.isActive}
                  onClick={() => setDialog('identity')}
                >
                  <FormattedMessage {...messages.editIdentity} />
                </Button>
              </span>
            </Tooltip>
            <Button
              variant="outlined"
              size="small"
              startIcon={<PhoneIcon />}
              disabled={!student.isActive}
              onClick={() => setDialog('contact')}
            >
              <FormattedMessage {...messages.editContact} />
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<DocumentsIcon />}
              disabled={!student.isActive}
              onClick={() => setDialog('documents')}
            >
              <FormattedMessage {...messages.editDocuments} />
            </Button>
            {has(Permission.studentsmerge) && student.isActive && (
              <Button
                variant="outlined"
                size="small"
                color="warning"
                startIcon={<MergeIcon />}
                component={Link}
                href={routes.studentMerge.withRecord(student.id)}
              >
                <FormattedMessage {...mergeMessages.findDuplicates} />
              </Button>
            )}
          </Stack>
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
