'use client';

import { useEffect, useMemo, useState } from 'react';

import { useIntl } from 'react-intl';

import { MenuItem, Stack, TextField, Typography } from '@mui/material';

import { ProfileDialog } from '@/domains/students/dialogs/ProfileDialog';

import { Section } from '@/providers/service/app.schemas';
import { useSectionControllerCreate, useSectionControllerUpdate } from '@/providers/service/section/section';

import { FormattedMessage } from '@/theme/FormattedMessage';

import { useSectionActions } from '../hooks/useSectionActions';
import { classNumberOf, useAllSections, useClassLevels } from '../hooks/useSectionData';
import messages from '../messages';

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

interface SectionDialogProps {
  open: boolean;
  sessionId: string;
  branchId: string;
  /** Edit this section; leave out to add one */
  section?: Section;
  /** Preselect the class when adding */
  classLevelId?: string;
  onClose: () => void;
  onCreated?: (section: Section) => void;
}

/** Add a section (one class level, a letter free across both genders of the class) or rename one */
export function SectionDialog({
  open,
  sessionId,
  branchId,
  section,
  classLevelId,
  onClose,
  onCreated,
}: SectionDialogProps) {
  const create = useSectionControllerCreate();
  const update = useSectionControllerUpdate();
  const { onSuccess, onError } = useSectionActions();
  const intl = useIntl();
  const { levels, byId } = useClassLevels();
  const { data: sections } = useAllSections({ sessionId, branchId });

  const [levelId, setLevelId] = useState('');
  const [letter, setLetter] = useState('');
  const [name, setName] = useState('');
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (!open) return;
    setLevelId(section?.classLevelId ?? classLevelId ?? '');
    setLetter(section?.letter ?? '');
    setName(section?.name ?? '');
    setReason('');
  }, [open, section, classLevelId]);

  const classNumber = levelId ? classNumberOf(byId.get(levelId)?.code ?? '') : '';
  const used = useMemo(
    () =>
      (sections || [])
        .filter((s) => s.classNumber === classNumber && s.id !== section?.id)
        .map((s) => s.letter)
        .sort(),
    [sections, classNumber, section?.id],
  );

  const handleSubmit = () => {
    if (section) {
      update.mutate(
        {
          id: section.id,
          data: {
            ...(letter && letter !== section.letter ? { letter } : {}),
            name: name.trim() || null,
            ...(reason.trim() ? { reason: reason.trim() } : {}),
          },
        },
        {
          onSuccess: async () => {
            await onSuccess();
            onClose();
          },
          onError,
        },
      );
      return;
    }
    if (!levelId) return;
    create.mutate(
      {
        data: {
          sessionId,
          branchId,
          classLevelId: levelId,
          ...(letter ? { letter } : {}),
          ...(name.trim() ? { name: name.trim() } : {}),
        },
      },
      {
        onSuccess: async (res) => {
          await onSuccess(intl.formatMessage(messages.created, { name: res.data.displayName }));
          onCreated?.(res.data);
          onClose();
        },
        onError,
      },
    );
  };

  return (
    <ProfileDialog
      open={open}
      title={
        section ? (
          <FormattedMessage {...messages.editTitle} values={{ name: section.displayName }} />
        ) : (
          <FormattedMessage {...messages.createTitle} />
        )
      }
      onClose={onClose}
      onSubmit={handleSubmit}
      isSubmitting={create.isPending || update.isPending}
      maxWidth="xs"
    >
      <Stack spacing={2}>
        <TextField
          select
          size="small"
          fullWidth
          required
          disabled={!!section}
          label={<FormattedMessage {...messages.classLevel} />}
          value={byId.has(levelId) ? levelId : ''}
          onChange={(e) => {
            setLevelId(e.target.value);
            setLetter('');
          }}
        >
          {levels.map((l) => (
            <MenuItem key={l.id} value={l.id}>
              {l.name}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          size="small"
          fullWidth
          label={<FormattedMessage {...messages.letter} />}
          value={letter}
          onChange={(e) => setLetter(e.target.value)}
          disabled={!levelId}
          slotProps={{ select: { displayEmpty: true }, inputLabel: { shrink: true } }}
        >
          {!section && (
            <MenuItem value="">
              <FormattedMessage {...messages.letterAuto} />
            </MenuItem>
          )}
          {LETTERS.filter((l) => !used.includes(l)).map((l) => (
            <MenuItem key={l} value={l}>
              {l}
            </MenuItem>
          ))}
        </TextField>
        {classNumber && (
          <Typography variant="caption" color="text.secondary">
            {used.length ? (
              <FormattedMessage {...messages.lettersInUse} values={{ classNumber, letters: used.join(', ') }} />
            ) : (
              <FormattedMessage {...messages.lettersNone} values={{ classNumber }} />
            )}
          </Typography>
        )}
        <TextField
          size="small"
          fullWidth
          label={<FormattedMessage {...messages.nameOptional} />}
          helperText={<FormattedMessage {...messages.nameHint} />}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        {section && (
          <TextField
            size="small"
            fullWidth
            label={<FormattedMessage {...messages.reasonOptional} />}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        )}
      </Stack>
    </ProfileDialog>
  );
}
