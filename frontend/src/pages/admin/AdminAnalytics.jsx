import React, { useState } from 'react';
import {
  Box, Typography, Stack, Button, IconButton, Badge, Divider,
  Grid, Paper, Avatar, LinearProgress, Chip,
} from '@mui/material';
import {
  NotificationsNoneRounded as BellIcon,
  FileDownloadRounded as ExportIcon,
  TrendingUpRounded as GrowthIcon,
  TrendingDownRounded as LossIcon,
  PeopleAltRounded as PeopleIcon,
  VideoChatRounded as VideoIcon,
  GraphicEqRounded as AudioIcon,
  ChatBubbleRounded as ChatIcon,
  MapRounded as MapIcon,
  ScheduleRounded as TimeIcon,
  KeyboardArrowRightRounded as ArrowIcon,
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

const GROWTH_STATS = [
  { label: 'Total patients', val: '12,482', change: '18.4%', up: true, sub: 'vs last month', color: colors.green },
  { label: 'Consultations / day', val: '1,840', change: '9.2%', up: true, sub: 'this week', color: colors.blue },
  { label: 'Rx fulfilment rate', val: '87%', change: '3%', up: true, sub: 'from last month', color: colors.blue },
  { label: 'Avg patient retention', val: '72%', change: 'Return within', sub: '30 days', color: colors.orange }
];

const ACQUISITION = [
  { label: 'App installs', val: '3,840', perc: '100%', icon: <PeopleIcon sx={{ fontSize: 18 }} /> },
  { label: 'Registrations', val: '2,910', perc: '75.8%', icon: <GrowthIcon sx={{ fontSize: 18 }} /> },
  { label: 'First consultation', val: '2,140', perc: '73.5%', icon: <TimeIcon sx={{ fontSize: 18 }} /> },
  { label: 'Retained (30d)', val: '1,541', perc: '72%', icon: <GrowthIcon sx={{ fontSize: 18 }} /> }
];

const TOP_STATES = [
  { name: 'Punjab', val: '3,496', perc: 85 },
  { name: 'Uttar Pradesh', val: '2,247', perc: 70 },
  { name: 'Maharashtra', val: '1,872', perc: 45 },
  { name: 'Rajasthan', val: '1,498', perc: 38 },
  { name: 'Bihar', val: '1,241', perc: 32 },
  { name: 'Madhya Pradesh', val: '1,088', perc: 28 },
  { name: 'Haryana', val: '841', perc: 22 },
  { name: 'Others', val: '199', perc: 10 }
];

const HEATMAP_HOURS = ['12 AM', '6 AM', '12 PM', '6 PM', '11 PM'];

export default function AdminAnalytics() {
  const [window, setWindow] = useState('Monthly');

  return (
    <AdminLayout>
      <Box sx={{ p: { xs: 2.5, md: 4, xl: 5 }, maxWidth: 1600, mx: 'auto' }}>
        
        {/* Header */}
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems="flex-start" spacing={2} sx={{ mb: 4 }}>
          <Box>
            <Typography sx={{ fontSize: 32, fontWeight: 700, fontFamily: 'Georgia, serif' }}>
              Analytics
            </Typography>
            <Typography sx={{ mt: 0.5, color: colors.muted, fontSize: 14.5 }}>
              Platform-wide growth, engagement and health metrics
            </Typography>
          </Box>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box sx={{ px: 2, py: 1.2, borderRadius: 2.5, bgcolor: '#fff', border: `1px solid ${colors.line}` }}>
              <Typography sx={{ fontSize: 13, fontWeight: 600 }}>Mon, 23 March 2026</Typography>
            </Box>
            <IconButton sx={{ border: `1px solid ${colors.line}`, bgcolor: '#fff', width: 44, height: 44 }}>
              <Badge color="error" variant="dot">
                <BellIcon sx={{ color: colors.muted }} />
              </Badge>
            </IconButton>
            <Button startIcon={<ExportIcon />} variant="contained" sx={{ bgcolor: colors.text, color: '#fff', borderRadius: 2.5, px: 3, py: 1.2, textTransform: 'none', fontWeight: 600, '&:hover': { bgcolor: '#000' } }}>
              Export report
            </Button>
          </Stack>
        </Stack>

        {/* Growth Metric Cards */}
        <Grid container spacing={2.5} sx={{ mb: 5 }}>
          {GROWTH_STATS.map((stat, i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Paper sx={{ p: 3, borderRadius: 4, border: `1px solid ${colors.line}`, boxShadow: 'none' }}>
                <Typography sx={{ fontSize: 13, color: colors.muted, fontWeight: 600, mb: 1.5 }}>
                   <Box component="span" sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: stat.color, display: 'inline-block', mr: 1 }} />
                   {stat.label}
                </Typography>
                <Typography sx={{ fontSize: 28, fontWeight: 700, mb: 0.5 }}>{stat.val}</Typography>
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <Typography sx={{ fontSize: 13, fontWeight: 700, color: stat.up ? colors.green : colors.orange }}>
                    {stat.up ? '↑' : ''} {stat.change}
                  </Typography>
                  <Typography sx={{ fontSize: 12, color: colors.muted }}>{stat.sub}</Typography>
                </Stack>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* Middle Section: Growth & Outcomes */}
        <Grid container spacing={4} sx={{ mb: 5 }}>
          <Grid item xs={12} lg={8}>
            <Paper sx={{ p: 4, borderRadius: 5, border: `1px solid ${colors.line}`, boxShadow: 'none' }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={6}>
                <Typography sx={{ fontSize: 18, fontWeight: 700 }}>Patient & consultation growth</Typography>
                <Stack direction="row" spacing={1} sx={{ bgcolor: colors.soft, p: 0.5, borderRadius: 2 }}>
                  {['Monthly', 'Weekly', 'Daily'].map(w => (
                     <Button key={w} onClick={() => setWindow(w)} size="small" sx={{ 
                       textTransform: 'none', px: 2, borderRadius: 1.5,
                       bgcolor: window === w ? colors.paper : 'transparent',
                       color: window === w ? colors.text : colors.muted,
                       boxShadow: window === w ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                       '&:hover': { bgcolor: window === w ? colors.paper : 'rgba(0,0,0,0.05)' }
                     }}>
                       {w}
                     </Button>
                  ))}
                </Stack>
              </Stack>
              
              <Box sx={{ height: 260, position: 'relative', borderBottom: `1px solid ${colors.line}`, mb: 4, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', px: 2 }}>
                 {/* Dummy Line Chart Visualization */}
                 <svg width="100%" height="200" style={{ position: 'absolute', bottom: 0, left: 0 }}>
                    <path d="M0,180 Q80,160 160,140 T320,100 T480,120 T640,60 T800,40" fill="none" stroke={colors.green} strokeWidth="3" />
                    <path d="M0,190 Q80,170 160,160 T320,130 T480,150 T640,110 T800,80" fill="none" stroke={colors.blue} strokeWidth="3" strokeDasharray="5,5" />
                 </svg>
                 {['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'].map(m => (
                   <Typography key={m} sx={{ fontSize: 11, color: colors.muted, mb: -2.5 }}>{m}</Typography>
                 ))}
              </Box>

              <Stack direction="row" spacing={3}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                   <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: colors.green }} />
                   <Typography sx={{ fontSize: 12, color: colors.muted }}>New patients</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                   <Box sx={{ width: 10, height: 10, border: `2px dashed ${colors.blue}`, borderRadius: '50%' }} />
                   <Typography sx={{ fontSize: 12, color: colors.muted }}>Consultations (+10)</Typography>
                </Box>
              </Stack>
            </Paper>
          </Grid>

          <Grid item xs={12} lg={4}>
            <Stack spacing={4}>
              <Paper sx={{ p: 4, borderRadius: 5, border: `1px solid ${colors.line}`, boxShadow: 'none' }}>
                <Typography sx={{ fontSize: 16, fontWeight: 700, mb: 3 }}>Patient acquisition</Typography>
                <Stack spacing={3}>
                  {ACQUISITION.map((item, idx) => (
                    <Stack key={idx} direction="row" alignItems="center" spacing={2}>
                       <Box sx={{ width: 36, height: 36, borderRadius: '50%', bgcolor: colors.blueSoft, color: colors.blue, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                         {item.icon}
                       </Box>
                       <Box sx={{ flex: 1 }}>
                          <Typography sx={{ fontSize: 14, fontWeight: 700 }}>{item.label}</Typography>
                          <Typography sx={{ fontSize: 11, color: colors.muted }}>
                            {idx === 1 ? 'Completed sign-up' : idx === 2 ? 'Booked within 7 days' : idx === 3 ? 'Returned for follow-up' : 'This month'}
                          </Typography>
                       </Box>
                       <Box sx={{ textAlign: 'right' }}>
                          <Typography sx={{ fontSize: 14, fontWeight: 800 }}>{item.val}</Typography>
                          <Typography sx={{ fontSize: 11, color: colors.muted }}>{item.perc}</Typography>
                       </Box>
                    </Stack>
                  ))}
                </Stack>
              </Paper>

              <Paper sx={{ p: 3, borderRadius: 5, border: `1px solid ${colors.line}`, boxShadow: 'none' }}>
                <Typography sx={{ fontSize: 16, fontWeight: 700, mb: 2 }}>Consultation outcomes</Typography>
                <Box sx={{ height: 12, borderRadius: 6, bgcolor: colors.soft, overflow: 'hidden', display: 'flex', mb: 3 }}>
                   <Box sx={{ width: '68%', bgcolor: colors.green }} />
                   <Box sx={{ width: '19%', bgcolor: colors.orange }} />
                   <Box sx={{ width: '13%', bgcolor: colors.red }} />
                </Box>
                <Stack spacing={1.5} mb={3}>
                   <OutcomeItem color={colors.green} label="Prescription issued" val="68%" />
                   <OutcomeItem color={colors.orange} label="Follow-up booked" val="19%" />
                   <OutcomeItem color={colors.red} label="Escalated" val="13%" />
                </Stack>
                <Divider sx={{ mb: 2.5 }} />
                <Stack spacing={2}>
                   <ModeItem label="Video call" val="58%" color={colors.green} />
                   <ModeItem label="Audio call" val="28%" color={colors.blue} />
                   <ModeItem label="Chat / async" val="14%" color={colors.muted} />
                </Stack>
              </Paper>
            </Stack>
          </Grid>
        </Grid>

        {/* Bottom Section: Geography & Heatmap */}
        <Grid container spacing={4}>
          <Grid item xs={12} lg={4}>
             <Paper sx={{ p: 4, borderRadius: 5, border: `1px solid ${colors.line}`, boxShadow: 'none' }}>
                <Stack direction="row" justifyContent="space-between" mb={4}>
                   <Typography sx={{ fontSize: 16, fontWeight: 700 }}>Top states by patients</Typography>
                   <Button size="small" endIcon={<ArrowIcon sx={{ fontSize: 14 }} />} sx={{ textTransform: 'none', color: colors.blue }}>Full map</Button>
                </Stack>
                <Stack spacing={2.5}>
                   {TOP_STATES.map((state, i) => (
                     <Stack key={i} direction="row" alignItems="center" spacing={2}>
                        <Typography sx={{ fontSize: 12, color: colors.muted, width: 20 }}>{i+1}</Typography>
                        <Typography sx={{ fontSize: 13, fontWeight: 600, width: 100 }}>{state.name}</Typography>
                        <Box sx={{ flex: 1, height: 6, bgcolor: colors.soft, borderRadius: 3, overflow: 'hidden' }}>
                           <Box sx={{ width: `${state.perc}%`, height: '100%', bgcolor: colors.green }} />
                        </Box>
                        <Typography sx={{ fontSize: 13, fontWeight: 700, width: 45, textAlign: 'right' }}>{state.val}</Typography>
                     </Stack>
                   ))}
                </Stack>
             </Paper>
          </Grid>

          <Grid item xs={12} lg={8}>
            <Grid container spacing={4}>
               <Grid item xs={12} md={7}>
                 <Paper sx={{ p: 4, borderRadius: 5, border: `1px solid ${colors.line}`, boxShadow: 'none', height: '100%' }}>
                    <Typography sx={{ fontSize: 16, fontWeight: 700, mb: 3 }}>Consultation heatmap (by hour)</Typography>
                    <Typography sx={{ fontSize: 12, color: colors.muted, mb: 4 }}>Avg consultations per hour · Past 30 days</Typography>
                    
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 1, mb: 2 }}>
                       {Array.from({ length: 24 }).map((_, i) => (
                         <Box key={i} sx={{ 
                           aspectRatio: '1', borderRadius: 1, 
                           bgcolor: i > 8 && i < 20 ? colors.green : i > 12 && i < 18 ? colors.green : colors.greenSoft,
                           opacity: i < 5 || i > 22 ? 0.3 : 1
                         }} />
                       ))}
                    </Box>
                    <Stack direction="row" justifyContent="space-between" mb={4}>
                       {HEATMAP_HOURS.map(h => <Typography key={h} sx={{ fontSize: 10, color: colors.muted }}>{h}</Typography>)}
                    </Stack>

                    <Stack direction="row" spacing={1} alignItems="center">
                       <Typography sx={{ fontSize: 10, color: colors.muted }}>Low</Typography>
                       <Box sx={{ flex: 1, height: 4, borderRadius: 2, background: `linear-gradient(to right, ${colors.greenSoft}, ${colors.green})` }} />
                       <Typography sx={{ fontSize: 10, color: colors.muted }}>High</Typography>
                    </Stack>
                 </Paper>
               </Grid>
               
               <Grid item xs={12} md={5}>
                 <Paper sx={{ p: 4, borderRadius: 5, border: `1px solid ${colors.line}`, boxShadow: 'none' }}>
                    <Typography sx={{ fontSize: 16, fontWeight: 700, mb: 3 }}>Key engagement metrics</Typography>
                    <Stack spacing={3.5}>
                       <MetricRow label="Avg session duration" val="14.2 min" />
                       <MetricRow label="Symptom checker usage" val="48%" showBar perc={48} />
                       <MetricRow label="Offline mode usage" val="34%" showBar perc={34} color={colors.blue} />
                       <MetricRow label="Rural (non-urban) patients" val="71%" />
                    </Stack>
                 </Paper>
               </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Box>
    </AdminLayout>
  );
}

function OutcomeItem({ color, label, val }) {
  return (
    <Stack direction="row" alignItems="center" spacing={1}>
       <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: color }} />
       <Typography sx={{ fontSize: 13, color: colors.muted, flex: 1 }}>{label}</Typography>
       <Typography sx={{ fontSize: 13, fontWeight: 700 }}>{val}</Typography>
    </Stack>
  );
}

