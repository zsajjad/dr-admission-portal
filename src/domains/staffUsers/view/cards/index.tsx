'use client';

import { useEffect, useMemo, useState } from 'react';

import { createPortal } from 'react-dom';

import QRCode from 'qrcode';

import { useRouter, useSearchParams } from 'next/navigation';

import { ArrowBack as BackIcon, Print as PrintIcon } from '@mui/icons-material';
import { Alert, Box, Button, GlobalStyles, Skeleton, Stack, Typography } from '@mui/material';

import { cardStyle } from '@/domains/students/utils';

import { StaffUserEntity } from '@/providers/service/app.schemas';

import { FormattedMessage, useFormattedMessage } from '@/theme/FormattedMessage';

import images from '@/assets/images';

import { routes } from '@/router/routes';

import { extractNetworkError } from '@/utils/extractNetworkError';

import { useAllStaffUsers } from '../../hooks/useAllStaffUsers';
import messages from '../../messages';
import { roleMessage, STAFF_ROLES } from '../../utils';

/** CR80 (ISO/IEC 7810 ID-1): 85.60 × 53.98 mm. Ten fit on an A4 sheet, two across and five down. */
const CARD_W = '85.6mm';
const CARD_H = '53.98mm';
const PER_SHEET = 10;
const PRINT_ROOT_ID = 'staff-card-print';
const ORG_NAME = 'Danishgah-e-Ramzan';
// cspell:disable-next-line
const ORG_NAME_UR = 'دانشگاہِ رمضان';

/**
 * Printable staff cards. With ?ids= it prints those users; without, every active user.
 * The QR code holds only the staff ID, never a login code.
 */
export function StaffCardsView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const ids = useMemo(
    () =>
      (searchParams.get('ids') || '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    [searchParams],
  );
  const { data, isLoading, isError, error } = useAllStaffUsers({});
  const users = useMemo(() => {
    const active = (data || []).filter((u) => u.isActive);
    return ids.length ? active.filter((u) => ids.includes(u.id)) : active;
  }, [data, ids]);
  const sheets = useMemo(() => {
    const out: StaffUserEntity[][] = [];
    for (let i = 0; i < users.length; i += PER_SHEET) out.push(users.slice(i, i + PER_SHEET));
    return out;
  }, [users]);

  // The print copy goes straight under <body>, so the app's layout can't clip or shift it
  const [printRoot, setPrintRoot] = useState<HTMLElement | null>(null);
  useEffect(() => {
    const el = document.createElement('div');
    el.id = PRINT_ROOT_ID;
    document.body.appendChild(el);
    setPrintRoot(el);
    return () => el.remove();
  }, []);

  const sheetsMarkup = sheets.map((sheet, i) => <Sheet key={i} users={sheet} />);

  return (
    <Stack spacing={2}>
      <GlobalStyles
        styles={{
          [`#${PRINT_ROOT_ID}`]: { display: 'none' },
          '@media print': {
            '@page': { size: 'A4 portrait', margin: 0 },
            'html, body': { margin: 0, padding: 0, background: '#fff' },
            [`body > *:not(#${PRINT_ROOT_ID})`]: { display: 'none !important' },
            [`#${PRINT_ROOT_ID}`]: { display: 'block' },
          },
        }}
      />

      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
        alignItems={{ md: 'center' }}
        justifyContent="space-between"
        sx={{ ...cardStyle, bgcolor: 'background.paper', p: 2 }}
      >
        <Box>
          <Typography variant="body2">
            <FormattedMessage {...messages.cardsIntro} />
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            <FormattedMessage
              {...messages.cardsCount}
              values={{ count: String(users.length), pages: String(sheets.length) }}
            />
            {' · '}
            <FormattedMessage {...messages.cardsInactiveSkipped} />
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} sx={{ flexShrink: 0 }}>
          <Button startIcon={<BackIcon />} onClick={() => router.push(routes.staffUsers.listing)}>
            <FormattedMessage {...messages.back} />
          </Button>
          <Button variant="contained" startIcon={<PrintIcon />} disabled={!users.length} onClick={() => window.print()}>
            <FormattedMessage {...messages.print} />
          </Button>
        </Stack>
      </Stack>

      {isError && <Alert severity="error">{extractNetworkError(error)}</Alert>}
      {isLoading && <Skeleton variant="rounded" height={400} />}
      {!isLoading && !users.length && (
        <Alert severity="info">
          <FormattedMessage {...messages.cardsNone} />
        </Alert>
      )}

      {/* On screen: the sheets as they will print */}
      <Stack spacing={3} alignItems="center" sx={{ overflowX: 'auto', py: 1 }}>
        {sheets.map((sheet, i) => (
          <Box key={i} sx={{ boxShadow: '0 2px 12px rgba(0,0,0,0.12)' }}>
            <Sheet users={sheet} />
          </Box>
        ))}
      </Stack>

      {printRoot && createPortal(sheetsMarkup, printRoot)}
    </Stack>
  );
}

