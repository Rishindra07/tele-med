import React, { useState } from 'react';
import {
  Box, Typography, Stack, Button, IconButton, Badge, Divider,
  Grid, Paper, Avatar, TextField, InputAdornment, MenuItem, Chip,
} from '@mui/material';
import {
  SearchRounded as SearchIcon,
  NotificationsNoneRounded as BellIcon,
  FileDownloadRounded as ExportIcon,
  FilterListRounded as FilterIcon,
  ReportProblemRounded as AlertIcon,
  KeyboardArrowRightRounded as ArrowIcon,
  MoreVertRounded as MenuIcon,
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
  { label: 'Total registered', val: '12,482', change: '+284', up: true, sub: 'this week', color: colors.green },
  { label: 'Aadhaar verified', val: '9,841', change: '78.8%', sub: 'of total', color: colors.blue },
  { label: 'Active this month', val: '8,240', change: '66%', sub: 'active rate', color: colors.orange },
  { label: 'Flagged accounts', val: '14', change: 'Needs review', sub: 'Risk: High', color: colors.red }
];

const FILTER_PILLS = [
  { label: 'All', count: '12,482', active: true },
  { label: 'Verified', count: '9,841' },
  { label: 'Unverified', count: '2,641' },
  { label: 'Active', count: '8,240' },
  { label: 'Inactive', count: '4,242' },
  { label: 'Flagged', count: '14' },
  { label: 'New this week', count: '284' }
];

const PATIENTS = [
  { name: 'Ramesh Kumar', phone: '+91 98140-55872', id: 'SVT-2024-00482', location: 'Hoshiarpur, PB', avatar: 'RK' },
  { name: 'Priya Devi', phone: '+91 97300-44128', id: 'SVT-2024-00391', location: 'Ludhiana, PB', avatar: 'PD' },
  { name: 'Suresh Singh', phone: '+91 99100-87654', id: 'SVT-2024-00519', location: 'Amritsar, PB', avatar: 'SS' },
  { name: 'Meera Kumari', phone: '+91 98200-33411', id: 'SVT-2024-00388', location: 'Kanpur, UP', avatar: 'MK' },
  { name: 'Unknown Patient', phone: '+91 80000-00000', id: 'SVT-2024-04821', location: '—', avatar: 'UK' },
  { name: 'Ajay Kumar', phone: '+91 97100-22134', id: 'SVT-2024-00344', location: 'Jaipur, RJ', avatar: 'AK' }
];

const DEMOGRAPHICS = [
  { label: 'Avg age', val: '38.4 years' },
  { label: 'Male / Female', val: '54% / 46%' },
  { label: 'Rural patients', val: '71%' },
  { label: 'Urban patients', val: '29%' },
  { label: 'Aadhaar linked', val: '78.8%' },
  { label: 'Avg consultations', val: '4.2 / patient' }
];

const TOP_CONDITIONS = [
  { name: 'Hypertension', count: '34%' },
  { name: 'Diabetes', count: '24%' },
  { name: 'Respiratory', count: '18%' },
  { name: 'Prenatal care', count: '12%' },
  { name: 'General / OPD', count: '12%' }
];

const FLAGGED_DETAILS = [
  { id: 'SVT-2024-04821', reason: '48 duplicate prescriptions in 2 days', desc: 'Suspected bot / spam - Suspend recommended', color: colors.red },
  { id: 'SVT-2024-09018', reason: 'Abusive chat messages', desc: '3 doctor complaints - Suspend recommended', color: colors.red },
  { id: 'SVT-2024-07312', reason: '5 failed payment attempts', desc: 'Possible fraudulent card - Review', color: colors.orange }
];

