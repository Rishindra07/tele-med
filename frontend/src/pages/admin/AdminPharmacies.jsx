import React from 'react';
import {
  Box, Typography, Stack, Button, IconButton, Badge, Divider,
  Grid, Paper, Avatar, LinearProgress, Chip,
} from '@mui/material';
import {
  NotificationsNoneRounded as BellIcon,
  AddRounded as AddIcon,
  VerifiedRounded as VerifiedIcon,
  LocalPharmacyRounded as PharmacyIcon,
  KeyboardArrowRightRounded as ArrowIcon,
  MoreVertRounded as MenuIcon,
  MapRounded as MapIcon,
  GraphicEqRounded as StatsIcon,
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
  { label: 'Total pharmacies', val: '891', change: '+12', up: true, sub: 'this month', color: colors.blue },
  { label: 'Jan Aushadhi', val: '312', change: '35%', sub: 'of network', color: colors.green },
  { label: 'Pending verification', val: '23', change: 'Drug license pending', sub: 'Risk: Med', color: colors.orange },
  { label: 'Avg Rx fulfilment', val: '87%', change: 'Platform-wide', sub: 'Target: 95%', color: colors.blue }
];

const PHARMACIES = [
  { name: 'Apollo Medical Store', id: 'SVT-PHM-9121', location: 'Ahmedabad, GJ', type: 'Jan Aushadhi', typeColor: '#eff6ff', typeText: '#2563eb', fulfilment: '88%', stock: '6/5' },
  { name: 'Singla Pharma', id: 'SVT-PHM-2232', location: 'Ludhiana, PB', type: 'General', typeColor: colors.soft, typeText: colors.muted, fulfilment: '72%', stock: '2/5' },
  { name: 'Raj Medicos', id: 'SVT-PHM-3124', location: 'Amritsar, PB', type: 'General', typeColor: colors.soft, typeText: colors.muted, fulfilment: '44%', stock: '1/5' },
  { name: 'Shiv Medical Centre', id: 'SVT-PHM-8123', location: 'Jaipur, RJ', type: 'Hospital', typeColor: '#eff6ff', typeText: '#2563eb', fulfilment: '95%', stock: '5/5' },
  { name: 'Sharma Medical', id: 'SVT-PHM-2220', location: 'Jaipur, RJ', type: 'General', typeColor: colors.soft, typeText: colors.muted, fulfilment: '—', stock: '—', status: 'Pending' }
];

const NETWORK_STATS = [
  { label: 'Avg Rx fulfilment', val: '87%' },
  { label: '24-hour pharmacies', val: '142' },
  { label: 'Jan Aushadhi share', val: '35%' },
  { label: 'Coverage gap districts', val: '12' },
  { label: 'Avg distance to patient', val: '2.4 km' }
];

