import React from 'react';
import {
  Box, Typography, Stack, Button, IconButton, Badge, Divider,
  Grid, Paper, Avatar, LinearProgress, Chip, Alert,
} from '@mui/material';
import {
  NotificationsNoneRounded as BellIcon,
  AttachMoneyRounded as MoneyIcon,
  CreditCardRounded as PayoutIcon,
  ReceiptLongRounded as LedgerIcon,
  FileDownloadRounded as ExportIcon,
  TrendingUpRounded as GrowthIcon,
  WarningRounded as WarningIcon,
  MoreVertRounded as MoreIcon,
  ArrowUpwardRounded as UpIcon,
  ArrowDownwardRounded as DownIcon,
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
  glass: 'rgba(255, 255, 255, 0.7)',
};

const STATS = [
  { label: 'Revenue — March', val: '₹42.8L', change: '+18.4%', trend: 'up', icon: <MoneyIcon />, color: colors.green },
  { label: 'Doctor Payouts', val: '₹18.4L', change: '142 Doctors', trend: 'neutral', icon: <PayoutIcon />, color: colors.blue },
  { label: 'Platform Fees', val: '₹6.2L', change: '+12.5%', trend: 'up', icon: <LedgerIcon />, color: colors.orange },
  { label: 'GST Collected', val: '₹4.8L', change: 'Due 20 Mar', trend: 'warning', icon: <WarningIcon />, color: colors.red }
];

const PAYOUTS = [
  { party: 'Dr. Priya Sharma', amount: '₹12,400', date: '22 Mar', status: 'Paid', color: colors.green },
  { party: 'Dr. Manish Rao', amount: '₹8,800', date: '22 Mar', status: 'Paid', color: colors.green },
  { party: 'Dr. Vikram Jha', amount: '₹3,200', date: '21 Mar', status: 'Flagged', color: colors.red },
  { party: 'Dr. Ananya Iyer', amount: '₹15,100', date: '20 Mar', status: 'Paid', color: colors.green },
  { party: 'Dr. Rahul Verma', amount: '₹6,400', date: '20 Mar', status: 'Pending', color: colors.orange }
];

const BREAKDOWN = [
  { label: 'Consultation fees', val: '₹32.5L', perc: 75, color: colors.blue },
  { label: 'Prescription fees', val: '₹5.1L', perc: 15, color: colors.green },
  { label: 'Pharmacy commissions', val: '₹4.4L', perc: 10, color: colors.orange }
];

const GST = [
  { label: 'Taxable turnover', val: '₹38.2L' },
  { label: 'CGST (9%)', val: '₹2.4L' },
  { label: 'SGST (9%)', val: '₹2.4L' },
  { label: 'GSTR-1 Due', val: '20 MAY 2026' }
];

const RevenueChart = () => (
  <Box sx={{ width: '100%', height: 200, mt: 4, position: 'relative' }}>
    <svg width="100%" height="100%" viewBox="0 0 1000 300" preserveAspectRatio="none">
      <defs>
        <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={colors.blue} stopOpacity="0.2" />
          <stop offset="100%" stopColor={colors.blue} stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Grid Lines */}
      {[0, 1, 2, 3].map(i => (
        <line key={i} x1="0" y1={i * 100} x2="1000" y2={i * 100} stroke={colors.line} strokeWidth="1" strokeDasharray="5,5" />
      ))}
      {/* Area */}
      <path
        d="M0,250 Q100,200 200,220 T400,150 T600,100 T800,120 T1000,50 L1000,300 L0,300 Z"
        fill="url(#chartGradient)"
      />
      {/* Line */}
      <path
        d="M0,250 Q100,200 200,220 T400,150 T600,100 T800,120 T1000,50"
        fill="none"
        stroke={colors.blue}
        strokeWidth="3"
        strokeLinecap="round"
      />
      {/* Data Points */}
      <circle cx="200" cy="220" r="5" fill={colors.blue} stroke="#fff" strokeWidth="2" />
      <circle cx="400" cy="150" r="5" fill={colors.blue} stroke="#fff" strokeWidth="2" />
      <circle cx="600" cy="100" r="5" fill={colors.blue} stroke="#fff" strokeWidth="2" />
      <circle cx="1000" cy="50" r="5" fill={colors.blue} stroke="#fff" strokeWidth="2" />
    </svg>
    <Stack direction="row" justifyContent="space-between" sx={{ mt: 1, px: 1 }}>
      {['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'].map(m => (
        <Typography key={m} sx={{ fontSize: 10, fontWeight: 700, color: colors.muted }}>{m}</Typography>
      ))}
    </Stack>
  </Box>
);

