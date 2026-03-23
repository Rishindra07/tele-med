import React, { useState } from 'react';
import {
  Box, Typography, Stack, Button, IconButton, Badge, Divider,
  Grid, Paper, Avatar, LinearProgress, Chip,
} from '@mui/material';
import {
  NotificationsNoneRounded as BellIcon,
  AddRounded as AddIcon,
  VerifiedRounded as VerifiedIcon,
  ReportProblemRounded as AlertIcon,
  KeyboardArrowRightRounded as ArrowIcon,
  MoreVertRounded as MenuIcon,
  CheckCircleRounded as CheckIcon,
  CancelRounded as ErrorIcon,
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
  { label: 'Total doctors', val: '349', change: '+12', up: true, sub: 'this month', color: colors.blue },
  { label: 'Verified & active', val: '342', change: '18', sub: 'specializations', color: colors.green },
  { label: 'Pending verification', val: '7', change: '8 over 48 hrs', sub: 'Risk: Med', color: colors.orange },
  { label: 'License expiring', val: '4', change: 'within 30 days', sub: 'Alert active', color: colors.red }
];

const QUEUE = [
  { name: 'Dr. Maya', location: 'Mumbai • Gynecologist', details: 'AIIMS Semi • Submitted 21 Mar • Aadhaar verified • MCI registration: 2018-0921', status: 'Pending 4h', avatar: 'DM', color: colors.orange },
  { name: 'Dr. Suresh', location: 'Pune • General Physician', details: 'KEM Hospital • Submitted 20 Mar • All documents complete', status: 'Pending 12h', avatar: 'DS', color: colors.orange },
  { name: 'Dr. Ajay Kumar', location: 'Amritsar • General Physician', details: 'Punjab Medical • Submitted 18 Mar • Drug license verified', status: 'FLAGGED', avatar: 'AK', color: colors.red },
  { name: 'Dr. Nisha Verma', location: 'Bangalore • Neurologist • Submitted 22 Mar • Pending degree verification', status: 'NEW', avatar: 'NV', color: colors.blue }
];

const SPECIALIZATIONS = [
  { name: 'General Physician', count: 128, perc: 80 },
  { name: 'Cardiologist', count: 62, perc: 45 },
  { name: 'Gynecologist', count: 51, perc: 38 },
  { name: 'Diabetologist', count: 42, perc: 30 },
  { name: 'Neurologist', count: 31, perc: 25 },
  { name: 'Others (14)', count: 37, perc: 28 }
];

const EXPIRY_ALERTS = [
  { name: 'Dr. Priya Sharma', date: '15 Apr 2026', color: colors.red },
  { name: 'Dr. Vikram Joshi', date: '28 Apr 2026', color: colors.red },
  { name: 'Dr. Neha Gupta', date: '5 May 2026', color: colors.orange },
  { name: 'Dr. Arjun Kumar', date: '12 May 2026', color: colors.orange }
];

const PERFORMANCE = [
  { name: 'Dr. Priya Sharma', spec: 'General Physician', loc: 'Punjab', cons: 342, rating: '4.9', resp: '3.2 min', rx: '88%', status: 'Active' },
  { name: 'Dr. Manish Rao', spec: 'Cardiologist', loc: 'Delhi', cons: 298, rating: '4.8', resp: '4.1 min', rx: '92%', status: 'Active' },
  { name: 'Dr. Anita Verma', spec: 'Gynecologist', loc: 'Mumbai', cons: 215, rating: '4.6', resp: '3.5 min', rx: '89%', status: 'Active' },
  { name: 'Dr. Vikram Jha', spec: 'General Physician', loc: 'Bihar', cons: 41, rating: '3.1', resp: '15.4 min', rx: '41%', status: 'Flagged' }
];

