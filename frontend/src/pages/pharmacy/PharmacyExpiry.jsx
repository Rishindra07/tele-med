import React, { useState } from 'react';
import {
  Box, Typography, Stack, Button, IconButton, Badge, Divider,
  TextField, MenuItem, Select, FormControl, InputAdornment, Avatar,
  Switch, Slider
} from '@mui/material';
import {
  NotificationsNoneRounded as BellIcon,
  SearchRounded as SearchIcon,
  WarningRounded as WarningIcon,
  ScheduleRounded as ClockIcon,
  ErrorOutlineRounded as ErrorIcon,
} from '@mui/icons-material';
import PharmacyLayout from '../../components/PharmacyLayout';

const colors = {
  paper: '#ffffff',
  bg: '#f9f9f9',
  line: '#ebe9e0',
  soft: '#f5f1e8',
  text: '#252525',
  muted: '#6f6a62',
  green: '#26a37c',
  greenSoft: '#dff3eb',
  amber: '#d18a1f',
  amberSoft: '#fbefdc',
  red: '#d9635b',
  redSoft: '#fdeaea',
  blue: '#4a90e2',
  blueSoft: '#e7f0fe',
  graySoft: '#f1eee7'
};

const STATS = [
  { title: 'Expiring < 7\ndays', value: '1', sub: 'Cough syrup\nbatch B221', color: colors.red },
  { title: 'Expiring < 30\ndays', value: '3', sub: 'Action needed\nsoon', color: colors.amber },
  { title: 'Expiring < 90\ndays', value: '7', sub: 'Monitor\nclosely', color: colors.blue },
  { title: 'Est. loss at\nrisk', value: '₹3,840', sub: 'If no action\ntaken', color: colors.red }
];

const FILTERS = [
  { label: 'All', count: 11, active: true },
  { label: 'Critical' },
  { label: 'Warning' },
  { label: 'Watch' },
  { label: 'Returned' },
  { label: 'Disposed' }
];

const EXPIRY_LIST = [
  {
    name: 'Cough Syrup 100ml — Batch B221',
    details: 'Expires 2 Apr 2026 • 10 days remaining • 12 bottles • Supplier: Medico Pharma',
    tags: [
      { label: 'Critical — 10 days', color: colors.red, bg: colors.redSoft },
      { label: 'Est. loss ₹1,440', color: colors.red, bg: colors.redSoft },
      { label: 'Return eligible', color: colors.blue, bg: colors.blueSoft }
    ],
    buttons: ['Initiate return', 'Mark dispose', 'View stock'],
    borderColor: colors.red,
    icon: <ErrorIcon sx={{ color: colors.red }} />
  },
  {
    name: 'Amoxicillin 250mg — Batch B2024-088',
    details: 'Expires 15 Apr 2026 • 23 days remaining • 14 strips • Supplier: Apollo Wholesale',
    tags: [
      { label: 'Critical — 23 days', color: colors.red, bg: colors.redSoft },
      { label: 'Low stock too', color: colors.amber, bg: colors.amberSoft },
      { label: 'Est. loss ₹448', color: colors.red, bg: colors.redSoft }
    ],
    buttons: ['Initiate return', 'Mark dispose', 'View stock'],
    borderColor: colors.red,
    icon: <ErrorIcon sx={{ color: colors.redSoft, bgcolor: colors.redSoft, opacity: 0.5 }} />
  },
  {
    name: 'Vitamin C 500mg — Batch B2025-031',
    details: 'Expires 31 May 2026 • 69 days remaining • 200 strips • Supplier: Jan Aushadhi Depot',
    tags: [
      { label: 'Warning — 69 days', color: colors.amber, bg: colors.amberSoft },
      { label: 'High demand item', color: colors.green, bg: colors.greenSoft },
      { label: 'Est. loss ₹600', color: colors.amber, bg: colors.amberSoft }
    ],
    buttons: ['Push sales', 'Mark dispose', 'View stock'],
    borderColor: colors.amber,
    icon: <WarningIcon sx={{ color: colors.amber }} />
  },
  {
    name: 'ORS Sachets 21g — Batch B2025-044',
    details: 'Expires 30 Jun 2026 • 99 days remaining • 8 packs • Supplier: Jan Aushadhi Depot',
    tags: [
      { label: 'Warning — 99 days', color: colors.amber, bg: colors.amberSoft },
      { label: 'Out of stock risk', color: colors.red, bg: colors.redSoft }
    ],
    buttons: ['Reorder stock', 'View stock'],
    borderColor: colors.amber,
    icon: <WarningIcon sx={{ color: colors.amberSoft, opacity: 0.5 }} />
  },
  {
    name: 'Paracetamol 500mg — Batch B2024-112',
    details: 'Expires Dec 2026 • 9 months remaining • 38 strips • Supplier: Medico Pharma',
    tags: [
      { label: 'Watch — 9 months', color: colors.blue, bg: colors.blueSoft },
      { label: 'Low stock alert', color: colors.amber, bg: colors.amberSoft }
    ],
    buttons: ['View stock', 'Reorder'],
    borderColor: colors.blue,
    icon: <ClockIcon sx={{ color: colors.blue }} />
  }
];

