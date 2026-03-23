import React from 'react';
import {
  Box, Typography, Stack, Button, IconButton, Badge, Divider,
  Grid, Paper, LinearProgress, Chip, Alert,
} from '@mui/material';
import {
  RefreshRounded as RefreshIcon,
  CheckCircleRounded as CheckIcon,
  ErrorRounded as ErrorIcon,
  WarningRounded as WarningIcon,
  TerminalRounded as LogIcon,
  DnsRounded as InfraIcon,
  StorageRounded as StorageIcon,
  CloudQueueRounded as CloudIcon,
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
  { label: 'Services up', val: '8/9', change: '1 degraded', color: colors.green },
  { label: 'API uptime', val: '99.8%', change: 'Last 30 days', color: colors.blue },
  { label: 'Avg API response', val: '142ms', change: 'P95 latency', color: '#6366f1' },
  { label: 'Error rate', val: '0.4%', change: 'Last 24 hours', color: colors.orange }
];

const SERVICES = [
  { name: 'API server (primary)', status: 'Operational', uptime: '99.9%', latency: '42ms' },
  { name: 'Video call service (WebRTC)', status: 'Operational', uptime: '99.7%', latency: '88ms' },
  { name: 'Notification delivery', status: 'Degraded', uptime: 'Rajasthan cluster', latency: '—', color: colors.orange },
  { name: 'Database cluster', status: 'Operational', uptime: '99.99%', latency: '12ms' },
  { name: 'Offline sync service', status: 'Operational', uptime: '99.8%', latency: '210ms' },
  { name: 'Payment gateway (Razorpay)', status: 'Operational', uptime: '99.9%', latency: '61ms' },
  { name: 'Storage (S3 equivalent)', status: 'Operational', uptime: '100%', latency: '24ms' },
  { name: 'Auth service', status: 'Operational', uptime: '99.9%', latency: '18ms' },
  { name: 'AI / symptom checker', status: 'Operational', uptime: '99.6%', latency: '310ms' }
];

const ERRORS = [
  { title: 'Notification push failed — Rajasthan', desc: 'FCM token invalid • 312 affected • 10:41 AM', color: colors.orange },
  { title: 'Slow video init — Bihar cluster', desc: 'Avg 8s connection • 2 complaints • 9:12 AM', color: colors.muted },
  { title: 'Payment timeout — 1 transaction', desc: 'SVT-07312 • Refund initiated • 8:44 AM', color: colors.muted }
];

const INFRA = [
  { label: 'App version (latest)', val: 'v3.4.1' },
  { label: 'Devices on latest', val: '78%' },
  { label: 'Active user sessions', val: '8,240' },
  { label: 'Offline devices', val: '312' },
  { label: 'CDN cache hit rate', val: '94%' }
];