export default function AdminPatients() {
  return (
    <AdminLayout>
      <Box sx={{ p: { xs: 2.5, md: 4, xl: 5 }, maxWidth: 1600, mx: 'auto' }}>
        
        {/* Header */}
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems="flex-start" spacing={2} sx={{ mb: 4 }}>
          <Box>
            <Typography sx={{ fontSize: 32, fontWeight: 700, fontFamily: 'Georgia, serif' }}>
              Patients
            </Typography>
            <Typography sx={{ mt: 0.5, color: colors.muted, fontSize: 14.5 }}>
              Full patient registry — 12,482 registered across India
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
              Export CSV
            </Button>
          </Stack>
        </Stack>

        {/* Metrics Cards */}
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
                    {stat.up ? '↑' : ''} {stat.change}
                  </Typography>
                  <Typography sx={{ fontSize: 12, color: colors.muted }}>{stat.sub}</Typography>
                </Stack>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* Filters and Table Section */}
        <Grid container spacing={4}>
          <Grid item xs={12} lg={8.5}>
            <Paper sx={{ p: 0, borderRadius: 5, border: `1px solid ${colors.line}`, boxShadow: 'none', overflow: 'hidden' }}>
              
              {/* Filter Bar */}
              <Box sx={{ p: 3, bgcolor: '#fff', borderBottom: `1px solid ${colors.line}` }}>
                <Stack spacing={2}>
                  <Stack direction="row" spacing={2}>
                    <TextField
                      placeholder="Search patient name, SVT ID, or phone..."
                      fullWidth
                      size="small"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon sx={{ color: colors.muted, fontSize: 20 }} />
                          </InputAdornment>
                        ),
                        sx: { borderRadius: 2.5, bgcolor: colors.soft, '& fieldset': { border: 'none' } }
                      }}
                    />
                    <TextField select size="small" defaultValue="All states" sx={{ minWidth: 140, '& fieldset': { borderRadius: 2.5, borderColor: colors.line } }}>
                       <MenuItem value="All states">All states</MenuItem>
                    </TextField>
                    <TextField select size="small" defaultValue="All conditions" sx={{ minWidth: 160, '& fieldset': { borderRadius: 2.5, borderColor: colors.line } }}>
                       <MenuItem value="All conditions">All conditions</MenuItem>
                    </TextField>
                    <TextField select size="small" defaultValue="Sort: Newest" sx={{ minWidth: 140, '& fieldset': { borderRadius: 2.5, borderColor: colors.line } }}>
                       <MenuItem value="Sort: Newest">Sort: Newest</MenuItem>
                    </TextField>
                  </Stack>

                  <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                     {FILTER_PILLS.map(p => (
                        <Chip
                          key={p.label}
                          label={`${p.label} ${p.count}`}
                          onClick={() => {}}
                          sx={{ 
                            borderRadius: 2, height: 32, fontSize: 13, fontWeight: 600,
                            bgcolor: p.active ? colors.green : 'transparent',
                            color: p.active ? '#fff' : colors.muted,
                            border: p.active ? 'none' : `1px solid ${colors.line}`,
                            '&:hover': { bgcolor: p.active ? colors.green : colors.soft }
                          }}
                        />
                     ))}
                  </Stack>
                </Stack>
              </Box>

              {/* Patient Registry List */}
              <Box>
                <Box sx={{ px: 3, py: 2, bgcolor: colors.soft, display: 'flex', alignItems: 'center' }}>
                   <Typography sx={{ fontSize: 12, fontWeight: 700, color: colors.muted, width: '40%' }}>Patient</Typography>
                   <Typography sx={{ fontSize: 12, fontWeight: 700, color: colors.muted, width: '20%' }}>ID</Typography>
                   <Typography sx={{ fontSize: 12, fontWeight: 700, color: colors.muted, width: '30%' }}>Location</Typography>
                   <Box sx={{ flex: 1, textAlign: 'right' }}>
                      <Button size="small" sx={{ textTransform: 'none', fontWeight: 700, color: colors.green }}>Download all →</Button>
                   </Box>
                </Box>
                
                {PATIENTS.map((p, i) => (
                  <Box key={i} sx={{ px: 3, py: 2.5, display: 'flex', alignItems: 'center', borderBottom: i === PATIENTS.length - 1 ? 'none' : `1px solid ${colors.line}` }}>
                     <Stack direction="row" spacing={2} sx={{ width: '40%' }}>
                        <Avatar sx={{ bgcolor: colors.blueSoft, color: colors.blue, fontWeight: 700, fontSize: 13 }}>{p.avatar}</Avatar>
                        <Box>
                           <Typography sx={{ fontSize: 14, fontWeight: 700 }}>{p.name}</Typography>
                           <Typography sx={{ fontSize: 12, color: colors.muted }}>{p.phone}</Typography>
                        </Box>
                     </Stack>
                     <Typography sx={{ fontSize: 13, fontWeight: 600, color: colors.text, width: '20%' }}>{p.id}</Typography>
                     <Typography sx={{ fontSize: 13, color: colors.muted, width: '30%' }}>{p.location}</Typography>
                     <IconButton size="small"><MenuIcon sx={{ fontSize: 18, color: colors.muted }} /></IconButton>
                  </Box>
                ))}
              </Box>
            </Paper>
          </Grid>

          {/* Sidebar Insights Section */}
          <Grid item xs={12} lg={3.5}>
            <Stack spacing={4}>
              <Paper sx={{ p: 3, borderRadius: 5, border: `1px solid ${colors.line}`, boxShadow: 'none' }}>
                <Typography sx={{ fontSize: 16, fontWeight: 700, mb: 3 }}>Patient demographics</Typography>
                <Stack spacing={2.5}>
                   {DEMOGRAPHICS.map((d, i) => (
                     <Stack key={i} direction="row" justifyContent="space-between" alignItems="center">
                        <Typography sx={{ fontSize: 13.5, color: colors.muted, fontWeight: 500 }}>{d.label}</Typography>
                        <Typography sx={{ fontSize: 14, fontWeight: 700 }}>{d.val}</Typography>
                     </Stack>
                   ))}
                </Stack>
              </Paper>

              <Paper sx={{ p: 3, borderRadius: 5, border: `1px solid ${colors.line}`, boxShadow: 'none' }}>
                <Typography sx={{ fontSize: 16, fontWeight: 700, mb: 3 }}>Top conditions</Typography>
                <Stack spacing={2.5}>
                   {TOP_CONDITIONS.map((c, i) => (
                     <Stack key={i} spacing={1}>
                        <Stack direction="row" justifyContent="space-between">
                           <Typography sx={{ fontSize: 13, fontWeight: 600 }}>{c.name}</Typography>
                           <Typography sx={{ fontSize: 13, color: colors.muted }}>{c.count}</Typography>
                        </Stack>
                        <Box sx={{ height: 4, bgcolor: colors.soft, borderRadius: 2, overflow: 'hidden' }}>
                           <Box sx={{ width: c.count, height: '100%', bgcolor: colors.blue }} />
                        </Box>
                     </Stack>
                   ))}
                </Stack>
              </Paper>

              <Paper sx={{ p: 3, borderRadius: 5, border: `1px solid ${colors.line}`, boxShadow: 'none' }}>
                <Typography sx={{ fontSize: 16, fontWeight: 700, mb: 1.5 }}>Flagged accounts <Typography component="span" sx={{ fontSize: 12, color: colors.red, fontWeight: 700, float: 'right' }}>14 pending</Typography></Typography>
                <Stack spacing={2}>
                   {FLAGGED_DETAILS.map((f, i) => (
                     <Box key={i} sx={{ p: 1.5, borderRadius: 3, border: `1px solid ${colors.line}`, borderLeft: `4px solid ${f.color}` }}>
                        <Typography sx={{ fontSize: 13, fontWeight: 700 }}>{f.id}</Typography>
                        <Typography sx={{ fontSize: 12, fontWeight: 600, color: f.color, mt: 0.5 }}>{f.reason}</Typography>
                        <Typography sx={{ fontSize: 11, color: colors.muted, mt: 0.2 }}>{f.desc}</Typography>
                     </Box>
                   ))}
                </Stack>
                <Button fullWidth variant="contained" sx={{ mt: 3, bgcolor: '#16a34a', color: '#fff', textTransform: 'none', borderRadius: 2, fontWeight: 600, py: 1.2, '&:hover': { bgcolor: '#12823c' } }}>
                   Review all flagged accounts
                </Button>
              </Paper>
            </Stack>
          </Grid>
        </Grid>
      </Box>
    </AdminLayout>
  );
}
