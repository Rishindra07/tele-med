import React, { useState } from 'react';
import {
  Box,
  Button,
  Chip,
  InputAdornment,
  MenuItem,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import {
  AccessTimeRounded as TimeIcon,
  LocalPhoneOutlined as PhoneIcon,
  NavigationOutlined as NavigationIcon,
  NotificationsNoneRounded as NotificationIcon,
  PlaceOutlined as PlaceIcon,
  SearchRounded as SearchIcon,
  SendRounded as SendIcon,
  DescriptionOutlined as PrescriptionIcon
} from '@mui/icons-material';
import PatientShell from '../../components/patient/PatientShell';

const colors = {
  paper: '#fffdf8',
  line: '#d8d0c4',
  soft: '#e9e2d8',
  text: '#2c2b28',
  muted: '#8b857d',
  green: '#26a37c',
  greenSoft: '#dff3eb',
  blue: '#4a90e2',
  blueSoft: '#e7f0fe',
  amber: '#c57d17',
  amberSoft: '#fbefdc',
  lime: '#7aa63d',
  limeSoft: '#eef6de',
  red: '#d9635b',
  redSoft: '#fdeaea',
  gray: '#8f8b85',
  graySoft: '#f1eee7'
};

const pharmacyCards = {
  open: [
    {
      id: 'am',
      initials: 'AM',
      name: 'Arora Medical Store',
      type: 'General Pharmacy',
      distance: '0.8 km away',
      hours: '8 AM – 9 PM',
      phone: '+91 98140 22211',
      status: 'Open',
      note: 'Prescription received',
      subnote: 'Stock for your prescription (18 Mar 2026):',
      meds: [
        ['Paracetamol 500mg', 'ok'],
        ['Amoxicillin 250mg', 'ok'],
        ['ORS Sachets', 'ok'],
        ['Vitamin C (low stock)', 'warn']
      ]
    },
    {
      id: 'ja',
      initials: 'JA',
      name: 'Jan Aushadhi Kendra',
      type: 'Government Generic Pharmacy',
      distance: '2.1 km away',
      hours: '9 AM – 6 PM',
      phone: 'Up to 70% cheaper',
      status: 'Open',
      meds: [
        ['Paracetamol 500mg', 'ok'],
        ['Amoxicillin 250mg', 'ok'],
        ['Vitamin C', 'ok']
      ]
    }
  ],
  partial: [
    {
      id: 'sp',
      initials: 'SP',
      name: 'Singh Pharma',
      type: 'General Pharmacy',
      distance: '1.4 km away',
      hours: '8 AM – 8 PM',
      status: 'Partial stock',
      meds: [
        ['Paracetamol 500mg', 'ok'],
        ['Amoxicillin — Out of stock', 'bad'],
        ['ORS (low stock)', 'warn']
      ]
    },
    {
      id: 'cm',
      initials: 'CM',
      name: 'City Medical Centre',
      type: 'Hospital Pharmacy',
      distance: '3.2 km away',
      hours: 'Opens Mon 9 AM',
      status: 'Closed',
      meds: [['Full prescription available', 'ok']]
    }
  ]
};

const nearbyList = [
  ['Arora Medical', '0.8 km', 'Open'],
  ['Jan Aushadhi', '2.1 km', 'Open'],
  ['Singh Pharma', '1.4 km', 'Open'],
  ['City Medical', '3.2 km', 'Closed']
];

const helpfulTips = [
  ['Jan Aushadhi stores often have lower-cost generic options.', colors.green],
  ['Always carry your prescription code - pharmacies can access it in the app.', colors.blue],
  ['If a medicine is unavailable, ask the doctor to modify the brand.', colors.amber],
  ['Never buy prescription medicines without a valid doctor note.', colors.red]
];

const activePrescription = ['Paracetamol 500mg', 'Amoxicillin 250mg', 'ORS Sachets', 'Vitamin C 500mg'];

const medStyle = (kind) => {
  if (kind === 'ok') return { bg: colors.limeSoft, color: '#618d25' };
  if (kind === 'warn') return { bg: colors.amberSoft, color: colors.amber };
  if (kind === 'bad') return { bg: colors.redSoft, color: colors.red };
  return { bg: colors.graySoft, color: colors.gray };
};

function PharmacyCard({ item, compact = false }) {
  const statusTone =
    item.status === 'Open'
      ? { bg: colors.greenSoft, color: colors.green }
      : item.status === 'Partial stock'
        ? { bg: colors.amberSoft, color: colors.amber }
        : { bg: colors.graySoft, color: colors.gray };

  return (
    <Box
      sx={{
        p: 2.25,
        borderRadius: 3,
        border: `1px solid ${item.status === 'Open' && !compact ? colors.green : colors.soft}`,
        bgcolor: '#fff'
      }}
    >
      <Stack direction="row" spacing={2} alignItems="flex-start">
        <Box
          sx={{
            width: 46,
            height: 46,
            borderRadius: 2,
            bgcolor: item.initials === 'AM' ? '#dff3eb' : item.initials === 'JA' ? '#e7f0fe' : item.initials === 'SP' ? '#fff1dc' : '#f1eee7',
            color: item.initials === 'AM' ? '#176d57' : item.initials === 'JA' ? '#2f6db9' : item.initials === 'SP' ? '#8c5a12' : '#605b55',
            display: 'grid',
            placeItems: 'center',
            fontWeight: 700,
            fontSize: 24,
            flexShrink: 0
          }}
        >
          {item.initials}
        </Box>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack direction="row" justifyContent="space-between" spacing={1} alignItems="flex-start">
            <Box>
              <Typography sx={{ fontSize: 17, lineHeight: 1.15 }}>{item.name}</Typography>
              <Typography sx={{ color: colors.muted, fontSize: 14.5 }}>{item.type}</Typography>
            </Box>
            <Chip label={item.status} sx={{ height: 28, bgcolor: statusTone.bg, color: statusTone.color, fontSize: 13.5 }} />
          </Stack>

          <Stack direction="row" spacing={1.3} useFlexGap flexWrap="wrap" sx={{ mt: 1.15 }}>
            <Stack direction="row" spacing={0.5} alignItems="center">
              <PlaceIcon sx={{ fontSize: 16, color: colors.muted }} />
              <Typography sx={{ color: colors.muted, fontSize: 14.5 }}>{item.distance}</Typography>
            </Stack>
            <Stack direction="row" spacing={0.5} alignItems="center">
              <TimeIcon sx={{ fontSize: 16, color: colors.muted }} />
              <Typography sx={{ color: colors.muted, fontSize: 14.5 }}>{item.hours}</Typography>
            </Stack>
            {item.phone && (
              <Stack direction="row" spacing={0.5} alignItems="center">
                <PhoneIcon sx={{ fontSize: 16, color: colors.muted }} />
                <Typography sx={{ color: item.phone.includes('cheaper') ? colors.blue : colors.muted, fontSize: 14.5 }}>
                  {item.phone}
                </Typography>
              </Stack>
            )}
          </Stack>

          {item.note && (
            <Typography sx={{ mt: 1.1, color: colors.green, fontSize: 14.8 }}>{item.note}</Typography>
          )}
          {item.subnote && (
            <Typography sx={{ mt: 0.6, color: colors.muted, fontSize: 14.5 }}>{item.subnote}</Typography>
          )}

          <Stack direction="row" spacing={0.8} useFlexGap flexWrap="wrap" sx={{ mt: 1.1 }}>
            {item.meds.map(([label, kind]) => {
              const tone = medStyle(kind);
              return <Chip key={label} label={label} sx={{ bgcolor: tone.bg, color: tone.color, fontSize: 13.5 }} />;
            })}
          </Stack>

          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mt: 1.8 }}>
            {item.status !== 'Closed' && (
              <Button sx={{ px: 2.4, py: 0.95, borderRadius: 2.2, border: `1px solid ${colors.line}`, color: colors.text, textTransform: 'none', fontSize: 15 }}>
                Send Prescription
              </Button>
            )}
            <Button sx={{ px: 2.4, py: 0.95, borderRadius: 2.2, border: `1px solid ${colors.line}`, color: colors.text, textTransform: 'none', fontSize: 15 }}>
              {item.status === 'Closed' ? 'Get Directions' : 'Get Directions'}
            </Button>
            <Button sx={{ px: 2.4, py: 0.95, borderRadius: 2.2, border: `1px solid ${colors.line}`, color: colors.text, textTransform: 'none', fontSize: 15 }}>
              {item.status === 'Closed' ? 'Remind me when open' : 'Call Pharmacy'}
            </Button>
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
}

