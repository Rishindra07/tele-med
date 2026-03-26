import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  CircularProgress,
  Divider,
  Grid,
  Paper,
  Stack,
  Typography
} from '@mui/material';
import {
  AttachMoneyRounded as MoneyIcon,
  CreditCardRounded as PayoutIcon,
  FileDownloadRounded as ExportIcon,
  ReceiptLongRounded as LedgerIcon,
  WarningRounded as WarningIcon
} from '@mui/icons-material';
import AdminLayout from '../../components/AdminLayout';
import { exportAdminReport, fetchFinancialOverview } from '../../api/adminApi';

const colors = {
  paper: '#ffffff',
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
  yellow: '#ca8a04'
};

const formatCurrency = (value) => new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0
}).format(Number(value || 0));

const formatCompactRupees = (value) => {
  const amount = Number(value || 0);
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(amount >= 1000000 ? 1 : 2)}L`;
  }
  return formatCurrency(amount);
};

const downloadBlob = (content, fileName) => {
  const blob = new Blob([content], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const getInitials = (value = '') =>
  value
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((item) => item[0]?.toUpperCase() || '')
    .join('') || 'DR';

const monthLabel = new Date().toLocaleDateString('en-IN', { month: 'long' });

export default function AdminFinancials() {
  const [payload, setPayload] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadFinancials = async () => {
    try {
      setLoading(true);
      const response = await fetchFinancialOverview();
      setPayload(response);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to load financial overview');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFinancials();
  }, []);

  const alerts = payload?.alerts || {};
  const summary = payload?.summary || {};
  const revenueGrowth = payload?.revenueGrowth || [];
  const recentPayouts = payload?.recentPayouts || [];
  const gst = payload?.gst || {};
  const revenueBreakdown = payload?.revenueBreakdown || [];
  const insight = payload?.insight || {};

  const stats = useMemo(() => ([
    {
      label: `Revenue — ${monthLabel}`,
      val: formatCompactRupees(summary.revenueMonth),
      change: `${summary.revenueGrowthRate >= 0 ? '+' : ''}${summary.revenueGrowthRate || 0}%`,
      helper: 'vs last month',
      icon: <MoneyIcon />,
      color: colors.green
    },
    {
      label: 'Doctor Payouts',
      val: formatCompactRupees(summary.doctorPayouts),
      change: `${summary.approvedDoctors || 0} Doctors`,
      helper: 'approved & active',
      icon: <PayoutIcon />,
      color: colors.blue
    },
    {
      label: 'Platform Fees',
      val: formatCompactRupees(summary.platformFees),
      change: `${summary.platformFeeGrowthRate >= 0 ? '+' : ''}${summary.platformFeeGrowthRate || 0}%`,
      helper: 'estimated growth',
      icon: <LedgerIcon />,
      color: colors.orange
    },
    {
      label: 'GST Collected',
      val: formatCompactRupees(summary.gstCollected),
      change: gst.dueDate ? new Date(gst.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : 'Upcoming',
      helper: 'filing due',
      icon: <WarningIcon />,
      color: colors.red
    }
  ]), [summary, gst.dueDate]);

  const maxRevenue = Math.max(1, ...revenueGrowth.map((item) => item.revenue || 0));
  const maxBreakdown = Math.max(1, ...revenueBreakdown.map((item) => item.value || 0));

  const handleExport = async () => {
    try {
      const csv = await exportAdminReport('financials');
      downloadBlob(csv, 'admin-financials-report.csv');
      setMessage('Financial report exported.');
    } catch (err) {
      setError(err.message || 'Failed to export financial report');
    }
  };

  return (
    <AdminLayout>
      <Box sx={{ p: { xs: 2.5, md: 4, xl: 5 }, maxWidth: 1600, mx: 'auto' }}>
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems="flex-start" spacing={2} sx={{ mb: 4 }}>
          <Box>
            <Typography sx={{ fontSize: 32, fontWeight: 800, fontFamily: 'Georgia, serif', letterSpacing: '-0.5px' }}>Financial</Typography>
            <Typography sx={{ mt: 0.5, color: colors.muted, fontSize: 14.5, fontWeight: 500 }}>Platform revenue, partner payouts and tax management</Typography>
          </Box>
          <Button startIcon={<ExportIcon />} onClick={handleExport} variant="contained" sx={{ bgcolor: colors.text, color: '#fff', borderRadius: 3, px: 3, py: 1.2, textTransform: 'none', fontWeight: 700 }}>
            Export accounts
          </Button>
        </Stack>

        {message && <Alert severity="success" sx={{ borderRadius: 3, mb: 3 }} onClose={() => setMessage('')}>{message}</Alert>}

        {loading ? (
          <Box sx={{ py: 8, display: 'grid', placeItems: 'center' }}>
            <CircularProgress sx={{ color: colors.blue }} />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ borderRadius: 3 }}>{error}</Alert>
        ) : (
          <>
            <Alert icon={<WarningIcon sx={{ color: colors.red }} />} sx={{ mb: 4, borderRadius: 4, bgcolor: colors.redSoft, border: `1px solid ${colors.red}15`, color: colors.red, fontWeight: 700, fontSize: 14, py: 1.5 }}>
              {`${alerts.count || 0} alerts — ${formatCompactRupees(alerts.totalAmount)} outstanding - ${alerts.message || 'No active payout alerts'}`}
            </Alert>

            <Grid container spacing={2.5} sx={{ mb: 5 }}>
              {stats.map((stat) => (
                <Grid item xs={12} sm={6} md={3} key={stat.label}>
                  <Paper sx={{ p: 3, borderRadius: 5, border: `1px solid ${colors.line}`, boxShadow: 'none' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box sx={{ p: 1, borderRadius: 2, bgcolor: `${stat.color}10`, color: stat.color }}>
                        {React.cloneElement(stat.icon, { sx: { fontSize: 20 } })}
                      </Box>
                      <Box sx={{ bgcolor: colors.soft, px: 1, py: 0.4, borderRadius: 1.5 }}>
                        <Typography sx={{ fontSize: 10, fontWeight: 800, color: stat.color }}>{stat.change}</Typography>
                      </Box>
                    </Box>
                    <Typography sx={{ fontSize: 13, color: colors.muted, fontWeight: 700, mb: 0.5 }}>{stat.label}</Typography>
                    <Typography sx={{ fontSize: 28, fontWeight: 900 }}>{stat.val}</Typography>
                    <Typography sx={{ fontSize: 11, color: colors.muted, mt: 0.5 }}>{stat.helper}</Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>

            <Grid container spacing={4}>
              <Grid item xs={12} lg={8}>
                <Paper sx={{ p: 4, borderRadius: 6, border: `1px solid ${colors.line}`, boxShadow: 'none', background: colors.paper, height: '100%' }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                    <Box>
                      <Typography sx={{ fontSize: 20, fontWeight: 800 }}>Revenue Growth</Typography>
                      <Typography sx={{ fontSize: 13, color: colors.muted, mt: 0.5 }}>
                        {`${summary.revenueGrowthRate >= 0 ? '↑' : '↓'} ${Math.abs(summary.revenueGrowthRate || 0)}% vs last month performance`}
                      </Typography>
                    </Box>
                  </Stack>

                  <Box sx={{ height: 220, mt: 4, display: 'flex', alignItems: 'flex-end', gap: 2 }}>
                    {revenueGrowth.map((item) => (
                      <Box key={item.label} sx={{ flex: 1, textAlign: 'center' }}>
                        <Box sx={{ mx: 'auto', width: '70%', height: `${Math.max(12, ((item.revenue || 0) / maxRevenue) * 180)}px`, borderRadius: '12px 12px 0 0', bgcolor: colors.blue }} />
                        <Typography sx={{ fontSize: 10, fontWeight: 700, color: colors.muted, mt: 1 }}>{item.label}</Typography>
                      </Box>
                    ))}
                  </Box>

                  <Divider sx={{ my: 4 }} />

                  <Typography sx={{ fontSize: 16, fontWeight: 800, mb: 3 }}>Recent Payouts</Typography>
                  <Stack spacing={2}>
                    {recentPayouts.length ? recentPayouts.map((payout, index) => {
                      const statusColor = payout.status === 'Paid' ? colors.green : payout.status === 'Flagged' ? colors.red : colors.orange;
                      return (
                        <Box key={`${payout.doctorName}-${index}`} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, borderRadius: 3, border: `1px solid ${colors.line}` }}>
                          <Stack direction="row" spacing={2} alignItems="center">
                            <Avatar sx={{ width: 36, height: 36, bgcolor: `${statusColor}15`, color: statusColor, fontWeight: 800, fontSize: 12 }}>
                              {getInitials(payout.doctorName)}
                            </Avatar>
                            <Box>
                              <Typography sx={{ fontSize: 14, fontWeight: 700 }}>{payout.doctorName}</Typography>
                              <Typography sx={{ fontSize: 11, color: colors.muted }}>{payout.dateLabel} • {payout.method}</Typography>
                            </Box>
                          </Stack>
                          <Box sx={{ textAlign: 'right' }}>
                            <Typography sx={{ fontSize: 14, fontWeight: 900 }}>{formatCurrency(payout.amount)}</Typography>
                            <Typography sx={{ fontSize: 10, fontWeight: 800, color: statusColor }}>● {payout.status}</Typography>
                          </Box>
                        </Box>
                      );
                    }) : (
                      <Typography sx={{ color: colors.muted }}>No payout activity available yet.</Typography>
                    )}
                  </Stack>
                </Paper>
              </Grid>

              <Grid item xs={12} lg={4}>
                <Stack spacing={4}>
                  <Paper sx={{ p: 4, borderRadius: 6, border: `1px solid ${colors.line}`, boxShadow: 'none', bgcolor: '#fff' }}>
                    <Typography sx={{ fontSize: 18, fontWeight: 800, mb: 4 }}>GST summary — {monthLabel}</Typography>
                    <Stack spacing={2.5}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography sx={{ fontSize: 14, color: colors.muted, fontWeight: 500 }}>Taxable turnover</Typography>
                        <Typography sx={{ fontSize: 15, fontWeight: 800 }}>{formatCompactRupees(gst.taxableTurnover)}</Typography>
                      </Stack>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography sx={{ fontSize: 14, color: colors.muted, fontWeight: 500 }}>CGST (9%)</Typography>
                        <Typography sx={{ fontSize: 15, fontWeight: 800 }}>{formatCompactRupees(gst.cgst)}</Typography>
                      </Stack>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography sx={{ fontSize: 14, color: colors.muted, fontWeight: 500 }}>SGST (9%)</Typography>
                        <Typography sx={{ fontSize: 15, fontWeight: 800 }}>{formatCompactRupees(gst.sgst)}</Typography>
                      </Stack>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography sx={{ fontSize: 14, color: colors.muted, fontWeight: 500 }}>GSTR-1 Due</Typography>
                        <Typography sx={{ fontSize: 15, fontWeight: 800 }}>
                          {gst.dueDate ? new Date(gst.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase() : 'TBD'}
                        </Typography>
                      </Stack>
                    </Stack>
                  </Paper>

                  <Paper sx={{ p: 4, borderRadius: 6, border: `1px solid ${colors.line}`, boxShadow: 'none', background: 'linear-gradient(180deg, #fff 0%, #fcfbf7 100%)' }}>
                    <Typography sx={{ fontSize: 18, fontWeight: 800, mb: 4 }}>Revenue breakdown</Typography>
                    <Stack spacing={3.5}>
                      {revenueBreakdown.map((item, index) => {
                        const barColor = [colors.blue, colors.green, colors.orange][index % 3];
                        return (
                          <Stack key={item.label} spacing={1.5}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                              <Stack direction="row" spacing={1.5} alignItems="center">
                                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: barColor }} />
                                <Typography sx={{ fontSize: 14, fontWeight: 700 }}>{item.label}</Typography>
                              </Stack>
                              <Typography sx={{ fontSize: 14, fontWeight: 800 }}>{formatCompactRupees(item.value)}</Typography>
                            </Stack>
                            <Box sx={{ height: 8, bgcolor: colors.soft, borderRadius: 4, overflow: 'hidden' }}>
                              <Box sx={{ width: `${Math.max(8, ((item.value || 0) / maxBreakdown) * 100)}%`, height: '100%', bgcolor: barColor, borderRadius: 4 }} />
                            </Box>
                          </Stack>
                        );
                      })}
                    </Stack>
                    <Box sx={{ mt: 5, p: 3, borderRadius: 4, bgcolor: colors.blueSoft, border: `1px solid ${colors.blue}10` }}>
                      <Typography sx={{ fontSize: 13, color: colors.blue, fontWeight: 700, mb: 1 }}>Performance Insight</Typography>
                      <Typography sx={{ fontSize: 13, color: colors.muted, lineHeight: 1.5 }}>
                        {`${insight.topSource || 'Consultation fees'} is the top revenue driver, contributing about ${insight.topSourceShare || 0}% of current estimated monthly revenue.`}
                      </Typography>
                    </Box>
                  </Paper>
                </Stack>
              </Grid>
            </Grid>
          </>
        )}
      </Box>
    </AdminLayout>
  );
}
