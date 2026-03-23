import React from 'react';
import {
  Box, Typography, Stack, Button, IconButton, Badge, Divider,
  Grid, Paper, Avatar, LinearProgress, Chip,
} from '@mui/material';
import {
  NotificationsNoneRounded as BellIcon,
  AddRounded as AddIcon,
  VerifiedRounded as VerifiedIcon,
  ReportProblemRounded as AlertIcon,
  TrendingUpRounded as GrowthIcon,
  TrendingDownRounded as LossIcon,
  KeyboardArrowRightRounded as ArrowIcon,
  CheckCircleRounded as CheckIcon,
  InfoRounded as InfoIcon,
  CancelRounded as ErrorIcon,
  MapRounded as MapIcon,
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
  { label: 'Total patients', val: '12,482', change: '+2.4%', up: true, sub: 'this week' },
  { label: 'Verified doctors', val: '342', change: '7 pending', sub: 'verification', alert: true },
  { label: 'Active pharmacies', val: '891', change: '+12', up: true, sub: 'this month' },
  { label: 'Consultations today', val: '1,840', change: 'High load', sub: 'peak time', alert: true },
  { label: 'Prescriptions issued', val: '924', change: '+1.2K', up: true, sub: 'today' },
  { label: 'Platform revenue', val: '₹4.2L', change: 'March 2026', sub: 'Target: ₹5L' },
  { label: 'Flagged accounts', val: '14', change: 'Require review', sub: 'Risk level: Med', alert: true },
  { label: 'Avg Response Time', val: '4.2m', change: 'Doctor acceptance', sub: 'Target: < 3m' }
];

const DOCTOR_QUEUE = [
  { name: 'Dr. Ravi Mehta', specialization: 'Neurologist', location: 'New Delhi • Verified ID', status: 'ID PENDING', avatar: 'RM', color: colors.orange },
  { name: 'Dr. Shalini Patil', specialization: 'Gynecologist', location: 'Navi Mumbai • Experience 12Y', status: 'PENDING', avatar: 'SP', color: colors.orange },
  { name: 'Dr. Ajay Kumar', specialization: 'General Physician', location: 'Punjab, Gurdaspur • License Valid', status: 'FLAGGED', avatar: 'AK', color: colors.red },
  { name: 'Dr. Manoj Verma', specialization: 'Pharmacist', location: 'Bangalore • License #9902', status: 'NEW', avatar: 'MV', color: colors.blue },
  { name: 'Dr. Mukani Bala', specialization: 'Dermatologist', location: 'Hyderabad • Registered 21 Mar', status: 'REVIEW', avatar: 'MB', color: colors.yellow }
];

const RECENT_ACTIVITY = [
  { text: 'Dr. Priya Sharma completed session', time: '2m ago', color: colors.green },
  { text: 'New pharmacy registered — Chemist World', time: '14m ago', color: colors.blue },
  { text: 'Flagged account #1142 — Verified by Sagar Adani', time: '36m ago', color: colors.red },
  { text: 'Maximum delivery time alert — Rajasthan cluster', time: '51m ago', color: colors.orange },
  { text: 'Payment processed to Dr. Manish Rao: ₹12,402', time: '1h ago', color: colors.green },
  { text: 'New patient account created - 881-Visakhapatnam', time: '2h ago', color: colors.blue }
];

const TOP_DOCTORS = [
  { name: 'Dr. Priya Sharma', spec: 'General Physician', rating: '4.9', views: '12.4k views' },
  { name: 'Dr. Manish Rao', spec: 'Cardiologist', rating: '4.8', views: '9.8k views' },
  { name: 'Dr. Anita Verma', spec: 'Gynecologist', rating: '4.7', views: '11.5k views' },
  { name: 'Dr. Ravi Kumar', spec: 'Dermatologist', rating: '4.6', views: '8.2k views' }
];

const FLAGGED_ACCOUNTS = [
  { id: 'Patient #992-PD-M-04', issue: 'Suspicious login active for 3 days', status: 'Suspended' },
  { id: 'Dr. Manoj Patil (Unverified)', issue: 'Missing medical license confirmation', status: 'Urgent' },
  { id: 'Patient #442-PT-W-21', issue: 'Multiple invalid payment attempts', status: 'Review' },
  { id: 'Rx Network - Gurdaspur', issue: 'Expired drug license', status: 'Critical' }
];