const LOSSES = [
  { name: 'Cough Syrup (12 bottles)', val: '₹1,440' },
  { name: 'Amoxicillin 250mg (14 strips)', val: '₹448' },
  { name: 'Vitamin C 500mg (200 strips)', val: '₹600' },
  { name: 'Other items (4 SKUs)', val: '₹1,352' }
];

const StatCard = ({ title, value, sub, color }) => (
  <Box sx={{ p: 2.5, borderRadius: 3, border: `1px solid ${colors.line}`, bgcolor: colors.paper, flex: '1 1 0' }}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
      <Box sx={{ width: 8, height: 8, borderRadius: 4, bgcolor: color }} />
      <Typography sx={{ fontSize: 13, color: colors.text, whiteSpace: 'pre-line', lineHeight: 1.3 }}>{title}</Typography>
    </Box>
    <Typography sx={{ fontSize: 32, fontFamily: 'Georgia, serif' }}>{value}</Typography>
    <Typography sx={{ mt: 0.5, fontSize: 12.5, color: colors.muted, whiteSpace: 'pre-line', lineHeight: 1.3 }}>{sub}</Typography>
  </Box>
);

const PillFilter = ({ label, count, active }) => (
  <Button sx={{ 
    textTransform: 'none', borderRadius: 99, px: 2, py: 0.6, fontSize: 13,
    bgcolor: active ? colors.red : 'transparent',
    color: active ? '#fff' : colors.text,
    border: `1px solid ${active ? colors.red : colors.line}`,
    minWidth: 0,
    '&:hover': { bgcolor: active ? colors.red : colors.graySoft }
  }}>
    {label}{count !== undefined && <Typography component="span" sx={{ ml: 1, px: 0.8, py: 0.2, borderRadius: 99, fontSize: 11, bgcolor: active ? 'rgba(255,255,255,0.2)' : colors.graySoft }}>{count}</Typography>}
  </Button>
);