export default function AdminSystemHealth() {
  return (
    <AdminLayout>
      <Box sx={{ p: { xs: 2.5, md: 4, xl: 5 }, maxWidth: 1600, mx: 'auto' }}>
        
        {/* Header */}
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 4 }}>
          <Box>
            <Typography sx={{ fontSize: 32, fontWeight: 700, fontFamily: 'Georgia, serif' }}>System health</Typography>
            <Typography sx={{ mt: 0.5, color: colors.muted, fontSize: 14.5 }}>Real-time status of all platform services and infrastructure</Typography>
          </Box>
          <Button startIcon={<RefreshIcon />} variant="contained" sx={{ bgcolor: colors.text, color: '#fff', borderRadius: 2.5, px: 3, py: 1.2, textTransform: 'none', fontWeight: 600 }}>
            Refresh status
          </Button>
        </Stack>

        <Alert icon={<WarningIcon sx={{ color: colors.orange }} />} sx={{ mb: 4, borderRadius: 3, bgcolor: colors.orangeSoft, border: `1px solid ${colors.orange}20`, color: colors.orange, fontWeight: 600 }}>
          1 degraded service — Notification delivery failure in Rajasthan cluster · Started 10:41 AM · Engineering notified
        </Alert>

        {/* Metrics Grid */}
        <Grid container spacing={2.5} sx={{ mb: 5 }}>
          {STATS.map((stat, i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Paper sx={{ p: 2.5, borderRadius: 4, border: `1px solid ${colors.line}`, boxShadow: 'none' }}>
                <Typography sx={{ fontSize: 13, color: colors.muted, fontWeight: 600, mb: 1.5 }}>
                   <Box component="span" sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: stat.color, display: 'inline-block', mr: 1 }} />
                   {stat.label}
                </Typography>
                <Typography sx={{ fontSize: 28, fontWeight: 700, mb: 0.5 }}>{stat.val}</Typography>
                <Typography sx={{ fontSize: 12, color: colors.muted }}>{stat.change}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={4}>
          {/* Service Status List */}
          <Grid item xs={12} lg={7}>
            <Paper sx={{ p: 0, borderRadius: 5, border: `1px solid ${colors.line}`, boxShadow: 'none', overflow: 'hidden' }}>
              <Box sx={{ p: 4, borderBottom: `1px solid ${colors.line}`, display: 'flex', justifyContent: 'space-between' }}>
                 <Typography sx={{ fontSize: 18, fontWeight: 700 }}>Service status</Typography>
                 <Chip label="1 degraded" size="small" sx={{ bgcolor: colors.orangeSoft, color: colors.orange, fontWeight: 700 }} />
              </Box>
              <Box sx={{ p: 3 }}>
                 <Stack spacing={2.5}>
                    {SERVICES.map((s, i) => (
                      <Stack key={i} direction="row" justifyContent="space-between" alignItems="center">
                         <Stack direction="row" spacing={1.5} alignItems="center" sx={{ width: '40%' }}>
                            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: s.color || colors.green }} />
                            <Typography sx={{ fontSize: 14, fontWeight: 600, color: colors.text }}>{s.name}</Typography>
                         </Stack>
                         <Typography sx={{ fontSize: 13, fontWeight: 700, color: s.color || colors.green, width: '20%' }}>{s.status}</Typography>
                         <Typography sx={{ fontSize: 13, color: colors.muted, width: '25%', textAlign: 'right' }}>{s.uptime} uptime</Typography>
                         <Typography sx={{ fontSize: 13, color: colors.muted, width: '15%', textAlign: 'right' }}>{s.latency}</Typography>
                      </Stack>
                    ))}
                 </Stack>
              </Box>
            </Paper>
          </Grid>

          {/* Logs and Infra */}
          <Grid item xs={12} lg={5}>
             <Stack spacing={4}>
                <Paper sx={{ p: 4, borderRadius: 5, border: `1px solid ${colors.line}`, boxShadow: 'none' }}>
                   <Typography sx={{ fontSize: 16, fontWeight: 700, mb: 3 }}>Error log — last 24h</Typography>
                   <Stack spacing={2.5}>
                      {ERRORS.map((e, i) => (
                        <Box key={i} sx={{ position: 'relative', pl: 3 }}>
                           <Box sx={{ position: 'absolute', left: 0, top: 6, width: 10, height: 10, borderRadius: '50%', bgcolor: e.color || colors.soft }} />
                           <Typography sx={{ fontSize: 14, fontWeight: 700 }}>{e.title}</Typography>
                           <Typography sx={{ fontSize: 12, color: colors.muted, mt: 0.5 }}>{e.desc}</Typography>
                        </Box>
                      ))}
                   </Stack>
                </Paper>

                <Paper sx={{ p: 4, borderRadius: 5, border: `1px solid ${colors.line}`, boxShadow: 'none' }}>
                   <Typography sx={{ fontSize: 16, fontWeight: 700, mb: 3 }}>Infrastructure</Typography>
                   <Stack spacing={2.5}>
                      {INFRA.map((f, i) => (
                        <Stack key={i} direction="row" justifyContent="space-between">
                           <Typography sx={{ fontSize: 13.5, color: colors.muted, fontWeight: 500 }}>{f.label}</Typography>
                           <Typography sx={{ fontSize: 14, fontWeight: 700 }}>{f.val}</Typography>
                        </Stack>
                      ))}
                   </Stack>
                </Paper>
             </Stack>
          </Grid>
        </Grid>
      </Box>
    </AdminLayout>
  );
}