export default function AdminDashboard() {
  return (
    <AdminLayout>
      <Box sx={{ p: { xs: 2.5, md: 4, xl: 5 }, maxWidth: 1600, mx: 'auto' }}>
        
        {/* Header */}
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems="flex-start" spacing={2} sx={{ mb: 4 }}>
          <Box>
            <Typography sx={{ fontSize: 32, fontWeight: 700, fontFamily: 'Georgia, serif' }}>
              Admin dashboard
            </Typography>
            <Typography sx={{ mt: 0.5, color: colors.muted, fontSize: 14.5 }}>
              Platform management console — Seva TeleHealth • <Typography component="span" sx={{ color: colors.orange, fontWeight: 600 }}>MON, 23 MAR 2026, 12:34</Typography>
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
            <Button startIcon={<AddIcon />} variant="contained" sx={{ bgcolor: colors.text, color: '#fff', borderRadius: 2.5, px: 3, py: 1.2, textTransform: 'none', fontWeight: 600, '&:hover': { bgcolor: '#000' } }}>
              Add user
            </Button>
          </Stack>
        </Stack>

        {/* Critical Alert Bar */}
        <Box sx={{ mb: 4, p: 2, borderRadius: 3, bgcolor: colors.redSoft, border: `1px solid ${colors.red}20`, display: 'flex', alignItems: 'center', gap: 2 }}>
          <AlertIcon sx={{ color: colors.red }} />
          <Typography sx={{ fontSize: 14, color: colors.red, fontWeight: 500, flex: 1 }}>
            Critical Alert: <Typography component="span" sx={{ fontWeight: 700 }}>Notification delivery failure</Typography> in Rajasthan cluster. 3 doctor verifications pending for {'>'}48 hrs.
          </Typography>
          <Button sx={{ textTransform: 'none', fontSize: 13, fontWeight: 700, color: colors.red, p:0 }}>View all alerts</Button>
        </Box>

        {/* Metrics Grid */}
        <Grid container spacing={2.5} sx={{ mb: 5 }}>
          {STATS.map((stat, idx) => (
            <Grid item xs={12} sm={6} md={3} key={idx}>
              <Paper sx={{ p: 2.5, borderRadius: 4, border: `1px solid ${colors.line}`, boxShadow: 'none' }}>
                <Stack direction="row" justifyContent="space-between" mb={1}>
                  <Typography sx={{ fontSize: 13, color: colors.muted, fontWeight: 500 }}>{stat.label}</Typography>
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: stat.alert ? colors.red : colors.green }} />
                </Stack>
                <Typography sx={{ fontSize: 28, fontWeight: 700, mb: 0.5 }}>{stat.val}</Typography>
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <Typography sx={{ fontSize: 12.5, fontWeight: 600, color: stat.up ? colors.green : stat.alert ? colors.red : colors.blue }}>
                    {stat.change}
                  </Typography>
                  <Typography sx={{ fontSize: 12, color: colors.muted }}>{stat.sub}</Typography>
                </Stack>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* Middle Section */}
        <Grid container spacing={4} sx={{ mb: 5 }}>
          {/* Main Chart Card */}
          <Grid item xs={12} lg={8}>
            <Paper sx={{ p: 4, borderRadius: 5, border: `1px solid ${colors.line}`, boxShadow: 'none' }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
                <Box>
                  <Typography sx={{ fontSize: 18, fontWeight: 700 }}>Daily consultations — March 2026</Typography>
                </Box>
                <Stack direction="row" spacing={2}>
                  <Chip label="Full analytics" size="small" variant="outlined" component={Button} sx={{ borderRadius: 1.5, cursor: 'pointer' }} />
                </Stack>
              </Stack>
              
              <Box sx={{ height: 200, display: 'flex', alignItems: 'flex-end', gap: 1.5, px: 2, mb: 4 }}>
                {[60, 45, 80, 55, 70, 90, 85, 120, 100, 110, 140, 130, 150, 110, 135, 145, 160, 175, 165, 190].map((h, i) => (
                  <Box key={i} sx={{ flex: 1, height: `${h}px`, bgcolor: i === 19 ? colors.blue : '#d8efe8', borderRadius: '4px 4px 0 0' }} />
                ))}
              </Box>

              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Stack direction="row" spacing={3}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: colors.green }} />
                    <Typography sx={{ fontSize: 13, color: colors.muted }}>Video call 65%</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: colors.blueSoft }} />
                    <Typography sx={{ fontSize: 13, color: colors.muted }}>Audio call 20%</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: colors.blue }} />
                    <Typography sx={{ fontSize: 13, color: colors.muted }}>Chat support 15%</Typography>
                  </Box>
                </Stack>
              </Stack>
            </Paper>
          </Grid>

          {/* System Health Card */}
          <Grid item xs={12} lg={4}>
            <Stack spacing={3}>
              <Paper sx={{ p: 4, borderRadius: 5, border: `1px solid ${colors.line}`, boxShadow: 'none' }}>
                <Typography sx={{ fontSize: 18, fontWeight: 700, mb: 3 }}>System health <Typography component="span" sx={{ fontSize: 12, color: colors.green, float: 'right' }}>Check status</Typography></Typography>
                <Stack spacing={2.5}>
                  <HealthItem label="API services" status="Operational" color={colors.green} />
                  <HealthItem label="Video call salt" status="Operational" color={colors.green} />
                  <HealthItem label="Notifications" status="Delayed delivery" color={colors.orange} />
                  <HealthItem label="Database clusters" status="Operational" color={colors.green} />
                  <HealthItem label="Offline sync service" status="Operational" color={colors.green} />
                  <HealthItem label="Payments gateway" status="Operational" color={colors.green} />
                </Stack>
              </Paper>
              
              <Paper sx={{ p: 3, borderRadius: 5, border: `1px solid ${colors.line}`, boxShadow: 'none', bgcolor: colors.blueSoft }}>
                 <Stack direction="row" spacing={2} alignItems="center">
                    <MapIcon sx={{ color: colors.blue }} />
                    <Box>
                      <Typography sx={{ fontSize: 14, fontWeight: 700 }}>Geographic coverage</Typography>
                      <Typography sx={{ fontSize: 12, color: colors.muted }}>Active in 43 districts across 12 states</Typography>
                    </Box>
                 </Stack>
              </Paper>
            </Stack>
          </Grid>
        </Grid>

        {/* Bottom Grid */}
        <Grid container spacing={4}>
          {/* Doctor Queue */}
          <Grid item xs={12} lg={4.5}>
            <Paper sx={{ p: 4, borderRadius: 5, border: `1px solid ${colors.line}`, boxShadow: 'none' }}>
              <Typography sx={{ fontSize: 18, fontWeight: 700, mb: 4 }}>Doctor verification queue</Typography>
              <Stack spacing={3}>
                {DOCTOR_QUEUE.map((doc, i) => (
                  <Stack key={i} direction="row" alignItems="center" spacing={2}>
                    <Avatar sx={{ bgcolor: colors.soft, color: colors.muted, fontSize: 13, fontWeight: 700 }}>{doc.avatar}</Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography sx={{ fontSize: 14, fontWeight: 700 }}>{doc.name} — <Typography component="span" sx={{ color: doc.color, fontSize: 12 }}>{doc.status}</Typography></Typography>
                      <Typography sx={{ fontSize: 12, color: colors.muted }}>{doc.specialization} • {doc.location}</Typography>
                    </Box>
                    <Button variant="outlined" size="small" sx={{ borderRadius: 2, textTransform: 'none', fontSize: 12, py: 0.5 }}>Review</Button>
                  </Stack>
                ))}
              </Stack>
            </Paper>
          </Grid>

          {/* Platform Breakdown & Recent Activity */}
          <Grid item xs={12} lg={4}>
             <Stack spacing={4}>
               <Paper sx={{ p: 3, borderRadius: 5, border: `1px solid ${colors.line}`, boxShadow: 'none' }}>
                 <Typography sx={{ fontSize: 16, fontWeight: 700, mb: 2 }}>Platform breakdown</Typography>
                 <Stack direction="row" spacing={1} mb={3}>
                    <MiniStat label="Active patients" val="12.4K" />
                    <MiniStat label="Active doctors" val="342" />
                    <MiniStat label="Pharmacies" val="891" />
                    <MiniStat label="User ratio" val="1:48" />
                 </Stack>
                 <Box sx={{ height: 10, borderRadius: 5, bgcolor: colors.soft, overflow: 'hidden', display: 'flex' }}>
                    <Box sx={{ width: '65%', bgcolor: colors.green }} />
                    <Box sx={{ width: '15%', bgcolor: colors.blue }} />
                    <Box sx={{ width: '10%', bgcolor: colors.orange }} />
                    <Box sx={{ width: '10%', bgcolor: colors.text }} />
                 </Box>
               </Paper>

               <Paper sx={{ p: 3, borderRadius: 5, border: `1px solid ${colors.line}`, boxShadow: 'none' }}>
                 <Typography sx={{ fontSize: 16, fontWeight: 700, mb: 3 }}>Recent activity <Typography component="span" sx={{ float: 'right', fontSize: 12, color: colors.blue }}>Audit log</Typography></Typography>
                 <Stack spacing={2.5}>
                    {RECENT_ACTIVITY.map((act, i) => (
                      <Stack key={i} direction="row" spacing={2}>
                        <Box sx={{ width: 8, height: 8, mt: 0.7, borderRadius: '50%', bgcolor: act.color, flexShrink: 0 }} />
                        <Box sx={{ flex: 1 }}>
                          <Typography sx={{ fontSize: 13.5, fontWeight: 500, lineHeight: 1.2 }}>{act.text}</Typography>
                          <Typography sx={{ fontSize: 11, color: colors.muted, mt: 0.4 }}>{act.time}</Typography>
                        </Box>
                      </Stack>
                    ))}
                 </Stack>
               </Paper>
             </Stack>
          </Grid>

          {/* Top Doctors & Flagged */}
          <Grid item xs={12} lg={3.5}>
            <Stack spacing={4}>
              <Paper sx={{ p: 3, borderRadius: 5, border: `1px solid ${colors.line}`, boxShadow: 'none' }}>
                <Typography sx={{ fontSize: 16, fontWeight: 700, mb: 3 }}>Top performing doctors</Typography>
                <Stack spacing={2.5}>
                  {TOP_DOCTORS.map((doc, i) => (
                    <Stack key={i} direction="row" alignItems="center" spacing={2}>
                      <Avatar sx={{ width: 32, height: 32, bgcolor: colors.soft, color: colors.muted, fontSize: 11 }}>{doc.name.split(' ').map(n=>n[0]).join('')}</Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography sx={{ fontSize: 13.5, fontWeight: 700 }}>{doc.name}</Typography>
                        <Typography sx={{ fontSize: 11, color: colors.muted }}>{doc.spec} • {doc.views}</Typography>
                      </Box>
                      <Chip label={doc.rating} size="small" icon={<VerifiedIcon sx={{ fontSize: '14px !important', color: `${colors.green} !important` }} />} sx={{ bgcolor: colors.greenSoft, fontWeight: 700, height: 24 }} />
                    </Stack>
                  ))}
                </Stack>
              </Paper>

              <Paper sx={{ p: 3, borderRadius: 5, border: `1px solid ${colors.line}`, boxShadow: 'none' }}>
                <Typography sx={{ fontSize: 16, fontWeight: 700, mb: 3 }}>Flagged accounts <Typography component="span" sx={{ float: 'right', fontSize: 12, color: colors.red }}>Review all</Typography></Typography>
                <Stack spacing={2}>
                   {FLAGGED_ACCOUNTS.map((acc, i) => (
                     <Box key={i} sx={{ p: 1.5, borderRadius: 3, border: `1px solid ${colors.line}`, borderLeft: `4px solid ${acc.status === 'Critical' ? colors.red : colors.orange}` }}>
                        <Typography sx={{ fontSize: 13, fontWeight: 700 }}>{acc.id} <Chip label={acc.status} size="small" sx={{ height: 20, fontSize: 10, fontWeight: 700, bgcolor: acc.status === 'Critical' ? colors.redSoft : colors.orangeSoft, color: acc.status === 'Critical' ? colors.red : colors.orange }} /></Typography>
                        <Typography sx={{ fontSize: 11, color: colors.muted, mt: 0.5 }}>{acc.issue}</Typography>
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

function HealthItem({ label, status, color }) {
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center">
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: color }} />
        <Typography sx={{ fontSize: 14 }}>{label}</Typography>
      </Stack>
      <Typography sx={{ fontSize: 12, color: colors.muted }}>{status}</Typography>
    </Stack>
  );
}

function MiniStat({ label, val }) {
  return (
    <Box sx={{ flex: 1 }}>
      <Typography sx={{ fontSize: 16, fontWeight: 800 }}>{val}</Typography>
      <Typography sx={{ fontSize: 10, color: colors.muted, whiteSpace: 'nowrap' }}>{label}</Typography>
    </Box>
  );
}