export default function PharmacyExpiry() {
  const [threshold, setThreshold] = useState(30);

  return (
    <PharmacyLayout>
      <Box sx={{ p: { xs: 2.5, md: 4, xl: 5 }, maxWidth: 1400, mx: 'auto' }}>
        
        {/* Header */}
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems="flex-start" spacing={2} sx={{ mb: 4 }}>
          <Box>
            <Typography sx={{ fontSize: { xs: 32, md: 36 }, fontFamily: 'Georgia, serif', lineHeight: 1.1 }}>
              Expiry Alerts
            </Typography>
            <Typography sx={{ mt: 1, color: colors.muted, fontSize: 14.5 }}>
              Track medicines nearing expiry — act before<br/>they become losses
            </Typography>
          </Box>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box sx={{ bgcolor: colors.soft, color: '#5f5a52', borderRadius: 2.5, px: 2, py: 1, fontSize: 13, lineHeight: 1.25, textAlign: 'center' }}>
              Mon, 23<br />March<br />2026
            </Box>
            <IconButton sx={{ border: `1px solid ${colors.line}`, bgcolor: '#fff', width: 42, height: 42 }}>
              <Badge color="error" variant="dot">
                <BellIcon sx={{ color: '#5f5a52' }} />
              </Badge>
            </IconButton>
            <Button sx={{ border: `1px solid ${colors.line}`, bgcolor: '#fff', color: colors.text, borderRadius: 2.5, px: 2, py: 1, textTransform: 'none', fontSize: 14.5, height: 42 }}>
              Create<br/>return list
            </Button>
          </Stack>
        </Stack>

        {/* Stats Row */}
        <Stack direction="row" spacing={2} sx={{ mb: 4, overflowX: 'auto', pb: 1 }}>
          {STATS.map(s => <StatCard key={s.title} {...s} />)}
        </Stack>

        {/* Search & Filter Card */}
        <Box sx={{ p: 4, borderRadius: 4, border: `1px solid ${colors.line}`, bgcolor: colors.paper, mb: 4 }}>
          <TextField
            fullWidth
            placeholder="Search medicine name or batch number..."
            sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: colors.paper } }}
          />
          <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
            <FormControl fullWidth size="small">
              <Select value="all" sx={{ borderRadius: 2, bgcolor: colors.paper }}>
                <MenuItem value="all">All categories</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth size="small">
              <Select value="all" sx={{ borderRadius: 2, bgcolor: colors.paper }}>
                <MenuItem value="all">All windows</MenuItem>
              </Select>
            </FormControl>
          </Stack>
          <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
            {FILTERS.map(f => <PillFilter key={f.label} {...f} />)}
          </Stack>
        </Box>

        {/* Main Grid */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 300px' }, gap: 3 }}>
          
          {/* Left Column: Expiry List */}
          <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
              <Typography sx={{ fontSize: 16 }}>Expiry list</Typography>
              <Typography sx={{ color: colors.green, fontSize: 13.5, cursor: 'pointer' }}>Export list →</Typography>
            </Stack>
            
            <Stack spacing={2.5}>
              {EXPIRY_LIST.map((item, idx) => (
                <Box key={idx} sx={{ 
                  display: 'grid', gridTemplateColumns: idx < 4 ? '70px 1fr 160px' : '70px 1fr 160px', 
                  bgcolor: colors.paper, borderRadius: 4, border: `1px solid ${colors.line}`, 
                  borderLeft: `3px solid ${item.borderColor}`, overflow: 'hidden'
                }}>
                  <Box sx={{ display: 'grid', placeItems: 'center', bgcolor: item.borderColor === colors.red ? colors.redSoft : item.borderColor === colors.amber ? colors.amberSoft : colors.blueSoft, opacity: 0.8 }}>
                    {item.icon}
                  </Box>
                  <Box sx={{ p: 3 }}>
                    <Typography sx={{ fontSize: 16, fontWeight: 500, mb: 1 }}>{item.name}</Typography>
                    <Typography sx={{ fontSize: 13, color: colors.muted, lineHeight: 1.4, mb: 2 }}>{item.details}</Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      {item.tags.map(t => (
                        <Box key={t.label} sx={{ px: 1.2, py: 0.4, borderRadius: 1.5, bgcolor: t.bg, color: t.color, fontSize: 11, fontWeight: 500 }}>
                          {t.label}
                        </Box>
                      ))}
                    </Stack>
                  </Box>
                  <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 1, justifyContent: 'center', borderLeft: `1px solid ${colors.line}` }}>
                    {item.buttons.map(btn => (
                      <Button key={btn} fullWidth sx={{ border: `1px solid ${colors.line}`, color: colors.text, borderRadius: 2, fontSize: 12.5, textTransform: 'none', py: 0.6 }}>
                        {btn}
                      </Button>
                    ))}
                  </Box>
                </Box>
              ))}
            </Stack>
          </Box>

          {/* Right Column: Sidebar */}
          <Stack spacing={3}>
            
            {/* Calendar Placeholder */}
            <Box sx={{ p: 3, borderRadius: 4, border: `1px solid ${colors.line}`, bgcolor: colors.paper }}>
              <SectionTitle title="Expiry calendar — April 2026" />
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0.5, textAlign: 'center', mb: 2 }}>
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => <Typography key={d} sx={{ fontSize: 10, color: colors.muted }}>{d}</Typography>)}
                {[...Array(30)].map((_, i) => (
                  <Typography key={i} sx={{ 
                    fontSize: 12, py: 0.5, 
                    color: (i+1 === 2 || i+1 === 15) ? colors.red : (i+1 === 23) ? colors.amber : colors.text,
                    fontWeight: (i+1 === 2 || i+1 === 15 || i+1 === 23) ? 600 : 400
                  }}>
                    {i+1}
                  </Typography>
                ))}
              </Box>
              <Stack spacing={1}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Box sx={{ width: 8, height: 8, borderRadius: 4, bgcolor: colors.red }} />
                  <Typography sx={{ fontSize: 11, color: colors.muted }}>Critical expiry</Typography>
                </Stack>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Box sx={{ width: 8, height: 8, borderRadius: 4, bgcolor: colors.amber }} />
                  <Typography sx={{ fontSize: 11, color: colors.muted }}>Warning</Typography>
                </Stack>
              </Stack>
            </Box>

            {/* Estimated Loss */}
            <Box sx={{ p: 3, borderRadius: 4, border: `1px solid ${colors.line}`, bgcolor: colors.paper }}>
              <SectionTitle title="Estimated loss if no action" />
              <Stack spacing={2}>
                {LOSSES.map(l => (
                  <Stack key={l.name} direction="row" justifyContent="space-between">
                    <Typography sx={{ fontSize: 13, color: colors.text }}>{l.name}</Typography>
                    <Typography sx={{ fontSize: 13, color: colors.red }}>{l.val}</Typography>
                  </Stack>
                ))}
                <Divider />
                <Stack direction="row" justifyContent="space-between" sx={{ pt: 1 }}>
                  <Typography sx={{ fontSize: 13, fontWeight: 600 }}>Total at risk</Typography>
                  <Typography sx={{ fontSize: 15, fontWeight: 600, color: colors.red }}>₹3,840</Typography>
                </Stack>
              </Stack>
            </Box>

            {/* Alert Settings */}
            <Box sx={{ p: 3, borderRadius: 4, border: `1px solid ${colors.line}`, bgcolor: colors.paper }}>
              <SectionTitle title="Alert settings" />
              <Stack spacing={3}>
                <Box>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography sx={{ fontSize: 13 }}>Alert at 30 days</Typography>
                      <Typography sx={{ fontSize: 11, color: colors.muted }}>Default warning threshold</Typography>
                    </Box>
                    <Switch defaultChecked size="small" />
                  </Stack>
                </Box>
                <Box>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography sx={{ fontSize: 13 }}>SMS alert to owner</Typography>
                      <Typography sx={{ fontSize: 11, color: colors.muted }}>+91 98140 56872</Typography>
                    </Box>
                    <Switch defaultChecked size="small" />
                  </Stack>
                </Box>
                <Box>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography sx={{ fontSize: 13 }}>Auto-create return list</Typography>
                      <Typography sx={{ fontSize: 11, color: colors.muted }}>When expiry &lt; 7 days</Typography>
                    </Box>
                    <Switch size="small" />
                  </Stack>
                </Box>
                <Box>
                  <Typography sx={{ fontSize: 12, color: colors.muted, mb: 1 }}>Custom alert threshold (days)</Typography>
                  <Slider 
                    value={threshold} 
                    onChange={(_, v) => setThreshold(v)} 
                    max={90} min={7} 
                    sx={{ color: colors.blue }} 
                  />
                  <Stack direction="row" justifyContent="space-between">
                    <Typography sx={{ fontSize: 10, color: colors.muted }}>7 days</Typography>
                    <Typography sx={{ fontSize: 11, color: colors.blue, fontWeight: 600 }}>{threshold} days</Typography>
                    <Typography sx={{ fontSize: 10, color: colors.muted }}>90 days</Typography>
                  </Stack>
                </Box>
              </Stack>
            </Box>

          </Stack>
        </Box>
      </Box>
    </PharmacyLayout>
  );
}

function SectionTitle({ title }) {
  return (
    <Typography sx={{ fontSize: 16, mb: 2.5, lineHeight: 1.2 }}>{title}</Typography>
  );
}
