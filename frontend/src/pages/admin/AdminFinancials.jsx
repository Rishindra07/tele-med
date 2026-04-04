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
  paper: '#fffdf8',
  line: '#d8d0c4',
  text: '#2c2b28',
  muted: '#8b857d',
  blue: '#4a90e2',
  blueSoft: '#e9f2ff',
  green: '#26a37c',
  greenSoft: '#dff3eb',
  red: '#d9635b',
  redSoft: '#fbeaea',
  orange: '#d18a1f',
  orangeSoft: '#fdf4e4',
  soft: '#f7f3ea'
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
        <Stack direction={{ xs: 'column', lg: 'row' }} justifyContent="space-between" spacing={2} sx={{ mb: 3 }}>
          <Box>
            <Typography sx={{ fontSize: { xs: 36, md: 46 }, fontFamily: 'Georgia, serif', lineHeight: 1.05 }}>Financials</Typography>
            <Typography sx={{ mt: 1, color: colors.muted, fontSize: 18, maxWidth: 640 }}>
              Platform revenue, partner payouts and tax management
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
            <Box sx={{ px: 2.5, py: 1.25, borderRadius: 4, border: `1px solid ${colors.line}`, bgcolor: '#f7f3ea', fontSize: 17 }}>
              {new Date().toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })}
            </Box>
            <Button
              startIcon={<ExportIcon />}
              onClick={handleExport}
              variant="contained"
              sx={{
                bgcolor: colors.blue,
                borderRadius: 3,
                px: 3,
                py: 1.25,
                textTransform: 'none',
                fontSize: 15,
                fontWeight: 700,
                '&:hover': { bgcolor: colors.blue }
              }}
            >
              Export accounts
            </Button>
          </Box>
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
            <Alert
              icon={<WarningIcon sx={{ color: colors.red }} />}
              sx={{
                mb: 4,
                borderRadius: 3.5,
                bgcolor: colors.redSoft,
                border: `1px solid ${colors.red}20`,
                color: colors.red,
                fontSize: 15,
                py: 1.5,
                '& .MuiAlert-icon': { pt: 1 }
              }}
            >
              <Box component="span" sx={{ fontWeight: 800 }}>{alerts.count || 0} alerts</Box>
              {` — ${formatCompactRupees(alerts.totalAmount)} outstanding • ${alerts.message || 'No active payout alerts'}`}
            </Alert>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2, mb: 3 }}>
              {stats.map((stat) => (
                <Box
                  key={stat.label}
                  sx={{
                    p: 2.5,
                    borderRadius: 3.5,
                    border: `1px solid ${colors.line}`,
                    bgcolor: colors.paper,
                    transition: '0.2s',
                    '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', borderColor: stat.color }
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ p: 1, borderRadius: 2, bgcolor: `${stat.color}15`, color: stat.color }}>
                      {React.cloneElement(stat.icon, { sx: { fontSize: 22 } })}
                    </Box>
                    <Box sx={{ bgcolor: colors.soft, px: 1.2, py: 0.5, borderRadius: 1.5 }}>
                      <Typography sx={{ fontSize: 11, fontWeight: 800, color: stat.color }}>{stat.change}</Typography>
                    </Box>
                  </Box>
                  <Typography sx={{ fontSize: 16, color: colors.muted, mb: 0.5 }}>{stat.label}</Typography>
                  <Typography sx={{ fontSize: 30, lineHeight: 1, mb: 0.8 }}>{stat.val}</Typography>
                  <Typography sx={{ fontSize: 12, color: colors.muted }}>{stat.helper}</Typography>
                </Box>
              ))}
            </Box>

            <Grid container spacing={4}>
              <Grid item xs={12} lg={8}>
          <Box sx={{ p: 4, borderRadius: 3.5, border: `1px solid ${colors.line}`, bgcolor: colors.paper, height: '100%' }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                    <Box>
                      <Typography sx={{ fontSize: 18 }}>Revenue growth</Typography>
                      <Typography sx={{ fontSize: 13, color: colors.muted, mt: 0.5 }}>
                        {`${summary.revenueGrowthRate >= 0 ? '↑' : '↓'} ${Math.abs(summary.revenueGrowthRate || 0)}% vs last month performance`}
                      </Typography>
                    </Box>
                  </Stack>
                  <Box sx={{ height: 220, mt: 4, display: 'flex', alignItems: 'flex-end', gap: 1.5 }}>
                    {revenueGrowth.map((item) => (
                      <Box key={item.label} sx={{ flex: 1, textAlign: 'center' }}>
                        <Box sx={{ mx: 'auto', width: '65%', height: `${Math.max(12, ((item.revenue || 0) / maxRevenue) * 180)}px`, borderRadius: '6px 6px 0 0', bgcolor: colors.blue }} />
                        <Typography sx={{ fontSize: 11, color: colors.muted, mt: 1.5 }}>{item.label}</Typography>
                      </Box>
                    ))}
                  </Box>
                  <Divider sx={{ my: 4, borderColor: colors.line, opacity: 0.5 }} />
                  <Typography sx={{ fontSize: 18, mb: 3 }}>Recent Payouts</Typography>
                  <Stack spacing={2}>
                    {recentPayouts.length ? recentPayouts.map((payout, index) => {
                      const statusColor = payout.status === 'Paid' ? colors.green : payout.status === 'Flagged' ? colors.red : colors.orange;
                      return (
                        <Box key={`${payout.doctorName}-${index}`} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, borderRadius: 2.5, bgcolor: colors.soft }}>
                          <Stack direction="row" spacing={2} alignItems="center">
                            <Avatar sx={{ width: 44, height: 44, bgcolor: `${statusColor}15`, color: statusColor, fontWeight: 800, fontSize: 14 }}>
                              {getInitials(payout.doctorName)}
                            </Avatar>
                            <Box>
                              <Typography sx={{ fontSize: 15, fontWeight: 700 }}>{payout.doctorName}</Typography>
                              <Typography sx={{ fontSize: 12, color: colors.muted }}>{payout.dateLabel} • {payout.method}</Typography>
                            </Box>
                          </Stack>
                          <Box sx={{ textAlign: 'right' }}>
                            <Typography sx={{ fontSize: 16, fontWeight: 800 }}>{formatCurrency(payout.amount)}</Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5, mt: 0.2 }}>
                              <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: statusColor }} />
                              <Typography sx={{ fontSize: 11, fontWeight: 700, color: statusColor }}>{payout.status}</Typography>
                            </Box>
                          </Box>
                        </Box>
                      );
                    }) : (
                      <Typography sx={{ color: colors.muted, fontSize: 14.5 }}>No payout activity available yet.</Typography>
                    )}
                  </Stack>
                </Box>
              </Grid>

              <Grid item xs={12} lg={4}>
                <Stack spacing={4}>
                  <Box sx={{ p: 4, borderRadius: 3.5, border: `1px solid ${colors.line}`, bgcolor: colors.paper }}>
                    <Typography sx={{ fontSize: 18, mb: 4 }}>GST summary — {monthLabel}</Typography>
                    <Stack spacing={2.5}>
                      {[
                        ['Taxable turnover', formatCompactRupees(gst.taxableTurnover)],
                        ['CGST (9%)', formatCompactRupees(gst.cgst)],
                        ['SGST (9%)', formatCompactRupees(gst.sgst)],
                        ['GSTR-1 Due', gst.dueDate ? new Date(gst.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase() : 'TBD']
                      ].map(([label, val]) => (
                        <Stack key={label} direction="row" justifyContent="space-between" alignItems="center">
                          <Typography sx={{ fontSize: 14.5, color: colors.muted }}>{label}</Typography>
                          <Typography sx={{ fontSize: 16, fontWeight: 800 }}>{val}</Typography>
                        </Stack>
                      ))}
                    </Stack>
                  </Box>

                  <Box sx={{ p: 4, borderRadius: 3.5, border: `1px solid ${colors.line}`, bgcolor: colors.paper, background: `linear-gradient(180deg, ${colors.paper} 0%, #fcfbf7 100%)` }}>
                    <Typography sx={{ fontSize: 18, mb: 4 }}>Revenue breakdown</Typography>
                    <Stack spacing={3}>
                      {revenueBreakdown.map((item, index) => {
                        const barColor = [colors.blue, colors.green, colors.orange][index % 3];
                        return (
                          <Stack key={item.label} spacing={1.2}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                              <Stack direction="row" spacing={1.2} alignItems="center">
                                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: barColor }} />
                                <Typography sx={{ fontSize: 14.5, fontWeight: 700 }}>{item.label}</Typography>
                              </Stack>
                              <Typography sx={{ fontSize: 15, fontWeight: 800 }}>{formatCompactRupees(item.value)}</Typography>
                            </Stack>
                            <Box sx={{ height: 10, bgcolor: colors.soft, borderRadius: 5, overflow: 'hidden' }}>
                              <Box sx={{ width: `${Math.max(8, ((item.value || 0) / maxBreakdown) * 100)}%`, height: '100%', bgcolor: barColor, borderRadius: 5 }} />
                            </Box>
                          </Stack>
                        );
                      })}
                    </Stack>
                    <Box sx={{ mt: 4, p: 2.5, borderRadius: 3, bgcolor: colors.blueSoft, border: `1px solid ${colors.blue}15` }}>
                      <Typography sx={{ fontSize: 14, color: colors.blue, fontWeight: 800, mb: 1 }}>Performance Insight</Typography>
                      <Typography sx={{ fontSize: 13, color: colors.muted, lineHeight: 1.6 }}>
                        {`${insight.topSource || 'Consultation fees'} is the top revenue driver, contributing about ${insight.topSourceShare || 0}% of current estimated monthly revenue.`}
                      </Typography>
                    </Box>
                  </Box>
                </Stack>
              </Grid>
            </Grid>
          </>
        )}
      </Box>
    </AdminLayout>
  );
}
