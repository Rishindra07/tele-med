import React from 'react';
import {
  Box, Typography, Stack, Button, IconButton, Badge, Divider,
  Grid, Paper, Avatar, Chip,
} from '@mui/material';
import {
  NotificationsNoneRounded as BellIcon,
  VideoCallRounded as VideoIcon,
  GraphicEqRounded as AudioIcon,
  VisibilityRounded as ViewIcon,
  AssessmentRounded as ReportsIcon,
  FileDownloadRounded as ExportIcon,
  TimelineRounded as TimelineIcon,
  WarningRounded as WarningIcon,
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
  { label: 'Live now', val: '148', change: 'Across 18 specializations', color: '#16a34a' },
  { label: 'Today so far', val: '1,840', change: '+12% vs yesterday', color: '#2563eb' },
  { label: 'Avg duration', val: '14.2m', change: 'Across India', color: '#ea580c' },
  { label: 'Complaints today', val: '3', change: 'Response time: <5m', color: '#dc2626' }
];

const LIVE_FEED = [
  { dr: 'Dr. Priya Sharma', pt: 'Ramesh Kumar', spec: 'General Physician', mode: 'Video', status: 'Live 4m', avatar: 'PS', modeIcon: <VideoIcon sx={{ fontSize: 16 }} />, action: 'Monitor' },
  { dr: 'Dr. Manish Rao', pt: 'Priya Devi', spec: 'Cardiologist', mode: 'Video', status: 'Live 12m', avatar: 'MR', modeIcon: <VideoIcon sx={{ fontSize: 16 }} />, action: 'Monitor' },
  { dr: 'Dr. Anita Verma', pt: 'Meera Kumari', spec: 'Gynecologist', mode: 'Audio', status: 'Live 8m', avatar: 'AV', modeIcon: <AudioIcon sx={{ fontSize: 16 }} />, action: 'Monitor' },
  { dr: 'Dr. Vikram Jha', pt: 'Ajay Kumar', spec: 'General Physician', mode: 'Video', status: 'FLAGGED', avatar: 'VJ', modeIcon: <VideoIcon sx={{ fontSize: 16 }} />, action: 'Intervene', color: colors.red },
  { dr: 'Dr. Ravi Kumar', pt: 'Suresh Singh', spec: 'Diabetologist', mode: 'Audio', status: '2m ago', avatar: 'RK', modeIcon: <AudioIcon sx={{ fontSize: 16 }} />, action: 'View' }
];

const TRENDS = [
  { h: '08H', v: 40 }, { h: '09H', v: 65 }, { h: '10H', v: 85 }, { h: '11H', v: 75 },
  { h: '12H', v: 95 }, { h: '13H', v: 110 }, { h: '14H', v: 148 }, { h: 'Peak', v: 130 }
];

const OUTCOMES = [
  { label: 'Prescription issued', val: '88%' },
  { label: 'Follow-up scheduled', val: '12%' },
  { label: 'Insurance authorized', val: '15%' },
  { label: 'Deep-ref (Consultant)', val: '5%' },
  { label: 'Avg doctor rating', val: '4.8 / 5' }
];

const COMPLAINTS = [
  { id: 'SVT-1284', reason: 'Patient reported unprofessional conduct', details: 'Dr. Vikram Jha • Video • Under review', color: colors.red },
  { id: 'Quality', reason: 'Restricted quality complaint', details: 'Dr. Anita Verma • 8 min ago', color: colors.orange },
  { id: 'No-show', reason: 'Patient did not show up for scheduled call', details: 'Dr. Ravi Kumar • 2:30 PM slot', color: colors.muted }
];