function ModeItem({ label, val, color }) {
  return (
    <Stack direction="row" alignItems="center" spacing={2}>
       <Typography sx={{ fontSize: 12.5, width: 80, fontWeight: 500 }}>{label}</Typography>
       <Box sx={{ flex: 1, height: 4, bgcolor: colors.soft, borderRadius: 2, overflow: 'hidden' }}>
          <Box sx={{ width: val, height: '100%', bgcolor: color }} />
       </Box>
       <Typography sx={{ fontSize: 12, fontWeight: 700, width: 35, textAlign: 'right' }}>{val}</Typography>
    </Stack>
  );
}

function MetricRow({ label, val, showBar, perc, color = colors.green }) {
  return (
    <Box>
       <Stack direction="row" justifyContent="space-between" alignItems="center" mb={showBar ? 1 : 0}>
          <Typography sx={{ fontSize: 13, color: colors.muted, fontWeight: 500 }}>{label}</Typography>
          <Typography sx={{ fontSize: 15, fontWeight: 800 }}>{val}</Typography>
       </Stack>
       {showBar && (
          <Box sx={{ height: 4, bgcolor: colors.soft, borderRadius: 2, overflow: 'hidden' }}>
             <Box sx={{ width: `${perc}%`, height: '100%', bgcolor: color }} />
          </Box>
       )}
    </Box>
  );
}
