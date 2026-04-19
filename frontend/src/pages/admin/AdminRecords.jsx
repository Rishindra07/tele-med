import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  Grid,
  Stack,
  Typography,
  Chip
} from '@mui/material';
import {
  SyncRounded as SyncIcon,
  VerifiedUserRounded as SecureIcon
} from '@mui/icons-material';
import AdminLayout from '../../components/AdminLayout';
import { exportAdminReport, fetchRecordsOverview } from '../../api/adminApi';

const colors = {
  paper: '#ffffff',
  line: '#e0e0e0',
  text: '#202124',
  muted: '#5f6368',
  blue: '#1a73e8',
  blueSoft: '#e8f0fe',
  green: '#1e8e3e',
  greenSoft: '#e6f4ea',
  red: '#d93025',
  redSoft: '#fbeaea',
  orange: '#f9ab00',
  orangeSoft: '#fff8e1',
  soft: '#f1f3f4'
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
        <Stack direction={{ xs: 'column', lg: 'row' }} justifyContent="space-between" spacing={2} sx={{ mb: 3 }}>
          <Box>
            <Typography sx={{ fontSize: { xs: 36, md: 46 }, fontWeight: 700, fontFamily: 'Inter, sans-serif', lineHeight: 1.05 }}>Health Records</Typography>
            <Typography sx={{ mt: 1, color: colors.muted, fontSize: 18, maxWidth: 640 }}>
              Platform-wide record storage, sync status and data management
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
            <Box sx={{ px: 2.5, py: 1.25, borderRadius: '12px', border: `1px solid ${colors.line}`, bgcolor: colors.paper, fontSize: 17 }}>
              {new Date().toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })}
            </Box>
            <Button
              startIcon={<SyncIcon />}
              onClick={handleSync}
              variant="contained"
              sx={{
                bgcolor: colors.blue,
                borderRadius: '12px',
                px: 3,
                py: 1.25,
                textTransform: 'none',
                fontSize: 15,
                fontWeight: 700,
                '&:hover': { bgcolor: colors.blue }
              }}
            >
              Sync now
            </Button>
            <Button
              onClick={handleExport}
              variant="outlined"
              sx={{
                borderColor: colors.line,
                color: colors.text,
                borderRadius: '12px',
                px: 3,
                py: 1.25,
                textTransform: 'none',
                fontSize: 15,
                fontWeight: 700,
                '&:hover': { borderColor: colors.text, bgcolor: 'transparent' }
              }}
            >
              Export CSV
            </Button>
          </Box>
        </Stack>

        {message && <Alert severity="success" sx={{ borderRadius: '12px', mb: 3 }} onClose={() => setMessage('')}>{message}</Alert>}

        {loading ? (
          <Box sx={{ py: 8, display: 'grid', placeItems: 'center' }}>
            <CircularProgress sx={{ color: colors.blue }} />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ borderRadius: '12px' }}>{error}</Alert>
        ) : (
          <>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2, mb: 3 }}>
              {stats.map((stat) => (
                <Box
                  key={stat.label}
                  sx={{
                    p: 2.5,
                    borderRadius: '12px',
                    border: `1px solid ${colors.line}`,
                    bgcolor: colors.paper,
                    transition: '0.2s',
                    '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', borderColor: stat.color }
                  }}
                >
                  <Typography sx={{ fontSize: 16, color: colors.muted, mb: 1.5, display: 'flex', alignItems: 'center' }}>
                    <Box component="span" sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: stat.color, display: 'inline-block', mr: 1 }} />
                    {stat.label}
                  </Typography>
                  <Typography sx={{ fontSize: 30, lineHeight: 1, mb: 1 }}>{stat.val}</Typography>
                  <Typography sx={{ fontSize: 13, color: colors.muted }}>{stat.change}</Typography>
                </Box>
              ))}
            </Box>

            <Grid container spacing={4}>
              <Grid item xs={12} lg={7}>
                <Box sx={{ p: 4, borderRadius: '16px', border: `1px solid ${colors.line}`, bgcolor: colors.paper, height: '100%' }}>
                  <Typography sx={{ fontSize: 18, mb: 4 }}>Record type breakdown</Typography>
                  <Stack spacing={4}>
                    {breakdown.length ? breakdown.map((item, index) => {
                      const barColor = [colors.green, colors.blue, '#6366f1', colors.orange, colors.red][index % 5];
                      return (
                        <Stack key={item.name} spacing={1.5}>
                          <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Typography sx={{ fontSize: 15, fontWeight: 700 }}>{item.name}</Typography>
                            <Typography sx={{ fontSize: 15, fontWeight: 800 }}>{formatNumber(item.count)}</Typography>
                          </Stack>
                          <Box sx={{ height: 10, bgcolor: colors.soft, borderRadius: 5, overflow: 'hidden' }}>
                            <Box sx={{ width: `${Math.min(item.percentage, 100)}%`, height: '100%', bgcolor: barColor, borderRadius: 5 }} />
                          </Box>
                        </Stack>
                      );
                    }) : (
                      <Typography sx={{ color: colors.muted, fontSize: 14.5 }}>No health record data is available yet.</Typography>
                    )}
                  </Stack>
                  <Divider sx={{ my: 4, borderColor: colors.line, opacity: 0.5 }} />
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography sx={{ fontSize: 15, fontWeight: 800 }}>Linked patient records</Typography>
                      <Typography sx={{ fontSize: 13, color: colors.muted }}>Across active patient population with stored records</Typography>
                    </Box>
                    <Typography sx={{ fontSize: 28, fontWeight: 900 }}>{formatPercent(highlights.linkedCoverageRate)}</Typography>
                  </Stack>
                  <Divider sx={{ my: 4, borderColor: colors.line, opacity: 0.5 }} />
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography sx={{ fontSize: 15, fontWeight: 800 }}>Offline cached records</Typography>
                      <Typography sx={{ fontSize: 13, color: colors.muted }}>Stored on records flagged for offline availability</Typography>
                    </Box>
                    <Typography sx={{ fontSize: 28, fontWeight: 900 }}>{formatNumber(highlights.offlineCachedRecords)}</Typography>
                  </Stack>
                </Box>
              </Grid>

              <Grid item xs={12} lg={5}>
                <Box sx={{ p: 4, borderRadius: '16px', border: `1px solid ${colors.line}`, bgcolor: colors.paper }}>
                  <Typography sx={{ fontSize: 18, mb: 3 }}>Storage & sync health</Typography>
                  <Stack spacing={2.5}>
                    {healthRows.map((row) => (
                      <Stack key={row.label} direction="row" justifyContent="space-between">
                        <Typography sx={{ fontSize: 14.5, color: colors.muted }}>{row.label}</Typography>
                        <Typography sx={{ fontSize: 15, fontWeight: 800, textAlign: 'right', color: row.label === 'Pending sync issues' && Number(health.pendingSyncIssues || 0) > 0 ? colors.red : colors.text }}>
                          {row.val}
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>
                  <Button
                    fullWidth
                    startIcon={<SecureIcon />}
                    variant="outlined"
                    sx={{
                      mt: 4,
                      borderRadius: '12px',
                      textTransform: 'none',
                      py: 1.4,
                      fontWeight: 800,
                      borderColor: colors.line,
                      color: colors.text,
                      '&:hover': { borderColor: colors.text, bgcolor: 'transparent' }
                    }}
                  >
                    Manage encryption keys
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </>
        )}
      </Box>
    </AdminLayout>
  );
}
