import React, { useState } from 'react';
import {
  Box, Typography, Stack, Button, IconButton, Badge, Divider,
  Avatar, LinearProgress
} from '@mui/material';
import {
  NotificationsNoneRounded as BellIcon,
  AddRounded as AddIcon,
  PictureAsPdfRounded as PdfIcon,
  TableChartRounded as ExcelIcon,
  FileDownloadOutlined as DownloadIcon
} from '@mui/icons-material';
import PharmacyLayout from '../../components/PharmacyLayout';

const colors = {
  paper: '#ffffff',
  bg: '#f9f9f9',
  line: '#ebe9e0',
  soft: '#f5f1e8',
  text: '#252525',
  muted: '#6f6a62',
  green: '#26a37c',
  greenSoft: '#dff3eb',
  greenDark: '#176d57',
  amber: '#d18a1f',
  amberSoft: '#fbefdc',
  red: '#d9635b',
  redSoft: '#fdeaea',
  blue: '#4a90e2',
  blueSoft: '#e7f0fe',
  purple: '#8e44ad',
  purpleSoft: '#f4f0f9',
  graySoft: '#f1eee7'
};

const STATS = [
  { title: "Today's\nrevenue", value: '₹4,280', sub: '↑ 12% vs\nyesterday', color: colors.green },
  { title: 'This month', value: '₹92,450', sub: '↑ 8% vs last\nmonth', color: colors.blue },
  { title: 'Bills today', value: '18', sub: 'Avg ₹238 per\nbill', color: colors.amber },
  { title: 'GST\ncollected', value: '₹4,122', sub: 'March 2026', color: colors.purple }
];

const TOP_MEDS = [
  { name: 'Paracetamol 500mg', price: '₹5,952', qt: '248 strips' },
  { name: 'Amoxicillin 250mg', price: '₹4,352', qt: '136 strips' },
  { name: 'Amlodipine 5mg', price: '₹2,460', qt: '82 strips' },
  { name: 'Metformin 500mg', price: '₹1,936', qt: '88 strips' },
  { name: 'ORS Sachets', price: '₹1,480', qt: '74 packs' },
  { name: 'Vitamin C 500mg', price: '₹1,200', qt: '80 strips' }
];

const TRANSACTIONS = [
  { name: 'Ramesh Kumar', details: 'Paracetamol, Amoxicillin, ORS • 18 Mar 2026', amt: '₹428', method: 'UPI', initials: 'RK' },
  { name: 'Suresh Singh', details: 'Metformin, Glimepiride, Vitamin B12 • 23 Mar', amt: '₹312', method: 'Cash', initials: 'SS' },
  { name: 'Priya Devi', details: 'Amlodipine 5mg • 22 Mar 2026', amt: '₹90', method: 'UPI', initials: 'PD' },
  { name: 'Walk-in customer', details: 'Cetirizine 10mg, Vitamin C • 23 Mar 2026', amt: '₹145', method: 'Cash', initials: 'WI' },
  { name: 'Meera Kumari', details: 'Iron+Folic, Calcium, Vitamin D3 • 21 Mar', amt: '₹284', method: 'Credit', initials: 'MK' },
  { name: 'Walk-in customer', details: 'Paracetamol 500mg × 3 strips • 23 Mar 2026', amt: '₹72', method: 'UPI', initials: 'WI' }
];

const StatCard = ({ title, value, sub, color }) => (
  <Box sx={{ p: 2.5, borderRadius: 3, border: `1px solid ${colors.line}`, bgcolor: colors.paper, flex: '1 1 0' }}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
      <Box sx={{ width: 8, height: 8, borderRadius: 4, bgcolor: color }} />
      <Typography sx={{ fontSize: 13, color: colors.text, whiteSpace: 'pre-line', lineHeight: 1.3 }}>{title}</Typography>
    </Box>
    <Typography sx={{ fontSize: 32, fontFamily: 'Georgia, serif' }}>{value}</Typography>
    <Typography sx={{ mt: 0.5, fontSize: 12.5, color: color === colors.purple ? colors.muted : color, whiteSpace: 'pre-line', lineHeight: 1.3 }}>{sub}</Typography>
  </Box>
);