export default function AdminPharmacies() {
  return (
    <AdminLayout>
      <Box sx={{ p: { xs: 2.5, md: 4, xl: 5 }, maxWidth: 1600, mx: 'auto' }}>
        
        {/* Header */}
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems="flex-start" spacing={2} sx={{ mb: 4 }}>
          <Box>
            <Typography sx={{ fontSize: 32, fontWeight: 700, fontFamily: 'Georgia, serif' }}>
              Pharmacies
            </Typography>
            <Typography sx={{ mt: 0.5, color: colors.muted, fontSize: 14.5 }}>
               181 pharmacies connected to Seva Telehealth across India
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
              Register pharmacy
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

        {/* Pharmacy Registry and Map Section */}
        <Grid container spacing={4}>
          <Grid item xs={12} lg={8}>
            <Paper sx={{ p: 0, borderRadius: 5, border: `1px solid ${colors.line}`, boxShadow: 'none', overflow: 'hidden' }}>
              <Box sx={{ p: 4, borderBottom: `1px solid ${colors.line}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                 <Typography sx={{ fontSize: 18, fontWeight: 700 }}>Pharmacy registry</Typography>
                 <Button size="small" endIcon={<ArrowIcon sx={{ fontSize: 14 }} />} sx={{ textTransform: 'none', color: colors.green }}>Export list</Button>
              </Box>
              
              <Box sx={{ px: 4, py: 2, borderBottom: `1px solid ${colors.line}` }}>
                 <Stack direction="row" spacing={1}>
                    {['All 891', 'Verified', 'Jan Aushadhi', 'Pending', 'Inactive'].map(f => (
                       <Chip key={f} label={f} size="small" sx={{ borderRadius: 1.5, height: 28, fontSize: 12, bgcolor: f === 'All 891' ? colors.green : colors.soft, color: f === 'All 891' ? '#fff' : colors.muted }} />
                    ))}
                 </Stack>
              </Box>

              <Box sx={{ px: 3, py: 2, bgcolor: colors.soft, display: 'flex' }}>
                 <Typography sx={{ fontSize: 12, fontWeight: 700, color: colors.muted, width: '25%' }}>Pharmacy</Typography>
                 <Typography sx={{ fontSize: 12, fontWeight: 700, color: colors.muted, width: '20%' }}>Location</Typography>
                 <Typography sx={{ fontSize: 12, fontWeight: 700, color: colors.muted, width: '15%' }}>Type</Typography>
                 <Typography sx={{ fontSize: 12, fontWeight: 700, color: colors.muted, width: '15%' }}>Fulfilled</Typography>
                 <Typography sx={{ fontSize: 12, fontWeight: 700, color: colors.muted, width: '10%' }}>Stock status</Typography>
                 <Typography sx={{ fontSize: 12, fontWeight: 700, color: colors.muted, width: '15%', textAlign: 'right' }}>Actions</Typography>
              </Box>

              {PHARMACIES.map((p, i) => (
                <Box key={i} sx={{ px: 3, py: 3, display: 'flex', alignItems: 'center', borderBottom: i === PHARMACIES.length - 1 ? 'none' : `1px solid ${colors.line}` }}>
                   <Box sx={{ width: '25%' }}>
                      <Typography sx={{ fontSize: 14, fontWeight: 700 }}>{p.name}</Typography>
                      <Typography sx={{ fontSize: 11, color: colors.muted }}>{p.id}</Typography>
                   </Box>
                   <Typography sx={{ fontSize: 13, color: colors.muted, width: '20%' }}>{p.location}</Typography>
                   <Box sx={{ width: '15%' }}>
                      <Chip label={p.type} size="small" sx={{ height: 22, fontSize: 10, fontWeight: 700, bgcolor: p.typeColor, color: p.typeText }} />
                   </Box>
                   <Typography sx={{ fontSize: 13, fontWeight: 600, width: '15%', color: p.fulfilment.includes('44') ? colors.red : colors.text }}>{p.fulfilment}</Typography>
                   <Typography sx={{ fontSize: 13, width: '10%' }}>{p.stock}</Typography>
                   <Box sx={{ width: '15%', textAlign: 'right' }}>
                      {p.status === 'Pending' ? (
                        <Button variant="outlined" size="small" sx={{ borderRadius: 1.5, textTransform: 'none', fontSize: 12 }}>Verify</Button>
                      ) : p.fulfilment.includes('44') ? (
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                           <Chip label="Flagged" size="small" sx={{ height: 20, bgcolor: colors.redSoft, color: colors.red, fontSize: 9, fontWeight: 700 }} />
                           <Button variant="outlined" color="error" size="small" sx={{ borderRadius: 1.5, textTransform: 'none', fontSize: 12 }}>Suspend</Button>
                        </Stack>
                      ) : (
                        <Button variant="outlined" size="small" sx={{ borderRadius: 1.5, textTransform: 'none', fontSize: 12 }}>View</Button>
                      )}
                   </Box>
                </Box>
              ))}
            </Paper>
          </Grid>

          <Grid item xs={12} lg={4}>
             <Stack spacing={4}>
                <Paper sx={{ p: 4, borderRadius: 5, border: `1px solid ${colors.line}`, boxShadow: 'none' }}>
                   <Typography sx={{ fontSize: 16, fontWeight: 700, mb: 3 }}>Geographic coverage</Typography>
                   <Box sx={{ height: 180, bgcolor: colors.soft, borderRadius: 4, position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <MapIcon sx={{ fontSize: 80, color: colors.muted, opacity: 0.2 }} />
                      {/* Dots representation */}
                      {[1,2,3,4,5,6].map(d => (
                         <Box key={d} sx={{ 
                           position: 'absolute', width: 10, height: 10, borderRadius: '50%', bgcolor: colors.green,
                           top: d*20, left: d*30 
                         }} />
                      ))}
                      <Box sx={{ position: 'absolute', bottom: 12, left: 12, right: 12, display: 'flex', justifyContent: 'space-between' }}>
                         <Stack direction="row" spacing={1} alignItems="center">
                            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: colors.green }} />
                            <Typography sx={{ fontSize: 9, fontWeight: 700 }}>Rich density</Typography>
                         </Stack>
                         <Stack direction="row" spacing={1} alignItems="center">
                            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: colors.orange }} />
                            <Typography sx={{ fontSize: 9, fontWeight: 700 }}>Coverage gap</Typography>
                         </Stack>
                      </Box>
                   </Box>
                </Paper>

                <Paper sx={{ p: 4, borderRadius: 5, border: `1px solid ${colors.line}`, boxShadow: 'none' }}>
                   <Typography sx={{ fontSize: 16, fontWeight: 700, mb: 3 }}>Network state</Typography>
                   <Stack spacing={2.5}>
                      {NETWORK_STATS.map((s, i) => (
                        <Stack key={i} direction="row" justifyContent="space-between" alignItems="center">
                           <Typography sx={{ fontSize: 13.5, color: colors.muted, fontWeight: 500 }}>{s.label}</Typography>
                           <Typography sx={{ fontSize: 14, fontWeight: 700 }}>{s.val}</Typography>
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
