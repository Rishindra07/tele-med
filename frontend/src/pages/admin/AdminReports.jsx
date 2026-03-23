import React from 'react';
import {
  Box, Typography, Stack, Button, IconButton, Badge, Divider,
  Grid, Paper, Avatar, Chip,
} from '@mui/material';
import {
  AddRounded as AddIcon,
  PictureAsPdfRounded as PdfIcon,
  TableChartRounded as ExcelIcon,
  ScheduleRounded as ClockIcon,
  MailRounded as MailIcon,
  GroupRounded as PatientIcon,
  MedicalServicesRounded as DoctorIcon,
  LocalPharmacyRounded as PharmacyIcon,
  AccountBalanceWalletRounded as FinanceIcon,
  AssignmentTurnedInRounded as ComplianceIcon,
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

const QUICK_REPORTS = [
  { 
    title: 'Patient registration trends', 
    desc: 'New patients by state, district, and retention', 
    icon: <PatientIcon sx={{ color: colors.green }} />, 
    bgColor: colors.greenSoft 
  },
  { 
    title: 'Doctor performance report', 
    desc: 'Consultations, ratings, response time, Rx rate', 
    icon: <DoctorIcon sx={{ color: colors.blue }} />, 
    bgColor: colors.blueSoft 
  },
  { 
    title: 'Pharmacy fulfilment report', 
    desc: 'Fulfilment rates, stock levels, coverage gaps', 
    icon: <PharmacyIcon sx={{ color: '#6366f1' }} />, 
    bgColor: '#e0e7ff' 
  },
  { 
    title: 'Financial summary', 
    desc: 'Revenue, payouts, GST, refunds by month', 
    icon: <FinanceIcon sx={{ color: colors.orange }} />, 
    bgColor: colors.orangeSoft 
  },
  { 
    title: 'GSTR-1 platform statement', 
    desc: 'B2B/B2C transactions, adherance and earnings', 
    icon: <ComplianceIcon sx={{ color: colors.green }} />, 
    bgColor: colors.greenSoft 
  }
];

const SCHEDULED = [
  { title: 'Daily operations digest', scheduled: 'Every day 8:00 AM • Email to admin team', status: 'Active', icon: <ClockIcon sx={{ color: colors.green }} />, color: colors.green },
  { title: 'Weekly growth summary', scheduled: 'Every Monday 9:00 AM • Email to stakeholders', status: 'Active', icon: <TimelineIcon sx={{ color: colors.blue }} />, color: colors.blue },
  { title: 'Monthly financial report', scheduled: '1st of every month • Financial team', status: 'Active', icon: <FinanceIcon sx={{ color: colors.orange }} />, color: colors.orange },
  { title: 'User compliance report', scheduled: 'Quarterly • MOH compliance board', status: 'Draft', icon: <ComplianceIcon sx={{ color: colors.muted }} />, color: colors.muted }
];

function TimelineIcon(props) {
  return <ClockIcon {...props} />;
}

export default function AdminReports() {
  return (
    <AdminLayout>
      <Box sx={{ p: { xs: 2.5, md: 4, xl: 5 }, maxWidth: 1600, mx: 'auto' }}>
        
        {/* Header */}
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 4 }}>
          <Box>
            <Typography sx={{ fontSize: 32, fontWeight: 700, fontFamily: 'Georgia, serif' }}>Reports</Typography>
            <Typography sx={{ mt: 0.5, color: colors.muted, fontSize: 14.5 }}>Generate, schedule and download platform-wide reports</Typography>
          </Box>
          <Button startIcon={<AddIcon />} variant="contained" sx={{ bgcolor: colors.text, color: '#fff', borderRadius: 2.5, px: 3, py: 1.2, textTransform: 'none', fontWeight: 600 }}>
            New report
          </Button>
        </Stack>

        <Grid container spacing={4}>
          {/* Quick Reports */}
          <Grid item xs={12} lg={7}>
            <Paper sx={{ p: 4, borderRadius: 5, border: `1px solid ${colors.line}`, boxShadow: 'none' }}>
               <Typography sx={{ fontSize: 18, fontWeight: 700, mb: 4 }}>Quick reports</Typography>
               <Stack spacing={3.5}>
                  {QUICK_REPORTS.map((r, i) => (
                    <Box key={i}>
                       <Stack direction="row" spacing={2.5} alignItems="center">
                          <Box sx={{ width: 44, height: 44, borderRadius: 2.5, bgcolor: r.bgColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                             {r.icon}
                          </Box>
                          <Box sx={{ flex: 1 }}>
                             <Typography sx={{ fontSize: 14.5, fontWeight: 700 }}>{r.title}</Typography>
                             <Typography sx={{ fontSize: 12, color: colors.muted }}>{r.desc}</Typography>
                          </Box>
                          <Stack direction="row" spacing={1}>
                             <Button startIcon={<PdfIcon />} variant="outlined" size="small" sx={{ borderRadius: 1.5, textTransform: 'none', fontWeight: 600 }}>PDF</Button>
                             <Button startIcon={<ExcelIcon />} variant="outlined" size="small" sx={{ borderRadius: 1.5, textTransform: 'none', fontWeight: 600 }}>Excel</Button>
                          </Stack>
                       </Stack>
                       {i < QUICK_REPORTS.length - 1 && <Divider sx={{ mt: 3.5 }} />}
                    </Box>
                  ))}
               </Stack>
            </Paper>
          </Grid>

          {/* Scheduled Reports */}
          <Grid item xs={12} lg={5}>
            <Paper sx={{ p: 4, borderRadius: 5, border: `1px solid ${colors.line}`, boxShadow: 'none' }}>
               <Stack direction="row" justifyContent="space-between" mb={4}>
                  <Typography sx={{ fontSize: 18, fontWeight: 700 }}>Scheduled reports</Typography>
                  <Button size="small" sx={{ textTransform: 'none', color: colors.blue, fontWeight: 700 }}>+ Add schedule</Button>
               </Stack>
               <Stack spacing={3}>
                  {SCHEDULED.map((s, i) => (
                    <Box key={i} sx={{ p: 2, borderRadius: 4, border: `1px solid ${colors.line}`, bgcolor: s.status === 'Draft' ? colors.bg : 'transparent' }}>
                       <Stack direction="row" spacing={2} alignItems="flex-start">
                          <Box sx={{ mt: 0.5, p: 1, borderRadius: 1.5, bgcolor: s.color + '15' }}>{s.icon}</Box>
                          <Box sx={{ flex: 1 }}>
                             <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                                <Typography sx={{ fontSize: 14, fontWeight: 700 }}>{s.title}</Typography>
                                <Chip label={s.status} size="small" sx={{ height: 20, fontSize: 10, fontWeight: 700, bgcolor: s.status === 'Active' ? colors.greenSoft : colors.orangeSoft, color: s.status === 'Active' ? colors.green : colors.orange }} />
                             </Stack>
                             <Typography sx={{ fontSize: 11, color: colors.muted, mt: 0.8, lineHeight: 1.4 }}>{s.scheduled}</Typography>
                          </Box>
                       </Stack>
                    </Box>
                  ))}
               </Stack>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </AdminLayout>
  );
}