export default function PatientPharmacies() {
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('nearest');

  return (
    <PatientShell activeItem="pharmacies">
      <Box sx={{ px: { xs: 2, md: 4, xl: 5 }, py: { xs: 3, md: 4 } }}>
        <Stack direction={{ xs: 'column', lg: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', lg: 'center' }} spacing={2} sx={{ mb: 3 }}>
          <Box>
            <Typography sx={{ fontSize: { xs: 36, md: 46 }, fontFamily: 'Georgia, serif', lineHeight: 1.05 }}>
              Pharmacies
            </Typography>
            <Typography sx={{ mt: 1, color: colors.muted, fontSize: 18, maxWidth: 430, lineHeight: 1.2 }}>
              Find nearby pharmacies, check stock and send prescriptions
            </Typography>
          </Box>

          <Stack direction="row" spacing={1.5} alignItems="center" useFlexGap flexWrap="wrap">
            <Box sx={{ px: 2.5, py: 1.25, borderRadius: 4, border: `1px solid ${colors.line}`, bgcolor: '#f7f3ea', fontSize: 17, lineHeight: 1.15 }}>
              {new Date().toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })}
            </Box>
            <Button sx={{ minWidth: 48, width: 48, height: 48, borderRadius: 3, border: `1px solid ${colors.line}`, bgcolor: '#fff', color: colors.text, position: 'relative' }}>
              <NotificationIcon />
              <Box sx={{ position: 'absolute', top: 12, right: 12, width: 8, height: 8, borderRadius: '50%', bgcolor: colors.red }} />
            </Button>
            <Button startIcon={<SendIcon />} sx={{ px: 3, py: 1.25, borderRadius: 3, border: `1px solid ${colors.line}`, bgcolor: '#fff', color: colors.text, textTransform: 'none', fontSize: 16 }}>
              Send Prescription
            </Button>
          </Stack>
        </Stack>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', xl: 'repeat(4, 1fr)' }, gap: 2, mb: 3 }}>
          {[
            ['Nearby Pharmacies', '6', 'Within 5 km radius', '3 open now', colors.green],
            ['Active Prescriptions', '2', 'Awaiting fulfilment', '1 ready for pickup', colors.blue],
            ['Medicines Available', '4/5', 'From your prescription', 'At Arora Medical', colors.lime],
            ['Pickup Pending', '1', 'Amoxicillin ready', 'Since yesterday', colors.amber]
          ].map(([title, value, subtitle, helper, dot]) => (
            <Box key={title} sx={{ minHeight: 170, p: 2.5, borderRadius: 3.5, border: `1px solid ${colors.line}`, bgcolor: colors.paper }}>
              <Stack direction="row" spacing={0.8} alignItems="center">
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: dot }} />
                <Typography sx={{ fontSize: 16, color: colors.muted }}>{title}</Typography>
              </Stack>
              <Typography sx={{ mt: 1.2, fontSize: 30, lineHeight: 1 }}>{value}</Typography>
              <Typography sx={{ mt: 1, color: '#a29b92', fontSize: 15, lineHeight: 1.15 }}>{subtitle}</Typography>
              <Typography sx={{ mt: 1, color: dot, fontSize: 15, lineHeight: 1.15 }}>{helper}</Typography>
            </Box>
          ))}
        </Box>

        <Stack direction={{ xs: 'column', xl: 'row' }} spacing={3} alignItems="flex-start">
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack direction="row" spacing={1.25} useFlexGap flexWrap="wrap" sx={{ mb: 1.8 }}>
              {[
                ['all', 'All'],
                ['open', 'Open Now'],
                ['meds', 'Has My Medicines'],
                ['jan', 'Jan Aushadhi'],
                ['24h', '24-Hour']
              ].map(([value, label]) => (
                <Button
                  key={value}
                  onClick={() => setFilter(value)}
                  sx={{
                    px: 2.4,
                    py: 0.95,
                    borderRadius: 999,
                    border: `1px solid ${filter === value ? colors.green : colors.line}`,
                    bgcolor: filter === value ? colors.green : '#fff',
                    color: filter === value ? '#fff' : '#67625b',
                    textTransform: 'none',
                    fontSize: 15
                  }}
                >
                  {label}
                </Button>
              ))}
            </Stack>

            <TextField
              fullWidth
              placeholder="Search pharmacy or medicine"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              sx={{ mb: 1.8, '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: '#fff' } }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: colors.muted }} />
                  </InputAdornment>
                )
              }}
            />

            <TextField
              select
              fullWidth
              value={sort}
              onChange={(event) => setSort(event.target.value)}
              sx={{ mb: 2.5, '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: '#fff' } }}
            >
              <MenuItem value="nearest">Sort: Nearest first</MenuItem>
              <MenuItem value="open">Sort: Open now</MenuItem>
              <MenuItem value="stock">Sort: Best stock match</MenuItem>
            </TextField>

            <Box sx={{ p: 2.4, borderRadius: 3.5, border: `1px solid ${colors.line}`, bgcolor: colors.paper, mb: 3 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.8 }}>
                <Typography sx={{ fontSize: 18 }}>Pharmacies near you</Typography>
                <Button sx={{ color: colors.green, textTransform: 'none', fontSize: 15.5 }}>Open in Maps -&gt;</Button>
              </Stack>
              <Box sx={{ height: 220, borderRadius: 3, bgcolor: '#dff1ec', border: '1px solid #a7ded0', position: 'relative', overflow: 'hidden' }}>
                <Box sx={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(38,163,124,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(38,163,124,0.08) 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
                <Box sx={{ position: 'absolute', left: '28%', top: '30%', px: 1.1, py: 0.3, borderRadius: 1.3, bgcolor: colors.green, color: '#fff', fontSize: 12.5 }}>Arora • 0.8km</Box>
                <Box sx={{ position: 'absolute', left: '60%', top: '20%', px: 1.1, py: 0.3, borderRadius: 1.3, bgcolor: '#b26d09', color: '#fff', fontSize: 12.5 }}>Singh • 1.4km</Box>
                <Box sx={{ position: 'absolute', left: '34%', bottom: '18%', px: 1.1, py: 0.3, borderRadius: 1.3, bgcolor: '#8a8a8a', color: '#fff', fontSize: 12.5 }}>City Med • 3.2km</Box>
                <Box sx={{ position: 'absolute', right: '6%', bottom: '28%', px: 1.1, py: 0.3, borderRadius: 1.3, bgcolor: colors.green, color: '#fff', fontSize: 12.5 }}>Jan Aushadhi • 2.1km</Box>
                <Box sx={{ position: 'absolute', left: '48%', top: '46%', width: 18, height: 18, borderRadius: '50%', bgcolor: '#fff', border: '3px solid #3b89db', boxShadow: '0 0 0 10px rgba(59,137,219,0.16)' }} />
                <Box sx={{ position: 'absolute', left: '31%', top: '31%', width: 12, height: 12, borderRadius: '50%', bgcolor: colors.green, border: '2px solid #fff' }} />
                <Box sx={{ position: 'absolute', left: '62%', top: '22%', width: 12, height: 12, borderRadius: '50%', bgcolor: colors.amber, border: '2px solid #fff' }} />
                <Box sx={{ position: 'absolute', left: '41%', bottom: '25%', width: 12, height: 12, borderRadius: '50%', bgcolor: colors.gray, border: '2px solid #fff' }} />
                <Box sx={{ position: 'absolute', right: '10%', bottom: '34%', width: 12, height: 12, borderRadius: '50%', bgcolor: colors.green, border: '2px solid #fff' }} />
              </Box>
            </Box>

            <Typography sx={{ color: '#b1aaa1', fontSize: 15, letterSpacing: 1.1, mb: 1.5 }}>OPEN NOW</Typography>
            <Stack spacing={1.7} sx={{ mb: 3 }}>
              {pharmacyCards.open.map((item) => <PharmacyCard key={item.id} item={item} />)}
            </Stack>

            <Typography sx={{ color: '#b1aaa1', fontSize: 15, letterSpacing: 1.1, mb: 1.5 }}>PARTIAL STOCK / CLOSED</Typography>
            <Stack spacing={1.7}>
              {pharmacyCards.partial.map((item) => <PharmacyCard key={item.id} item={item} />)}
            </Stack>
          </Box>

          <Stack spacing={3} sx={{ width: { xs: '100%', xl: 320 }, flexShrink: 0 }}>
            <Box sx={{ p: 2.3, borderRadius: 3.5, border: `1px solid ${colors.green}`, bgcolor: '#e5f8f0' }}>
              <Stack direction="row" spacing={1.2} alignItems="flex-start">
                <Box sx={{ width: 34, height: 34, borderRadius: 2, bgcolor: '#b8ecd9', display: 'grid', placeItems: 'center', color: colors.green }}>
                  <PrescriptionIcon />
                </Box>
                <Box>
                  <Typography sx={{ fontSize: 17 }}>Active prescription</Typography>
                  <Typography sx={{ mt: 0.2, color: '#2d7d66', fontSize: 14.5 }}>Dr. Priya Sharma</Typography>
                </Box>
              </Stack>
              <Stack spacing={0.8} sx={{ mt: 1.6 }}>
                {activePrescription.map((item) => (
                  <Typography key={item} sx={{ color: '#246a58', fontSize: 15 }}>• {item}</Typography>
                ))}
              </Stack>
              <Button sx={{ mt: 1.8, width: '100%', py: 1, borderRadius: 2.5, border: `1px solid ${colors.line}`, bgcolor: '#fff', color: colors.text, textTransform: 'none', fontSize: 15.5 }}>
                Send to pharmacy
              </Button>
            </Box>

            <Box sx={{ p: 2.3, borderRadius: 3.5, border: `1px solid ${colors.line}`, bgcolor: colors.paper }}>
              <Typography sx={{ fontSize: 18, mb: 1.5 }}>Prescription status</Typography>
              <Box sx={{ p: 1.8, borderRadius: 2.5, border: `1px solid ${colors.soft}`, bgcolor: '#fff' }}>
                <Typography sx={{ fontSize: 16 }}>Arora Medical Store</Typography>
                <Stack spacing={0.8} sx={{ mt: 1.3 }}>
                  {['Paracetamol 500mg', 'Amoxicillin 250mg', 'ORS Sachets', 'Vitamin C 500mg'].map((item) => (
                    <Typography key={item} sx={{ color: '#555049', fontSize: 14.8 }}>{item}</Typography>
                  ))}
                </Stack>
                <Typography sx={{ mt: 1.4, color: colors.muted, fontSize: 14 }}>Sent 18 Mar · Ready to process</Typography>
              </Box>
            </Box>

            <Box sx={{ p: 2.3, borderRadius: 3.5, border: `1px solid ${colors.line}`, bgcolor: colors.paper }}>
              <Typography sx={{ fontSize: 18, mb: 1.5 }}>Check medicine availability</Typography>
              <TextField
                placeholder="Paracetamol"
                sx={{ mb: 1.5, '& .MuiOutlinedInput-root': { borderRadius: 2.5, bgcolor: '#fff' } }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: colors.muted }} />
                    </InputAdornment>
                  )
                }}
              />
              <Stack spacing={1.2}>
                {nearbyList.map(([name, distance, status]) => (
                  <Box key={name} sx={{ p: 1.4, borderRadius: 2.2, border: `1px solid ${colors.soft}`, bgcolor: '#fff' }}>
                    <Typography sx={{ fontSize: 15.5 }}>{name}</Typography>
                    <Typography sx={{ mt: 0.35, color: colors.muted, fontSize: 14 }}>{distance} · {status}</Typography>
                  </Box>
                ))}
              </Stack>
            </Box>

            <Box sx={{ p: 2.3, borderRadius: 3.5, border: `1px solid ${colors.line}`, bgcolor: colors.paper }}>
              <Typography sx={{ fontSize: 18, mb: 1.5 }}>Helpful tips</Typography>
              <Stack spacing={1.3}>
                {helpfulTips.map(([text, dot]) => (
                  <Stack key={text} direction="row" spacing={1.1} sx={{ pt: 0.4, borderTop: `1px solid ${colors.soft}`, '&:first-of-type': { pt: 0, borderTop: 'none' } }}>
                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: dot, mt: 0.8, flexShrink: 0 }} />
                    <Typography sx={{ color: '#514c46', fontSize: 14.8, lineHeight: 1.6 }}>{text}</Typography>
                  </Stack>
                ))}
              </Stack>
            </Box>
          </Stack>
        </Stack>
      </Box>
    </PatientShell>
  );
}