function Sheet({ users }: { users: StaffUserEntity[] }) {
  return (
    <Box
      sx={{
        width: '210mm',
        height: '297mm',
        boxSizing: 'border-box',
        bgcolor: '#fff',
        // A 2 × 5 grid, centred on the page; cards sit in the same place on every sheet
        display: 'grid',
        gridTemplateColumns: `repeat(2, ${CARD_W})`,
        gridAutoRows: CARD_H,
        columnGap: '8mm',
        rowGap: '4mm',
        alignContent: 'start',
        pt: '5.5mm', // (297mm − 5 cards − 4 gaps) / 2
        justifyContent: 'center',
        breakAfter: 'page',
        pageBreakAfter: 'always',
        '&:last-of-type': { breakAfter: 'auto', pageBreakAfter: 'auto' },
        WebkitPrintColorAdjust: 'exact',
        printColorAdjust: 'exact',
      }}
    >
      {users.map((u) => (
        <StaffCard key={u.id} user={u} />
      ))}
    </Box>
  );
}

function StaffCard({ user }: { user: StaffUserEntity }) {
  const [qr, setQr] = useState<string>();
  const staffLabel = useFormattedMessage(messages.cardStaff);
  const roleText = STAFF_ROLES.filter((r) => user.roles.includes(r));

  useEffect(() => {
    let live = true;
    // Only the staff ID. Never put a login code here.
    QRCode.toDataURL(user.staffId, { errorCorrectionLevel: 'M', margin: 0, width: 240 }).then((url) => {
      if (live) setQr(url);
    });
    return () => {
      live = false;
    };
  }, [user.staffId]);

  return (
    <Box
      dir="ltr"
      sx={{
        width: CARD_W,
        height: CARD_H,
        boxSizing: 'border-box',
        border: '0.2mm dashed #9e9e9e', // cut line
        borderRadius: '3mm',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'inherit',
        color: '#1E1033',
        bgcolor: '#fff',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: '2mm',
          px: '3mm',
          height: '11mm',
          bgcolor: '#1E1033',
          color: '#fff',
        }}
      >
        <Box
          component="img"
          src={images.Logo.src}
          alt=""
          sx={{ height: '8mm', width: '8mm', objectFit: 'contain', bgcolor: '#fff', borderRadius: '1.5mm', p: '0.5mm' }}
        />
        <Box sx={{ flex: 1, lineHeight: 1.1 }}>
          <Box sx={{ fontSize: '3.4mm', fontWeight: 700 }}>{ORG_NAME}</Box>
          <Box sx={{ fontSize: '2.6mm', opacity: 0.85 }}>{staffLabel}</Box>
        </Box>
        <Box dir="rtl" sx={{ fontSize: '3.6mm', fontWeight: 700 }}>
          {ORG_NAME_UR}
        </Box>
      </Box>
      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: '3mm', px: '3mm' }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ fontSize: '4.4mm', fontWeight: 700, lineHeight: 1.15, overflowWrap: 'anywhere' }}>{user.name}</Box>
          <Box sx={{ fontSize: '3mm', mt: '1mm', color: '#5c5470' }}>
            {roleText.map((r, i) => (
              <span key={r}>
                {i > 0 && ' · '}
                <FormattedMessage {...roleMessage(r)} />
              </span>
            ))}
          </Box>
          <Box sx={{ mt: '2.5mm', fontSize: '2.6mm', color: '#5c5470' }}>
            <FormattedMessage {...messages.staffId} />
          </Box>
          <Box
            sx={{ fontFamily: 'monospace', fontSize: '7mm', fontWeight: 700, letterSpacing: '0.6mm', lineHeight: 1 }}
          >
            {user.staffId}
          </Box>
        </Box>
        <Box sx={{ width: '26mm', height: '26mm', flexShrink: 0 }}>
          {qr && <Box component="img" src={qr} alt="" sx={{ width: '100%', height: '100%', display: 'block' }} />}
        </Box>
      </Box>
    </Box>
  );
}