const SectionHeader = ({ title, subtitle, action }) => (
  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
    <Box>
      <Typography sx={{ fontSize: 18, lineHeight: 1.2 }}>{title}</Typography>
      {subtitle && <Typography sx={{ fontSize: 13, color: colors.muted, mt: 0.5 }}>{subtitle}</Typography>}
    </Box>
    {action && <Typography sx={{ color: colors.green, fontSize: 13.5, cursor: 'pointer' }}>{action}</Typography>}
  </Stack>
);

export default function PharmacySales() {
  const [period, setPeriod] = useState('Daily');

  return (
    <PharmacyLayout>
      <Box sx={{ p: { xs: 2.5, md: 4, xl: 5 }, maxWidth: 1400, mx: 'auto' }}>
        
        {/* Header */}
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems="flex-start" spacing={2} sx={{ mb: 4 }}>
          <Box>
            <Typography sx={{ fontSize: { xs: 32, md: 36 }, fontFamily: 'Georgia, serif', lineHeight: 1.1 }}>
              Sales & Reports
            </Typography>
            <Typography sx={{ mt: 1, color: colors.muted, fontSize: 14.5 }}>
              Revenue, billing and business insights
            </Typography>
          </Box>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box sx={{ bgcolor: colors.soft, color: '#5f5a52', borderRadius: 2.5, px: 2, py: 1, fontSize: 13, lineHeight: 1.25, textAlign: 'center' }}>
              Mon, 23<br />March<br />2026
            </Box>
            <IconButton sx={{ border: `1px solid ${colors.line}`, bgcolor: '#fff', width: 42, height: 42 }}>
              <Badge color="error" variant="dot">
                <BellIcon sx={{ color: '#5f5a52' }} />
              </Badge>
            </IconButton>
            <Button startIcon={<AddIcon />} sx={{ border: `1px solid ${colors.line}`, bgcolor: '#fff', color: colors.text, borderRadius: 2.5, px: 2, py: 1, textTransform: 'none', fontSize: 14.5, height: 42 }}>
              New bill
            </Button>
          </Stack>
        </Stack>

        {/* Stats Row */}
        <Stack direction="row" spacing={2} sx={{ mb: 4, overflowX: 'auto', pb: 1 }}>
          {STATS.map(s => <StatCard key={s.title} {...s} />)}
        </Stack>

        {/* Main Grid 1 */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 340px' }, gap: 3, mb: 3 }}>
          
          {/* Revenue Trend */}
          <Box sx={{ p: 3, borderRadius: 4, border: `1px solid ${colors.line}`, bgcolor: colors.paper }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
              <Typography sx={{ fontSize: 18 }}>Revenue trend</Typography>
              <Stack direction="row" spacing={1} sx={{ bgcolor: colors.soft, p: 0.5, borderRadius: 2 }}>
                {['Daily', 'Weekly', 'Monthly'].map(p => (
                  <Box
                    key={p}
                    onClick={() => setPeriod(p)}
                    sx={{
                      px: 2, py: 0.5, borderRadius: 1.5, fontSize: 13, cursor: 'pointer',
                      bgcolor: period === p ? colors.green : 'transparent',
                      color: period === p ? '#fff' : colors.text
                    }}
                  >
                    {p}
                  </Box>
                ))}
              </Stack>
            </Stack>

            <Box sx={{ height: 160, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', mb: 4 }}>
              {[...Array(24)].map((_, i) => (
                <Box key={i} sx={{ width: '3%', bgcolor: i === 22 ? colors.greenDark : colors.greenSoft, height: `${20 + Math.random() * 70}%`, borderRadius: '2px 2px 0 0' }} />
              ))}
            </Box>
            <Stack direction="row" justifyContent="space-between" sx={{ px: 0.5, mb: 4 }}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24].map(n => (
                <Typography key={n} sx={{ fontSize: 9, color: colors.muted }}>{n}</Typography>
              ))}
            </Stack>

            <Typography sx={{ fontSize: 13, mb: 1.5 }}>Revenue split — prescription vs walk-in</Typography>
            <Box sx={{ height: 8, borderRadius: 4, bgcolor: colors.greenSoft, position: 'relative', mb: 1.5, overflow: 'hidden' }}>
              <Box sx={{ position: 'absolute', top: 0, left: 0, height: '100%', width: '62%', bgcolor: colors.green }} />
            </Box>
            <Stack direction="row" spacing={3} sx={{ mb: 4 }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Box sx={{ width: 10, height: 10, borderRadius: 2, bgcolor: colors.green }} />
                <Typography sx={{ fontSize: 12, color: colors.muted }}>Seva prescriptions 62%</Typography>
              </Stack>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Box sx={{ width: 10, height: 10, borderRadius: 2, bgcolor: colors.greenSoft }} />
                <Typography sx={{ fontSize: 12, color: colors.muted }}>Walk-in OTC 38%</Typography>
              </Stack>
            </Stack>

            <Typography sx={{ fontSize: 13, mb: 1.5 }}>Payment mode breakdown</Typography>
            <Box sx={{ height: 8, borderRadius: 4, display: 'flex', overflow: 'hidden', mb: 1.5 }}>
              <Box sx={{ height: '100%', width: '48%', bgcolor: colors.blue }} />
              <Box sx={{ height: '100%', width: '35%', bgcolor: colors.blueSoft, borderLeft: '1px solid #fff' }} />
              <Box sx={{ height: '100%', width: '17%', bgcolor: colors.graySoft, borderLeft: '1px solid #fff' }} />
            </Box>
            <Stack direction="row" spacing={2.5}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Box sx={{ width: 10, height: 10, borderRadius: 2, bgcolor: colors.blue }} />
                <Typography sx={{ fontSize: 12, color: colors.muted }}>UPI 48%</Typography>
              </Stack>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Box sx={{ width: 10, height: 10, borderRadius: 2, bgcolor: colors.blueSoft }} />
                <Typography sx={{ fontSize: 12, color: colors.muted }}>Cash 35%</Typography>
              </Stack>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Box sx={{ width: 10, height: 10, borderRadius: 2, bgcolor: colors.graySoft }} />
                <Typography sx={{ fontSize: 12, color: colors.muted }}>Credit 17%</Typography>
              </Stack>
            </Stack>
          </Box>

          {/* Top Medicines Sold */}
          <Box sx={{ p: 3, borderRadius: 4, border: `1px solid ${colors.line}`, bgcolor: colors.paper }}>
            <SectionHeader title="Top medicines sold" subtitle="This month" />
            <Stack spacing={2.5}>
              {TOP_MEDS.map((m, i) => (
                <Box key={m.name} sx={{ display: 'flex', gap: 1.5 }}>
                  <Typography sx={{ width: 24, height: 24, borderRadius: 12, bgcolor: colors.soft, display: 'grid', placeItems: 'center', fontSize: 12, color: colors.muted, flexShrink: 0 }}>
                    {i + 1}
                  </Typography>
                  <Box sx={{ flex: 1 }}>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography sx={{ fontSize: 14 }}>{m.name}</Typography>
                      <Typography sx={{ fontSize: 13, fontWeight: 500 }}>{m.price}</Typography>
                    </Stack>
                    <Typography sx={{ fontSize: 12, color: colors.muted, textAlign: 'right' }}>{m.qt}</Typography>
                  </Box>
                </Box>
              ))}
            </Stack>
          </Box>
        </Box>

        {/* Main Grid 2 */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 340px' }, gap: 3 }}>
          
          {/* Transaction History */}
          <Box sx={{ p: 3, borderRadius: 4, border: `1px solid ${colors.line}`, bgcolor: colors.paper }}>
            <SectionHeader title="Transaction history" action="Export PDF →" />
            
            <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
              {['All', 'Prescription', 'Walk-in', 'Refunds'].map((f, i) => (
                <Box key={f} sx={{ px: 2, py: 0.6, borderRadius: 99, border: `1px solid ${colors.line}`, fontSize: 13, bgcolor: i === 0 ? colors.green : 'transparent', color: i === 0 ? '#fff' : colors.text }}>
                  {f}
                </Box>
              ))}
            </Stack>

            <Stack spacing={0}>
              {TRANSACTIONS.map((t, idx) => (
                <Box key={idx} sx={{ display: 'flex', gap: 2, py: 2, borderTop: idx !== 0 ? `1px solid ${colors.line}` : 'none' }}>
                  <Avatar sx={{ width: 40, height: 40, bgcolor: colors.soft, color: colors.muted, fontSize: 14 }}>{t.initials}</Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography sx={{ fontSize: 15 }}>{t.name}</Typography>
                      <Typography sx={{ fontSize: 14, fontWeight: 500 }}>{t.amt}</Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography sx={{ fontSize: 12.5, color: colors.muted }}>{t.details}</Typography>
                      <Box sx={{ px: 1, py: 0.2, borderRadius: 1, bgcolor: t.method === 'UPI' ? colors.greenSoft : t.method === 'Cash' ? colors.graySoft : colors.blueSoft, color: t.method === 'UPI' ? colors.greenDark : t.method === 'Cash' ? colors.text : colors.blue, fontSize: 11 }}>
                        {t.method}
                      </Box>
                    </Stack>
                  </Box>
                </Box>
              ))}
            </Stack>
          </Box>

          <Stack spacing={3}>
            {/* GST Summary */}
            <Box sx={{ p: 3, borderRadius: 4, border: `1px solid ${colors.line}`, bgcolor: colors.paper }}>
              <SectionHeader title="GST summary — March 2026" action="Download →" />
              
              <Typography sx={{ fontSize: 12, mb: 1, letterSpacing: 0.5 }}>GSTIN <b>03AABCA1234Z1Z5</b></Typography>
              
              <Stack spacing={1.5}>
                {[
                  ['Taxable sales', '₹88,328'],
                  ['CGST (6%)', '₹2,061'],
                  ['SGST (6%)', '₹2,061'],
                  ['Total GST collected', '₹4,122'],
                  ['Exempt (Jan Aushadhi)', '₹4,122']
                ].map(([label, val], i) => (
                  <Stack key={label} direction="row" justifyContent="space-between" sx={{ pt: 1, borderTop: i === 3 ? `1px solid ${colors.line}` : 'none' }}>
                    <Typography sx={{ fontSize: 13, color: colors.muted }}>{label}</Typography>
                    <Typography sx={{ fontSize: 13.5, fontWeight: i >= 3 ? 600 : 400 }}>{val}</Typography>
                  </Stack>
                ))}
              </Stack>

              <Stack direction="row" spacing={1.5} sx={{ mt: 3 }}>
                <Button fullWidth sx={{ bgcolor: colors.green, color: '#fff', fontSize: 12.5, textTransform: 'none', py: 1, borderRadius: 2, '&:hover': { bgcolor: colors.greenDark } }}>
                  Export GSTR-1
                </Button>
                <Button fullWidth sx={{ border: `1px solid ${colors.line}`, color: colors.text, fontSize: 12.5, textTransform: 'none', py: 1, borderRadius: 2 }}>
                  Export Excel
                </Button>
              </Stack>
            </Box>

            {/* Quick Reports */}
            <Box sx={{ p: 3, borderRadius: 4, border: `1px solid ${colors.line}`, bgcolor: colors.paper }}>
              <Typography sxSection={{ fontSize: 16, mb: 2 }}>Quick reports</Typography>
              <Stack spacing={1.5}>
                {[
                  ['Daily sales report', 'PDF'],
                  ['Monthly stock statement', 'Excel'],
                  ['Prescription dispensing log', 'PDF'],
                  ['Purchase vs sales statement', 'Excel']
                ].map(([label, type]) => (
                  <Box key={label} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1.5, borderRadius: 2, bgcolor: colors.soft }}>
                    <Typography sx={{ fontSize: 13, lineHeight: 1.2 }}>{label}</Typography>
                    <Typography sx={{ fontSize: 11, color: colors.green, fontWeight: 600, textAlign: 'right', cursor: 'pointer' }}>{type} →</Typography>
                  </Box>
                ))}
              </Stack>
            </Box>
          </Stack>
        </Box>
      </Box>
    </PharmacyLayout>
  );
}
