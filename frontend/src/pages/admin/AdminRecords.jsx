import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
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
  SyncRounded as SyncIcon,
  VerifiedUserRounded as SecureIcon
} from '@mui/icons-material';
import AdminLayout from '../../components/AdminLayout';
import { exportAdminReport, fetchRecordsOverview } from '../../api/adminApi';

const colors = {
  line: '#ebe9e0',
  soft: '#f5f1e8',
  text: '#252525',
  muted: '#6f6a62',
  blue: '#2563eb',
  green: '#16a34a',
  greenSoft: '#f0fdf4',
  red: '#dc2626',
  orange: '#ea580c',
  yellow: '#ca8a04'
};

const formatNumber = (value) => new Intl.NumberFormat('en-IN').format(Number(value || 0));
const formatPercent = (value) => `${Number(value || 0).toFixed(value % 1 === 0 ? 0 : 1)}%`;
const formatTb = (value) => `${Number(value || 0).toFixed(value >= 10 ? 1 : 2)} TB`;

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

const formatSyncTime = (value) => {
  if (!value) return 'Not synced yet';
  return new Date(value).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' });
};

export default function AdminRecords() {
  const [payload, setPayload] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadRecordsOverview = async () => {
    try {
      setLoading(true);
      const response = await fetchRecordsOverview();
      setPayload(response);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to load records overview');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecordsOverview();
  }, []);

  const summary = payload?.summary || {};
  const breakdown = payload?.breakdown || [];
  const highlights = payload?.highlights || {};
  const health = payload?.health || {};

  const stats = useMemo(() => ([
    {
      label: 'Total records',
      val: formatNumber(summary.totalRecords),
      change: `+${formatNumber(summary.recordsThisWeek)} this week`,
      color: colors.green
    },
    {
      label: 'Storage used',
      val: formatTb(summary.storageUsedTb),
      change: `${formatPercent(summary.storageUsedPercent)} of capacity`,
      color: colors.blue
    },
    {
      label: 'Pending sync',
      val: formatNumber(summary.pendingSync),
      change: summary.pendingSync ? 'EHR re-indexing / sync required' : 'All records synced',
      color: colors.orange
    },
    {
      label: 'Last full sync',
      val: formatSyncTime(summary.lastFullSyncAt),
      change: summary.syncStatusLabel || 'All nodes synced',
      color: colors.green
    }
  ]), [summary]);

  const healthRows = useMemo(() => ([
    { label: 'Unit capacity', val: formatTb(health.unitCapacityTb) },
    { label: 'Loss', val: `${health.dataLossRate ? `< ${health.dataLossRate}%` : '< 0.00001%'}` },
    { label: 'Auto-backup', val: health.autoBackup || 'Daily 3:00 AM' },
    { label: 'Pending sync issues', val: `${formatNumber(health.pendingSyncIssues)} offline` },
    { label: 'Retention policy', val: health.retentionPolicy || '7 years (NHM)' },
    { label: 'Encryption', val: health.encryption || 'AES-256 bit' },
    { label: 'Linked patient records', val: formatPercent(health.linkedCoverageRate) },
    { label: 'Offline cached records', val: formatNumber(health.offlineCachedRecords) }
  ]), [health]);

  const handleSync = async () => {
    await loadRecordsOverview();
    setMessage('Records overview refreshed.');
  };

  const handleExport = async () => {
    try {
      const csv = await exportAdminReport('records');
      downloadBlob(csv, 'admin-records-report.csv');
      setMessage('Records report exported.');
    } catch (err) {
      setError(err.message || 'Failed to export records report');
    }
  };

  return (
    <AdminLayout>
      <Box sx={{ p: { xs: 2.5, md: 4, xl: 5 }, maxWidth: 1600, mx: 'auto' }}>
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems="flex-start" spacing={2} sx={{ mb: 4 }}>
          <Box>
            <Typography sx={{ fontSize: 32, fontWeight: 700, fontFamily: 'Georgia, serif' }}>Health Records</Typography>
            <Typography sx={{ mt: 0.5, color: colors.muted, fontSize: 14.5 }}>Platform-wide record storage, sync status and data management</Typography>
          </Box>
          <Stack direction="row" spacing={1.5}>
            <Button startIcon={<SyncIcon />} onClick={handleSync} variant="contained" sx={{ bgcolor: colors.text, color: '#fff', borderRadius: 2.5, px: 3, py: 1.2, textTransform: 'none', fontWeight: 600 }}>
              Sync now
            </Button>
            <Button onClick={handleExport} variant="outlined" sx={{ borderRadius: 2.5, px: 3, py: 1.2, textTransform: 'none', fontWeight: 600 }}>
              Export CSV
            </Button>
          </Stack>
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
            <Grid container spacing={2.5} sx={{ mb: 5 }}>
              {stats.map((stat) => (
                <Grid item xs={12} sm={6} md={3} key={stat.label}>
                  <Paper sx={{ p: 2.5, borderRadius: 4, border: `1px solid ${colors.line}`, boxShadow: 'none' }}>
                    <Typography sx={{ fontSize: 13, color: colors.muted, fontWeight: 600, mb: 1.5 }}>
                      <Box component="span" sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: stat.color, display: 'inline-block', mr: 1 }} />
                      {stat.label}
                    </Typography>
                    <Typography sx={{ fontSize: 28, fontWeight: 700, mb: 0.5 }}>{stat.val}</Typography>
                    <Typography sx={{ fontSize: 12, color: colors.muted, fontWeight: 600 }}>{stat.change}</Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>

            <Grid container spacing={4}>
              <Grid item xs={12} lg={7}>
                <Paper sx={{ p: 4, borderRadius: 5, border: `1px solid ${colors.line}`, boxShadow: 'none' }}>
                  <Typography sx={{ fontSize: 18, fontWeight: 700, mb: 4 }}>Record type breakdown</Typography>
                  <Stack spacing={4}>
                    {breakdown.length ? breakdown.map((item, index) => {
                      const barColor = [colors.green, colors.blue, '#6366f1', colors.orange, colors.yellow][index % 5];
                      return (
                        <Stack key={item.name} spacing={1.5}>
                          <Stack direction="row" justifyContent="space-between">
                            <Typography sx={{ fontSize: 14, fontWeight: 600 }}>{item.name}</Typography>
                            <Typography sx={{ fontSize: 14, fontWeight: 700 }}>{formatNumber(item.count)}</Typography>
                          </Stack>
                          <Box sx={{ height: 8, bgcolor: colors.soft, borderRadius: 4, overflow: 'hidden' }}>
                            <Box sx={{ width: `${Math.min(item.percentage, 100)}%`, height: '100%', bgcolor: barColor }} />
                          </Box>
                        </Stack>
                      );
                    }) : (
                      <Typography sx={{ color: colors.muted }}>No health record data is available yet.</Typography>
                    )}
                  </Stack>
                  <Divider sx={{ my: 4 }} />
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography sx={{ fontSize: 14, fontWeight: 700 }}>Linked patient records</Typography>
                      <Typography sx={{ fontSize: 12, color: colors.muted }}>Across active patient population with stored health records</Typography>
                    </Box>
                    <Typography sx={{ fontSize: 24, fontWeight: 800 }}>{formatPercent(highlights.linkedCoverageRate)}</Typography>
                  </Stack>
                  <Divider sx={{ my: 4 }} />
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography sx={{ fontSize: 14, fontWeight: 700 }}>Offline cached records</Typography>
                      <Typography sx={{ fontSize: 12, color: colors.muted }}>Stored on records flagged for offline availability</Typography>
                    </Box>
                    <Typography sx={{ fontSize: 24, fontWeight: 800 }}>{formatNumber(highlights.offlineCachedRecords)}</Typography>
                  </Stack>
                </Paper>
              </Grid>

              <Grid item xs={12} lg={5}>
                <Paper sx={{ p: 4, borderRadius: 5, border: `1px solid ${colors.line}`, boxShadow: 'none' }}>
                  <Typography sx={{ fontSize: 16, fontWeight: 700, mb: 3 }}>Storage & sync health</Typography>
                  <Stack spacing={2.5}>
                    {healthRows.map((row) => (
                      <Stack key={row.label} direction="row" justifyContent="space-between">
                        <Typography sx={{ fontSize: 13.5, color: colors.muted, fontWeight: 500 }}>{row.label}</Typography>
                        <Typography sx={{ fontSize: 14, fontWeight: 700, textAlign: 'right', color: row.label === 'Pending sync issues' && Number(health.pendingSyncIssues || 0) > 0 ? colors.red : colors.text }}>
                          {row.val}
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>
                  <Button fullWidth startIcon={<SecureIcon />} variant="outlined" sx={{ mt: 4, borderRadius: 2.5, textTransform: 'none', py: 1.2, fontWeight: 600 }}>
                    Manage encryption keys
                  </Button>
                </Paper>
              </Grid>
            </Grid>
          </>
        )}
      </Box>
    </AdminLayout>
  );
}
