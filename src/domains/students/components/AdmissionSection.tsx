import Link from 'next/link';

import { Button, Chip, Stack, Typography } from '@mui/material';

import sectionMessages from '@/domains/sections/messages';

import { Permission, StudentProfileAdmission } from '@/providers/service/app.schemas';

import { FormattedMessage } from '@/theme/FormattedMessage';

import { usePermissions } from '@/hooks/usePermissions';

import { routes } from '@/router/routes';

import messages from '../messages';
import { formatDate } from '../utils';

import { SectionCard } from './SectionCard';

interface AdmissionSectionProps {
  admission: StudentProfileAdmission;
}

/** The section this admission is placed in: letter, teachers, and when and by whom the student was placed. */
export function AdmissionSection({ admission }: AdmissionSectionProps) {
  const { has } = usePermissions();
  const canManage = has(Permission.sectionsmanage);
  const section = admission.section;

  if (!section) {
    return (
      <SectionCard
        title={<FormattedMessage {...messages.sectionSlotTitle} />}
        placeholder
        actions={
          canManage && admission.isActive ? (
            <Button size="small" component={Link} href={routes.sections.listing}>
              <FormattedMessage {...messages.sectionPlace} />
            </Button>
          ) : undefined
        }
      >
        <Typography variant="body2" color="text.secondary">
          <FormattedMessage {...messages.sectionNotPlaced} />
        </Typography>
      </SectionCard>
    );
  }

  return (
    <SectionCard
      title={<FormattedMessage {...messages.sectionSlotTitle} />}
      summary={
        !section.isActive ? (
          <Chip
            size="small"
            color="warning"
            variant="outlined"
            label={<FormattedMessage {...messages.sectionClosed} />}
          />
        ) : undefined
      }
      actions={
        canManage ? (
          <Button size="small" component={Link} href={routes.sections.detail(section.id)}>
            <FormattedMessage {...messages.sectionOpen} />
          </Button>
        ) : undefined
      }
    >
      <Stack spacing={1}>
        <Stack direction="row" spacing={1} alignItems="baseline">
          <Typography variant="h4" sx={{ fontWeight: 700, lineHeight: 1 }}>
            {section.letter}
          </Typography>
          {section.name && (
            <Typography variant="body2" color="text.secondary">
              {section.name}
            </Typography>
          )}
        </Stack>
        {section.teachers.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            <FormattedMessage {...messages.sectionNoTeachers} />
          </Typography>
        ) : (
          section.teachers.map((t) => (
            <Typography key={t.staffUserId} variant="body2">
              {t.name}{' '}
              <Typography component="span" variant="caption" color="text.secondary">
                · <FormattedMessage {...sectionMessages[`role${t.role}`]} />
              </Typography>
            </Typography>
          ))
        )}
        {section.assignedAt && (
          <Typography variant="caption" color="text.secondary">
            {section.assignedBy ? (
              <FormattedMessage
                {...messages.sectionPlacedBy}
                values={{ name: section.assignedBy.name, date: formatDate(section.assignedAt) }}
              />
            ) : (
              <FormattedMessage {...messages.sectionPlacedOn} values={{ date: formatDate(section.assignedAt) }} />
            )}
          </Typography>
        )}
      </Stack>
    </SectionCard>
  );
}