export default function AdminDoctors() {
  return (
    <AdminLayout>
      <Box sx={{ p: { xs: 2.5, md: 4, xl: 5 }, maxWidth: 1600, mx: 'auto' }}>
        
        {/* Header */}
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems="flex-start" spacing={2} sx={{ mb: 4 }}>
          <Box>
            <Typography sx={{ fontSize: 32, fontWeight: 700, fontFamily: 'Georgia, serif' }}>
              Doctors
            </Typography>
            <Typography sx={{ mt: 0.5, color: colors.muted, fontSize: 14.5 }}>
               Manage doctor accounts, verification queue and performance
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
              Add doctor
            </Button>
          </Stack>
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
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <Typography sx={{ fontSize: 13, fontWeight: 700, color: stat.up ? colors.green : stat.color }}>
                    {stat.change}
                  </Typography>
                  <Typography sx={{ fontSize: 12, color: colors.muted }}>{stat.sub}</Typography>
                </Stack>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* Verification and Sidebar */}
        <Grid container spacing={4} sx={{ mb: 5 }}>
          <Grid item xs={12} lg={7}>
            <Paper sx={{ p: 4, borderRadius: 5, border: `1px solid ${colors.line}`, boxShadow: 'none' }}>
               <Stack direction="row" justifyContent="space-between" mb={4}>
                  <Typography sx={{ fontSize: 18, fontWeight: 700 }}>Verification queue</Typography>
                  <Button size="small" endIcon={<ArrowIcon sx={{ fontSize: 14 }} />} sx={{ textTransform: 'none', color: colors.green }}>View all</Button>
               </Stack>
               
               <Stack direction="row" spacing={1} mb={4}>
                  {['All 7', 'Pending', 'Flagged', 'Approved today'].map(f => (
                    <Chip key={f} label={f} size="small" sx={{ borderRadius: 1.5, height: 28, fontSize: 12, bgcolor: f === 'All 7' ? colors.green : colors.soft, color: f === 'All 7' ? '#fff' : colors.muted }} />
                  ))}
               </Stack>

               <Stack spacing={4}>
                  {QUEUE.map((q, i) => (
                    <Box key={i} sx={{ position: 'relative' }}>
                       <Stack direction="row" spacing={2.5}>
                          <Avatar sx={{ width: 44, height: 44, bgcolor: colors.blueSoft, color: colors.blue, fontWeight: 700, fontSize: 14 }}>{q.avatar}</Avatar>
                          <Box sx={{ flex: 1 }}>
                             <Typography sx={{ fontSize: 15, fontWeight: 700 }}>{q.name} — <Typography component="span" sx={{ fontSize: 13, color: colors.muted }}>{q.location}</Typography></Typography>
                             <Typography sx={{ fontSize: 12, color: colors.muted, mt: 0.5, maxWidth: '80%', lineHeight: 1.4 }}>{q.details}</Typography>
                          </Box>
                          <Stack direction="row" spacing={1} alignItems="center">
                             <Chip label={q.status} size="small" sx={{ height: 20, fontSize: 10, fontWeight: 700, bgcolor: q.color + '20', color: q.color }} />
                             {q.status === 'FLAGGED' ? (
                               <>
                                 <Button variant="outlined" size="small" sx={{ borderRadius: 1.5, textTransform: 'none', px: 2 }}>Review</Button>
                                 <Button variant="outlined" color="error" size="small" sx={{ borderRadius: 1.5, textTransform: 'none', px: 2 }}>Reject</Button>
                               </>
                             ) : q.status === 'NEW' ? (
                               <Button variant="outlined" size="small" sx={{ borderRadius: 1.5, textTransform: 'none', px: 2 }}>Review</Button>
                             ) : (
                               <>
                                 <Button variant="outlined" size="small" sx={{ borderRadius: 1.5, textTransform: 'none', px: 2 }}>Approve</Button>
                                 <Button variant="outlined" color="error" size="small" sx={{ borderRadius: 1.5, textTransform: 'none', px: 2 }}>Reject</Button>
                               </>
                             )}
                          </Stack>
                       </Stack>
                       {i < QUEUE.length - 1 && <Divider sx={{ mt: 4 }} />}
                    </Box>
                  ))}
               </Stack>
            </Paper>
          </Grid>

          <Grid item xs={12} lg={5}>
             <Stack spacing={4}>
                <Paper sx={{ p: 4, borderRadius: 5, border: `1px solid ${colors.line}`, boxShadow: 'none' }}>
                   <Typography sx={{ fontSize: 16, fontWeight: 700, mb: 3 }}>By specialization</Typography>
                   <Stack spacing={2.5}>
                      {SPECIALIZATIONS.map((s, i) => (
                        <Stack key={i} direction="row" alignItems="center" spacing={2}>
                           <Typography sx={{ fontSize: 13, color: colors.text, fontWeight: 500, width: 120 }}>{s.name}</Typography>
                           <Box sx={{ flex: 1, height: 4, bgcolor: colors.soft, borderRadius: 2, overflow: 'hidden' }}>
                              <Box sx={{ width: `${s.perc}%`, height: '100%', bgcolor: colors.green }} />
                           </Box>
                           <Typography sx={{ fontSize: 14, fontWeight: 700, width: 30, textAlign: 'right' }}>{s.count}</Typography>
                        </Stack>
                      ))}
                   </Stack>
                </Paper>

                <Paper sx={{ p: 4, borderRadius: 5, border: `1px solid ${colors.line}`, boxShadow: 'none' }}>
                   <Typography sx={{ fontSize: 16, fontWeight: 700, mb: 3 }}>License expiry alerts</Typography>
                   <Stack spacing={2.5}>
                      {EXPIRY_ALERTS.map((a, i) => (
                        <Stack key={i} direction="row" justifyContent="space-between" alignItems="center">
                           <Typography sx={{ fontSize: 13.5, fontWeight: 500 }}>{a.name}</Typography>
                           <Typography sx={{ fontSize: 13, fontWeight: 700, color: a.color }}>{a.date}</Typography>
                        </Stack>
                      ))}
                   </Stack>
                </Paper>
             </Stack>
          </Grid>
        </Grid>

        {/* Performance Leaderboard */}
        <Paper sx={{ p: 0, borderRadius: 5, border: `1px solid ${colors.line}`, boxShadow: 'none', overflow: 'hidden' }}>
           <Box sx={{ p: 4, borderBottom: `1px solid ${colors.line}` }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                 <Typography sx={{ fontSize: 18, fontWeight: 700 }}>Top doctors by performance</Typography>
                 <Button size="small" endIcon={<ArrowIcon sx={{ fontSize: 14 }} />} sx={{ textTransform: 'none', color: colors.blue }}>Full list</Button>
              </Stack>
           </Box>
           <Box sx={{ px: 3, py: 2, bgcolor: colors.soft, display: 'flex' }}>
              <Typography sx={{ fontSize: 12, fontWeight: 700, color: colors.muted, width: '15%' }}>Doctor</Typography>
              <Typography sx={{ fontSize: 12, fontWeight: 700, color: colors.muted, width: '15%' }}>Specialization</Typography>
              <Typography sx={{ fontSize: 12, fontWeight: 700, color: colors.muted, width: '10%' }}>Location</Typography>
              <Typography sx={{ fontSize: 12, fontWeight: 700, color: colors.muted, width: '15%' }}>Consultations</Typography>
              <Typography sx={{ fontSize: 12, fontWeight: 700, color: colors.muted, width: '10%' }}>Rating</Typography>
              <Typography sx={{ fontSize: 12, fontWeight: 700, color: colors.muted, width: '15%' }}>Avg response</Typography>
              <Typography sx={{ fontSize: 12, fontWeight: 700, color: colors.muted, width: '10%' }}>Rx issued</Typography>
              <Typography sx={{ fontSize: 12, fontWeight: 700, color: colors.muted, width: '10%', textAlign: 'right' }}>Status</Typography>
           </Box>
           {PERFORMANCE.map((p, i) => (
             <Box key={i} sx={{ px: 3, py: 2.5, display: 'flex', alignItems: 'center', borderBottom: i === PERFORMANCE.length - 1 ? 'none' : `1px solid ${colors.line}` }}>
                <Typography sx={{ fontSize: 13.5, fontWeight: 700, width: '15%' }}>{p.name}</Typography>
                <Typography sx={{ fontSize: 13, color: colors.muted, width: '15%' }}>{p.spec}</Typography>
                <Typography sx={{ fontSize: 13, color: colors.muted, width: '10%' }}>{p.loc}</Typography>
                <Typography sx={{ fontSize: 13, fontWeight: 600, width: '15%' }}>{p.cons}</Typography>
                <Stack direction="row" spacing={0.5} alignItems="center" sx={{ width: '10%' }}>
                   <Typography sx={{ fontSize: 13, fontWeight: 700 }}>{p.rating}</Typography>
                   <VerifiedIcon sx={{ fontSize: 14, color: colors.green }} />
                </Stack>
                <Typography sx={{ fontSize: 13, color: p.resp.includes('15') ? colors.red : colors.text, fontWeight: p.resp.includes('15') ? 700 : 400, width: '15%' }}>{p.resp}</Typography>
                <Typography sx={{ fontSize: 13, width: '10%' }}>{p.rx}</Typography>
                <Box sx={{ width: '10%', textAlign: 'right' }}>
                   <Chip label={p.status} size="small" sx={{ height: 22, fontSize: 11, fontWeight: 700, bgcolor: p.status === 'Active' ? colors.greenSoft : colors.redSoft, color: p.status === 'Active' ? colors.green : colors.red }} />
                </Box>
             </Box>
           ))}
        </Paper>
      </Box>
    </AdminLayout>
  );
}