export default function AdminConsultations() {
  return (
    <AdminLayout>
      <Box sx={{ p: { xs: 2.5, md: 4, xl: 5 }, maxWidth: 1600, mx: 'auto' }}>
        
        {/* Header */}
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 4 }}>
          <Box>
            <Typography sx={{ fontSize: 32, fontWeight: 700, fontFamily: 'Georgia, serif' }}>Consultations</Typography>
            <Typography sx={{ mt: 0.5, color: colors.muted, fontSize: 14.5 }}>All platform consultations — Live feed monitoring</Typography>
          </Box>
          <Button startIcon={<ExportIcon />} variant="contained" sx={{ bgcolor: colors.text, color: '#fff', borderRadius: 2.5, px: 3, py: 1.2, textTransform: 'none', fontWeight: 600 }}>
            Export log
          </Button>
        </Stack>

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
          {/* Live Feed Column */}
          <Grid item xs={12} lg={7}>
            <Paper sx={{ p: 4, borderRadius: 5, border: `1px solid ${colors.line}`, boxShadow: 'none' }}>
               <Stack direction="row" justifyContent="space-between" mb={4}>
                  <Typography sx={{ fontSize: 18, fontWeight: 700 }}>Live consultation feed</Typography>
                  <Chip label="148 active" size="small" sx={{ bgcolor: colors.greenSoft, color: colors.green, fontWeight: 700 }} />
               </Stack>
               <Stack spacing={3}>
                  {LIVE_FEED.map((f, i) => (
                    <Box key={i}>
                       <Stack direction="row" spacing={2.5} alignItems="center">
                          <Avatar sx={{ width: 44, height: 44, bgcolor: colors.blueSoft, color: colors.blue, fontWeight: 700 }}>{f.avatar}</Avatar>
                          <Box sx={{ flex: 1 }}>
                             <Typography sx={{ fontSize: 15, fontWeight: 700 }}>{f.dr} ↔ {f.pt}</Typography>
                             <Typography sx={{ fontSize: 12, color: colors.muted }}>{f.spec} • {f.mode} call</Typography>
                          </Box>
                          <Stack direction="row" spacing={2} alignItems="center">
                             <Chip label={f.status} size="small" sx={{ height: 22, fontSize: 11, fontWeight: 700, bgcolor: f.color ? f.redSoft : colors.soft, color: f.color || colors.muted }} />
                             <Button variant={f.action === 'Intervene' ? 'contained' : 'outlined'} color={f.action === 'Intervene' ? 'error' : 'inherit'} size="small" sx={{ borderRadius: 1.5, textTransform: 'none', minWidth: 90 }}>
                                {f.action}
                             </Button>
                          </Stack>
                       </Stack>
                       {i < LIVE_FEED.length - 1 && <Divider sx={{ mt: 3 }} />}
                    </Box>
                  ))}
               </Stack>
            </Paper>
          </Grid>

          {/* Side Panels */}
          <Grid item xs={12} lg={5}>
             <Stack spacing={4}>
                {/* Trends */}
                <Paper sx={{ p: 4, borderRadius: 5, border: `1px solid ${colors.line}`, boxShadow: 'none' }}>
                   <Typography sx={{ fontSize: 16, fontWeight: 700, mb: 3 }}>Today's trend</Typography>
                   <Stack direction="row" spacing={1.5} alignItems="flex-end" sx={{ height: 100, mb: 2 }}>
                      {TRENDS.map((t, i) => (
                         <Box key={i} sx={{ flex: 1, textAlign: 'center' }}>
                            <Box sx={{ height: (t.v / 148) * 100, bgcolor: t.h === 'Peak' ? colors.green : colors.greenSoft, borderRadius: 1 }} />
                            <Typography sx={{ fontSize: 9, mt: 1, fontWeight: 700, color: colors.muted }}>{t.h}</Typography>
                         </Box>
                      ))}
                   </Stack>
                   <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
                      <Stack direction="row" spacing={1} alignItems="center">
                         <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: colors.green }} />
                         <Typography sx={{ fontSize: 11, fontWeight: 600 }}>Video (68%)</Typography>
                      </Stack>
                      <Stack direction="row" spacing={1} alignItems="center">
                         <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: colors.blue }} />
                         <Typography sx={{ fontSize: 11, fontWeight: 600 }}>Audio (24%)</Typography>
                      </Stack>
                      <Stack direction="row" spacing={1} alignItems="center">
                         <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: colors.soft }} />
                         <Typography sx={{ fontSize: 11, fontWeight: 600 }}>Chat (8%)</Typography>
                      </Stack>
                   </Stack>
                </Paper>

                {/* Outcomes */}
                <Paper sx={{ p: 4, borderRadius: 5, border: `1px solid ${colors.line}`, boxShadow: 'none' }}>
                   <Typography sx={{ fontSize: 16, fontWeight: 700, mb: 3 }}>Outcomes — today</Typography>
                   <Stack spacing={2}>
                      {OUTCOMES.map((o, i) => (
                        <Stack key={i} direction="row" justifyContent="space-between">
                           <Typography sx={{ fontSize: 13, color: colors.muted, fontWeight: 500 }}>{o.label}</Typography>
                           <Typography sx={{ fontSize: 14, fontWeight: 700 }}>{o.val}</Typography>
                        </Stack>
                      ))}
                   </Stack>
                </Paper>

                {/* Complaints */}
                <Paper sx={{ p: 4, borderRadius: 5, border: `1px solid ${colors.line}`, boxShadow: 'none' }}>
                   <Typography sx={{ fontSize: 16, fontWeight: 700, mb: 2.5 }}>Complaints — today</Typography>
                   <Stack spacing={2}>
                      {COMPLAINTS.map((c, i) => (
                        <Box key={i} sx={{ p: 1.5, borderRadius: 3, border: `1px solid ${colors.line}`, borderLeft: `4px solid ${c.color || colors.line}` }}>
                           <Typography sx={{ fontSize: 13, fontWeight: 700 }}>{c.id === 'Quality' || c.id === 'No-show' ? c.id : `Patient ${c.id}`} <WarningIcon sx={{ fontSize: 14, color: c.color, verticalAlign: 'middle', ml: 0.5 }} /></Typography>
                           <Typography sx={{ fontSize: 12, fontWeight: 600, color: c.color === colors.red ? colors.red : colors.text, mt: 0.5 }}>{c.reason}</Typography>
                           <Typography sx={{ fontSize: 11, color: colors.muted, mt: 0.2 }}>{c.details}</Typography>
                        </Box>
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
