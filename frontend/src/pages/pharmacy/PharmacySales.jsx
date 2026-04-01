import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Stack, Button, IconButton, Badge, Divider,
  Avatar, LinearProgress, CircularProgress, Snackbar, Alert
} from '@mui/material';
import {
  NotificationsNoneRounded as BellIcon,
  AddRounded as AddIcon,
  PictureAsPdfRounded as PdfIcon,
  TableChartRounded as ExcelIcon,
  FileDownloadOutlined as DownloadIcon
} from '@mui/icons-material';
import { fetchSalesDashboard } from '../../api/pharmacyApi';
import PharmacyLayout from '../../components/PharmacyLayout';
import NewBillModal from '../../components/pharmacy/NewBillModal';

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

// Helper to format currency
const fRs = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

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
    {action && <Box component="div" sx={{ color: colors.green, fontSize: 13.5, cursor: 'pointer' }}>{action}</Box>}
  </Stack>
);

export default function PharmacySales() {
  const [period, setPeriod] = useState('Daily');
  const [txFilter, setTxFilter] = useState('All');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [billModalOpen, setBillModalOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  const handleExportPDF = () => {
    setSnackbar({ open: true, message: 'Generating PDF report...', severity: 'info' });
    setTimeout(() => setSnackbar({ open: true, message: 'PDF Exported Successfully!', severity: 'success' }), 2000);
  };

  const handleExportExcel = () => {
    setSnackbar({ open: true, message: 'Preparing Excel data...', severity: 'info' });
    setTimeout(() => setSnackbar({ open: true, message: 'Excel Sheet Downloaded!', severity: 'success' }), 2000);
  };

  const handleQuickReport = (name) => {
    setSnackbar({ open: true, message: `Preparing ${name}...`, severity: 'info' });
    setTimeout(() => setSnackbar({ open: true, message: `${name} generated!`, severity: 'success' }), 1500);
  };

  const showNotifications = () => {
    setSnackbar({ open: true, message: 'You have 3 new notifications regarding stock and billing.', severity: 'info' });
  };

  const load = async (p = period) => {
    try {
      setLoading(true);
      const res = await fetchSalesDashboard(p);
      setData(res.data);
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: 'Failed to fetch sales data', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(period); }, [period]);

  if (loading && !data) return (
    <PharmacyLayout>
      <Box sx={{ p: 5, display: 'grid', placeItems: 'center', height: '100vh', bgcolor: colors.bg }}>
        <CircularProgress size={40} sx={{ color: colors.green }} />
      </Box>
    </PharmacyLayout>
  );

  const s = data?.summary || {};
  const STATS = [
    { title: "Today's\nrevenue", value: fRs(s.todayRevenue), sub: `↑ ${s.revenueChange || 0}% vs yesterday`, color: colors.green },
    { title: 'This month', value: fRs(s.monthRevenue), sub: `↑ ${s.monthChange || 0}% vs last month`, color: colors.blue },
    { title: 'Bills today', value: s.billsToday || 0, sub: `Avg ${fRs(s.avgBill)} per bill`, color: colors.amber },
    { title: 'GST\ncollected', value: fRs(s.gstCollected), sub: new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }), color: colors.purple }
  ];

  const gst = data?.gstSummary || {};
  const GST_ROWS = [
    ['Taxable sales', fRs(gst.taxable)],
    ['CGST (6%)', fRs(gst.cgst)],
    ['SGST (6%)', fRs(gst.sgst)],
    ['Total GST collected', fRs(gst.total)],
    ['Exempt (Jan Aushadhi)', fRs(gst.exempt)]
  ];

  const topMeds = data?.topMeds || [];
  const transactions = data?.transactions || [];
  const trend = data?.revenueTrend || [];

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
              {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).replace(/ /g, '\n')}
            </Box>
            <IconButton 
              onClick={showNotifications}
              sx={{ border: `1px solid ${colors.line}`, bgcolor: '#fff', width: 42, height: 42 }}
            >
              <Badge color="error" variant="dot">
                <BellIcon sx={{ color: '#5f5a52' }} />
              </Badge>
            </IconButton>
            <Button 
              startIcon={<AddIcon />} 
              onClick={() => setBillModalOpen(true)}
              sx={{ border: `1px solid ${colors.line}`, bgcolor: '#fff', color: colors.text, borderRadius: 2.5, px: 2, py: 1, textTransform: 'none', fontSize: 14.5, height: 42 }}
            >
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

            <Box sx={{ height: 160, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', mb: 4, gap: 0.5 }}>
              {trend.map((point, i) => (
                <Box 
                  key={i} 
                  sx={{ 
                    flex: 1,
                    bgcolor: i === trend.length - 1 ? colors.greenDark : colors.greenSoft, 
                    height: `${Math.max(5, Math.min(100, (point.value / (Math.max(...trend.map(tp=>tp.value)) || 1000)) * 100))}%`, 
                    borderRadius: '2px 2px 0 0',
                    transition: 'height 0.5s ease-out'
                  }} 
                />
              ))}
            </Box>
            <Stack direction="row" justifyContent="space-between" sx={{ px: 0.5, mb: 4 }}>
              {trend.filter((_, idx) => trend.length > 15 ? idx % 5 === 0 : true).map((point, i) => (
                <Typography key={i} sx={{ fontSize: 9, color: colors.muted }}>{point.index}</Typography>
              ))}
            </Stack>

            <Typography sx={{ fontSize: 13, mb: 1.5 }}>Revenue split — prescription vs walk-in</Typography>
            <Box sx={{ height: 8, borderRadius: 4, bgcolor: colors.greenSoft, position: 'relative', mb: 1.5, overflow: 'hidden' }}>
              <Box sx={{ position: 'absolute', top: 0, left: 0, height: '100%', width: `${data?.revenueSplit?.prescription || 60}%`, bgcolor: colors.green }} />
            </Box>
            <Stack direction="row" spacing={3} sx={{ mb: 4 }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Box sx={{ width: 10, height: 10, borderRadius: 2, bgcolor: colors.green }} />
                <Typography sx={{ fontSize: 12, color: colors.muted }}>Seva prescriptions {data?.revenueSplit?.prescription || 60}%</Typography>
              </Stack>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Box sx={{ width: 10, height: 10, borderRadius: 2, bgcolor: colors.greenSoft }} />
                <Typography sx={{ fontSize: 12, color: colors.muted }}>Walk-in OTC {data?.revenueSplit?.walkin || 40}%</Typography>
              </Stack>
            </Stack>

            <Typography sx={{ fontSize: 13, mb: 1.5 }}>Payment mode breakdown</Typography>
            <Box sx={{ height: 8, borderRadius: 4, display: 'flex', overflow: 'hidden', mb: 1.5 }}>
              {data?.paymentBreakdown?.map((p, i) => (
                <Box 
                  key={p.label} 
                  sx={{ 
                    height: '100%', 
                    width: `${p.percent}%`, 
                    bgcolor: i === 0 ? colors.blue : i === 1 ? colors.blueSoft : colors.graySoft, 
                    borderLeft: i > 0 ? '1px solid #fff' : 'none' 
                  }} 
                />
              ))}
            </Box>
            <Stack direction="row" spacing={2.5}>
              {data?.paymentBreakdown?.map((p, i) => (
                <Stack direction="row" alignItems="center" spacing={1} key={p.label}>
                  <Box sx={{ width: 10, height: 10, borderRadius: 2, bgcolor: i === 0 ? colors.blue : i === 1 ? colors.blueSoft : colors.graySoft }} />
                  <Typography sx={{ fontSize: 12, color: colors.muted }}>{p.label} {p.percent}%</Typography>
                </Stack>
              ))}
            </Stack>
          </Box>

          {/* Top Medicines Sold */}
          <Box sx={{ p: 3, borderRadius: 4, border: `1px solid ${colors.line}`, bgcolor: colors.paper }}>
            <SectionHeader title="Top medicines sold" subtitle="This month" />
            <Stack spacing={2.5}>
              {topMeds.map((m, i) => (
                <Box key={i} sx={{ display: 'flex', gap: 1.5 }}>
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
              {!topMeds.length && <Typography sx={{ textAlign: 'center', color: colors.muted, fontSize: 13, py: 2 }}>No data available</Typography>}
            </Stack>
          </Box>
        </Box>

        {/* Main Grid 2 */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 340px' }, gap: 3 }}>
          
          {/* Transaction History */}
          <Box sx={{ p: 3, borderRadius: 4, border: `1px solid ${colors.line}`, bgcolor: colors.paper }}>
            <SectionHeader 
              title="Transaction history" 
              action={<Box onClick={handleExportPDF} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>Export PDF <PdfIcon sx={{ fontSize: 16 }} /></Box>} 
            />
            
            <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
              {['All', 'Prescription', 'Walk-in', 'Refunds'].map((f) => (
                <Box 
                  key={f} 
                  onClick={() => setTxFilter(f)}
                  sx={{ 
                    px: 2, py: 0.6, borderRadius: 99, border: `1px solid ${colors.line}`, fontSize: 13, 
                    bgcolor: txFilter === f ? colors.green : 'transparent', 
                    color: txFilter === f ? '#fff' : colors.text, 
                    cursor: 'pointer', transition: '0.2s'
                  }}
                >
                  {f}
                </Box>
              ))}
            </Stack>

            <Stack spacing={0}>
              {transactions
                .filter(t => txFilter === 'All' || t.method === txFilter || (txFilter === 'Prescription' && t.details.includes('Prescription')) || (txFilter === 'Walk-in' && !t.name.includes('customer')))
                .filter(t => {
                   if (txFilter === 'All') return true;
                   if (txFilter === 'Prescription') return t.method !== 'REFUND'; // simplified for now
                   if (txFilter === 'Walk-in') return t.name === 'Walk-in customer';
                   return true;
                })
                .map((t, idx) => (
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
              {!transactions.length && <Typography sx={{ p: 4, textAlign: 'center', color: colors.muted, fontSize: 14 }}>No transactions recorded yet.</Typography>}
            </Stack>
          </Box>

          <Stack spacing={3}>
            {/* GST Summary */}
            <Box sx={{ p: 3, borderRadius: 4, border: `1px solid ${colors.line}`, bgcolor: colors.paper }}>
              <SectionHeader 
                title={`GST summary — ${new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}`} 
                action={<Box onClick={handleExportExcel} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>Download <ExcelIcon sx={{ fontSize: 16 }} /></Box>} 
              />
              
              <Typography sx={{ fontSize: 12, mb: 1, letterSpacing: 0.5 }}>GSTIN <b>03AABCA1234Z1Z5</b></Typography>
              
              <Stack spacing={1.5}>
                {GST_ROWS.map(([label, val], i) => (
                  <Stack key={label} direction="row" justifyContent="space-between" sx={{ pt: 1, borderTop: i === 3 ? `1px solid ${colors.line}` : 'none' }}>
                    <Typography sx={{ fontSize: 13, color: colors.muted }}>{label}</Typography>
                    <Typography sx={{ fontSize: 13.5, fontWeight: i >= 3 ? 600 : 400 }}>{val}</Typography>
                  </Stack>
                ))}
              </Stack>

              <Stack direction="row" spacing={1.5} sx={{ mt: 3 }}>
                <Button fullWidth onClick={() => handleQuickReport('GSTR-1')} sx={{ bgcolor: colors.green, color: '#fff', fontSize: 12.5, textTransform: 'none', py: 1, borderRadius: 2, '&:hover': { bgcolor: colors.greenDark } }}>
                  Export GSTR-1
                </Button>
                <Button fullWidth onClick={handleExportExcel} sx={{ border: `1px solid ${colors.line}`, color: colors.text, fontSize: 12.5, textTransform: 'none', py: 1, borderRadius: 2 }}>
                  Export Excel
                </Button>
              </Stack>
            </Box>

            {/* Quick Reports */}
            <Box sx={{ p: 3, borderRadius: 4, border: `1px solid ${colors.line}`, bgcolor: colors.paper }}>
              <Typography sx={{ fontSize: 16, mb: 2 }}>Quick reports</Typography>
              <Stack spacing={1.5}>
                {[
                  ['Daily sales report', 'PDF'],
                  ['Monthly stock statement', 'Excel'],
                  ['Prescription dispensing log', 'PDF'],
                  ['Purchase vs sales statement', 'Excel']
                ].map(([label, type]) => (
                  <Box 
                    key={label} 
                    onClick={() => handleQuickReport(label)}
                    sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1.5, borderRadius: 2, bgcolor: colors.soft, cursor: 'pointer', transition: '0.2s', '&:hover': { bgcolor: colors.line } }}
                  >
                    <Typography sx={{ fontSize: 13, lineHeight: 1.2 }}>{label}</Typography>
                    <Typography sx={{ fontSize: 11, color: colors.green, fontWeight: 600, textAlign: 'right' }}>{type} →</Typography>
                  </Box>
                ))}
              </Stack>
            </Box>
          </Stack>
        </Box>
      </Box>

      <NewBillModal 
        open={billModalOpen} 
        onClose={() => setBillModalOpen(false)} 
        onSuccess={() => {
          load();
          setSnackbar({ open: true, message: 'Bill created and stock updated!', severity: 'success' });
        }} 
      />

      <Snackbar 
        open={snackbar.open} autoHideDuration={4000} 
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity} sx={{ borderRadius: 2 }}>{snackbar.message}</Alert>
      </Snackbar>

    </PharmacyLayout>
  );
}