export default function AdminFinancials() {
  return (
    <AdminLayout>
      <Box sx={{ p: { xs: 2.5, md: 4, xl: 5 }, maxWidth: 1600, mx: 'auto' }}>
        
        {/* Header */}
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 4 }}>
          <Box>
            <Typography sx={{ fontSize: 32, fontWeight: 800, fontFamily: 'Georgia, serif', letterSpacing: '-0.5px' }}>Financial</Typography>
            <Typography sx={{ mt: 0.5, color: colors.muted, fontSize: 14.5, fontWeight: 500 }}>Platform revenue, partner payouts and tax management</Typography>
          </Box>
          <Button 
            startIcon={<ExportIcon />} 
            variant="contained" 
            sx={{ 
              bgcolor: colors.text, 
              color: '#fff', 
              borderRadius: 3, 
              px: 3, 
              py: 1.2, 
              textTransform: 'none', 
              fontWeight: 700,
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              '&:hover': { bgcolor: '#000' }
            }}
          >
            Export accounts
          </Button>
        </Stack>

        <Alert 
          icon={<WarningIcon sx={{ color: colors.red }} />} 
          sx={{ 
            mb: 4, 
            borderRadius: 4, 
            bgcolor: colors.redSoft, 
            border: `1px solid ${colors.red}15`, 
            color: colors.red, 
            fontWeight: 700,
            fontSize: 14,
            py: 1.5
          }}
        >
          2 alerts — ₹1.2L delay from 22 Mar - Payout to Dr. Vikram Jha [Flagged account]
        </Alert>

        {/* Metrics Grid */}
        <Grid container spacing={2.5} sx={{ mb: 5 }}>
          {STATS.map((stat, i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Paper 
                sx={{ 
                  p: 3, 
                  borderRadius: 5, 
                  border: `1px solid ${colors.line}`, 
                  boxShadow: 'none',
                  position: 'relative',
                  overflow: 'hidden',
                  background: 'linear-gradient(135deg, #ffffff 0%, #fdfdfd 100%)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 24px rgba(0,0,0,0.03)'
                  }
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box sx={{ p: 1, borderRadius: 2, bgcolor: stat.color + '10', color: stat.color }}>
                    {React.cloneElement(stat.icon, { sx: { fontSize: 20 } })}
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, bgcolor: stat.trend === 'up' ? colors.greenSoft : stat.trend === 'warning' ? colors.redSoft : colors.soft, px: 1, py: 0.4, borderRadius: 1.5 }}>
                    {stat.trend === 'up' ? <UpIcon sx={{ fontSize: 12, color: colors.green }} /> : stat.trend === 'warning' ? <WarningIcon sx={{ fontSize: 12, color: colors.red }} /> : null}
                    <Typography sx={{ fontSize: 10, fontWeight: 800, color: stat.trend === 'up' ? colors.green : stat.trend === 'warning' ? colors.red : colors.muted }}>
                      {stat.change}
                    </Typography>
                  </Box>
                </Box>
                <Typography sx={{ fontSize: 13, color: colors.muted, fontWeight: 700, mb: 0.5 }}>{stat.label}</Typography>
                <Typography sx={{ fontSize: 28, fontWeight: 900 }}>{stat.val}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={4}>
          {/* Revenue Growth Chart */}
          <Grid item xs={12} lg={8}>
            <Paper 
              sx={{ 
                p: 4, 
                borderRadius: 6, 
                border: `1px solid ${colors.line}`, 
                boxShadow: 'none',
                background: colors.paper,
                height: '100%'
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                <Box>
                  <Typography sx={{ fontSize: 20, fontWeight: 800 }}>Revenue Growth</Typography>
                  <Typography sx={{ fontSize: 13, color: colors.muted, mt: 0.5 }}>↑ 12.4% vs last month performance</Typography>
                </Box>
                <Stack direction="row" spacing={1}>
                  {['1W', '1M', '3M', '1Y'].map(t => (
                    <Button key={t} size="small" sx={{ minWidth: 0, px: 2, borderRadius: 2, fontSize: 11, fontWeight: 800, color: t === '1M' ? colors.blue : colors.muted, bgcolor: t === '1M' ? colors.blueSoft : 'transparent' }}>
                      {t}
                    </Button>
                  ))}
                </Stack>
              </Stack>
              <RevenueChart />
              
              <Divider sx={{ my: 4 }} />
              
              <Typography sx={{ fontSize: 16, fontWeight: 800, mb: 3 }}>Recent Payouts</Typography>
              <Stack spacing={2}>
                {PAYOUTS.map((p, i) => (
                  <Box key={i} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, borderRadius: 3, border: `1px solid ${colors.line}`, '&:hover': { bgcolor: colors.soft + '50' } }}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar sx={{ width: 36, height: 36, bgcolor: p.color + '15', color: p.color, fontWeight: 800, fontSize: 12 }}>
                        {p.party.split(' ').map(n => n[0]).join('')}
                      </Avatar>
                      <Box>
                        <Typography sx={{ fontSize: 14, fontWeight: 700 }}>{p.party}</Typography>
                        <Typography sx={{ fontSize: 11, color: colors.muted }}>{p.date} • NEFT Payout</Typography>
                      </Box>
                    </Stack>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography sx={{ fontSize: 14, fontWeight: 900 }}>{p.amount}</Typography>
                      <Typography sx={{ fontSize: 10, fontWeight: 800, color: p.color === colors.green ? colors.green : p.color === colors.red ? colors.red : colors.orange }}>
                        ● {p.status}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Stack>
              <Button fullWidth sx={{ mt: 3, pt: 1.5, color: colors.blue, fontWeight: 700, textTransform: 'none', borderTop: `1px solid ${colors.line}`, borderRadius: 0 }}>
                View all transactions
              </Button>
            </Paper>
          </Grid>

          {/* Sidebar Stats */}
          <Grid item xs={12} lg={4}>
             <Stack spacing={4}>
                {/* GST Summary */}
                <Paper 
                  sx={{ 
                    p: 4, 
                    borderRadius: 6, 
                    border: `1px solid ${colors.line}`, 
                    boxShadow: 'none',
                    bgcolor: '#fff'
                  }}
                >
                   <Stack direction="row" justifyContent="space-between" mb={4}>
                      <Typography sx={{ fontSize: 18, fontWeight: 800 }}>GST summary — March</Typography>
                      <IconButton size="small"><MoreIcon sx={{ fontSize: 18 }} /></IconButton>
                   </Stack>
                   <Stack spacing={2.5}>
                      {GST.map((g, i) => (
                        <Stack key={i} direction="row" justifyContent="space-between" alignItems="center">
                           <Typography sx={{ fontSize: 14, color: colors.muted, fontWeight: 500 }}>{g.label}</Typography>
                           <Typography sx={{ fontSize: 15, fontWeight: 800 }}>{g.val}</Typography>
                        </Stack>
                      ))}
                   </Stack>
                   <Button 
                    fullWidth 
                    variant="contained" 
                    sx={{ 
                      mt: 4, 
                      bgcolor: colors.green, 
                      color: '#fff', 
                      borderRadius: 3, 
                      py: 1.5, 
                      fontWeight: 700, 
                      textTransform: 'none',
                      boxShadow: '0 4px 12px rgba(22, 163, 74, 0.2)'
                    }}
                  >
                      File GSTR-1
                   </Button>
                </Paper>

                {/* Revenue Breakdown */}
                <Paper 
                  sx={{ 
                    p: 4, 
                    borderRadius: 6, 
                    border: `1px solid ${colors.line}`, 
                    boxShadow: 'none',
                    background: 'linear-gradient(180deg, #fff 0%, #fcfbf7 100%)'
                  }}
                >
                   <Typography sx={{ fontSize: 18, fontWeight: 800, mb: 4 }}>Revenue breakdown</Typography>
                   <Stack spacing={3.5}>
                      {BREAKDOWN.map((b, i) => (
                        <Stack key={i} spacing={1.5}>
                           <Stack direction="row" justifyContent="space-between" alignItems="center">
                              <Stack direction="row" spacing={1.5} alignItems="center">
                                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: b.color }} />
                                <Typography sx={{ fontSize: 14, fontWeight: 700 }}>{b.label}</Typography>
                              </Stack>
                              <Typography sx={{ fontSize: 14, fontWeight: 800 }}>{b.val}</Typography>
                           </Stack>
                           <Box sx={{ height: 8, bgcolor: colors.soft, borderRadius: 4, overflow: 'hidden' }}>
                              <Box sx={{ width: `${b.perc}%`, height: '100%', bgcolor: b.color, borderRadius: 4 }} />
                           </Box>
                        </Stack>
                      ))}
                   </Stack>
                   <Box sx={{ mt: 5, p: 3, borderRadius: 4, bgcolor: colors.blueSoft, border: `1px solid ${colors.blue}10` }}>
                      <Typography sx={{ fontSize: 13, color: colors.blue, fontWeight: 700, mb: 1 }}>Performance Insight</Typography>
                      <Typography sx={{ fontSize: 13, color: colors.muted, lineHeight: 1.5 }}>
                        Consultation fees are up by <strong>22%</strong> compared to last year, contributing to 75% of total revenue.
                      </Typography>
                   </Box>
                </Paper>
             </Stack>
          </Grid>
        </Grid>
      </Box>
    </AdminLayout>
  );
}
