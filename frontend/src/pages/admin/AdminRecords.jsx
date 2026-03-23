import React from 'react';
import {
  Box, Typography, Stack, Button, IconButton, Badge, Divider,
  Grid, Paper, Avatar, LinearProgress, Chip,
} from '@mui/material';
import {
  NotificationsNoneRounded as BellIcon,
  CloudDoneRounded as CloudIcon,
  StorageRounded as StorageIcon,
  HistoryRounded as HistoryIcon,
  SyncRounded as SyncIcon,
  VerifiedUserRounded as SecureIcon,
} from '@mui/icons-material';
import AdminLayout from '../../components/AdminLayout';

const colors = {
  paper: '#ffffff',
  bg: '#f9f9f9',
  line: '#ebe9e0',
  soft: '#f5f1e8',
  text: '#252525',
  muted: '#6f6a62',
  blue: '#2563eb',
  blueSoft: '#eff6ff',
  green: '#16a34a',
  greenSoft: '#f0fdf4',
  red: '#dc2626',
  redSoft: '#fef2f2',
  orange: '#ea580c',
  orangeSoft: '#fff7ed',
  yellow: '#ca8a04',
};

const STATS = [
  { label: 'Total records', val: '84,210', change: '↑ 1,248 this week', color: colors.green },
  { label: 'Storage used', val: '4.8 TB', change: '24% of capacity', color: colors.blue },
  { label: 'Pending sync', val: '312', change: 'EHR re-indexing', color: colors.orange },
  { label: 'Last full sync', val: '3:00 AM', change: 'All nodes synced', color: colors.green }
];

const BREAKDOWN = [
  { name: 'Prescriptions', count: '32,482', perc: 40, color: colors.green },
  { name: 'Lab reports', count: '22,941', perc: 30, color: colors.blue },
  { name: 'Doctor notes', count: '18,812', perc: 25, color: '#6366f1' },
  { name: 'Imaging (X-ray, etc.)', count: '9,122', perc: 15, color: colors.orange },
  { name: 'Vaccination records', count: '3,803', perc: 5, color: colors.yellow }
];

const HEALTH = [
  { label: 'Unit capacity', val: '1.2 TB' },
  { label: 'Loss', val: '< 0.01235%' },
  { label: 'Auto-backup', val: 'Daily 3:00 AM' },
  { label: 'Pending sync issues', val: '312 offline' },
  { label: 'Retention policy', val: '7 years (NHM)' },
  { label: 'Encryption', val: 'AES-256 bit' },
  { label: 'ABHA (Health ID) linked', val: '64%' },
  { label: 'Offline cached records', val: '43,241' }
];

export default function AdminRecords() {
  return (
    <AdminLayout>
      <Box sx={{ p: { xs: 2.5, md: 4, xl: 5 }, maxWidth: 1600, mx: 'auto' }}>
        
        {/* Header */}
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 4 }}>
          <Box>
            <Typography sx={{ fontSize: 32, fontWeight: 700, fontFamily: 'Georgia, serif' }}>Health Records</Typography>
            <Typography sx={{ mt: 0.5, color: colors.muted, fontSize: 14.5 }}>Platform-wide record storage, sync status and data management</Typography>
          </Box>
          <Button startIcon={<SyncIcon />} variant="contained" sx={{ bgcolor: colors.text, color: '#fff', borderRadius: 2.5, px: 3, py: 1.2, textTransform: 'none', fontWeight: 600 }}>
            Sync now
          </Button>
        </Stack>

        {/* Metrics Bar */}
        <Grid container spacing={2.5} sx={{ mb: 5 }}>
          {STATS.map((stat, i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Paper sx={{ p: 2.5, borderRadius: 4, border: `1px solid ${colors.line}`, boxShadow: 'none' }}>
                <Typography sx={{ fontSize: 13, color: colors.muted, fontWeight: 600, mb: 1.5 }}>
                   <Box component="span" sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: stat.color, display: 'inline-block', mr: 1 }} />
                   {stat.label}
                </Typography>
                <Typography sx={{ fontSize: 28, fontWeight: 700, mb: 0.5 }}>{stat.val}</Typography>
                <Typography sx={{ fontSize: 12, color: colors.muted, fontWeight: 600 }}>{stat.change}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={4}>
          <Grid item xs={12} lg={7}>
            <Paper sx={{ p: 4, borderRadius: 5, border: `1px solid ${colors.line}`, boxShadow: 'none' }}>
               <Typography sx={{ fontSize: 18, fontWeight: 700, mb: 4 }}>Record type breakdown</Typography>
               <Stack spacing={4}>
                  {BREAKDOWN.map((b, i) => (
                    <Stack key={i} spacing={1.5}>
                       <Stack direction="row" justifyContent="space-between">
                          <Typography sx={{ fontSize: 14, fontWeight: 600 }}>{b.name}</Typography>
                          <Typography sx={{ fontSize: 14, fontWeight: 700 }}>{b.count}</Typography>
                       </Stack>
                       <Box sx={{ height: 8, bgcolor: colors.soft, borderRadius: 4, overflow: 'hidden' }}>
                          <Box sx={{ width: `${b.perc}%`, height: '100%', bgcolor: b.color }} />
                       </Box>
                    </Stack>
                  ))}
               </Stack>
               <Divider sx={{ my: 4 }} />
               <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                     <Typography sx={{ fontSize: 14, fontWeight: 700 }}>ABHA (Health ID) Linked</Typography>
                     <Typography sx={{ fontSize: 12, color: colors.muted }}>Across total verified patient population</Typography>
                  </Box>
                  <Typography sx={{ fontSize: 24, fontWeight: 800 }}>64%</Typography>
               </Stack>
               <Divider sx={{ my: 4 }} />
               <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                     <Typography sx={{ fontSize: 14, fontWeight: 700 }}>Offline cached records</Typography>
                     <Typography sx={{ fontSize: 12, color: colors.muted }}>Stored on low-bandwidth edge nodes</Typography>
                  </Box>
                  <Typography sx={{ fontSize: 24, fontWeight: 800 }}>43,241</Typography>
               </Stack>
            </Paper>
          </Grid>

          <Grid item xs={12} lg={5}>
            <Paper sx={{ p: 4, borderRadius: 5, border: `1px solid ${colors.line}`, boxShadow: 'none' }}>
               <Typography sx={{ fontSize: 16, fontWeight: 700, mb: 3 }}>Storage & sync health</Typography>
               <Stack spacing={2.5}>
                  {HEALTH.map((h, i) => (
                    <Stack key={i} direction="row" justifyContent="space-between">
                       <Typography sx={{ fontSize: 13.5, color: colors.muted, fontWeight: 500 }}>{h.label}</Typography>
                       <Typography sx={{ fontSize: 14, fontWeight: 700, textAlign: 'right', color: h.val.includes('offline') ? colors.red : colors.text }}>{h.val}</Typography>
                    </Stack>
                  ))}
               </Stack>
               <Button fullWidth startIcon={<SecureIcon />} variant="outlined" sx={{ mt: 4, borderRadius: 2.5, textTransform: 'none', py: 1.2, fontWeight: 600 }}>
                  Manage encryption keys
               </Button>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </AdminLayout>
  );
}
