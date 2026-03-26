import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Grid,
  Paper,
  Stack,
  Typography
} from '@mui/material';
import AdminLayout from '../../components/AdminLayout';
import { fetchAdminAnalytics, fetchSystemLogs } from '../../api/adminApi';

const colors = {
  line: '#ebe9e0',
  muted: '#6f6a62',
  text: '#252525',
  blue: '#2563eb',
  green: '#16a34a',
  red: '#dc2626',
  orange: '#ea580c',
  orangeSoft: '#fff7ed'
};

const formatNumber = (value) => new Intl.NumberFormat('en-IN').format(Number(value || 0));
const formatDuration = (value) => `${Number(value || 0).toFixed(1)}ms`;

const buildLogLabel = (log) => {
  const method = log?.method ? `${log.method} ` : '';
  const path = log?.path || log?.message || 'System event';
  const status = log?.statusCode ? ` (${log.statusCode})` : '';
  return `${method}${path}${status}`;
};

export default function AdminSystemHealth() {
  const [analytics, setAnalytics] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      const [analyticsRes, logsRes] = await Promise.all([
        fetchAdminAnalytics(),
        fetchSystemLogs({ limit: 12 })
      ]);
      setAnalytics(analyticsRes.analytics || null);
      setLogs(logsRes.logs || []);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to load system health');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const stats = useMemo(() => {
    const system = analytics?.system || {};
    const serviceCount = 10;
    return [
      ['Services tracked', formatNumber(serviceCount), 'Recent service events', colors.green],
      ['API uptime (hrs)', formatNumber(system.uptimeHours || 0), 'Current process uptime', colors.blue],
      ['Avg API response', formatDuration(system.avgResponseTimeMs || 0), 'Recent average', colors.blue],
      ['Error rate 24h', formatNumber(system.errorCount24h || 0), 'Logged errors', colors.orange]
    ];
  }, [analytics]);

  const serviceRows = useMemo(() => {
    const system = analytics?.system || {};
    const errorCount = Number(system.errorCount24h || 0);
    const logCount = logs.length;
    const recentAdminTraffic = logs.filter((log) => String(log.path || '').startsWith('/api/admin')).length;

    return [
      ['Application process', 'Operational', `${formatNumber(system.uptimeHours || 0)} hrs`, formatDuration(system.avgResponseTimeMs || 0), colors.green],
      ['Notification pipeline', errorCount > 0 ? 'Attention' : 'Operational', 'Last 24h', `${formatNumber(errorCount)} errors`, errorCount > 0 ? colors.orange : colors.green],
      ['Admin logging', logCount ? 'Operational' : 'Idle', `${formatNumber(logCount)} logs`, 'Live feed', colors.blue],
      ['Admin analytics', recentAdminTraffic ? 'Operational' : 'Idle', `${formatNumber(recentAdminTraffic)} requests`, 'Recent traffic', colors.green],
      ['Financial monitoring', logs.some((log) => String(log.path || '').includes('/api/admin/financials')) ? 'Operational' : 'Idle', 'Recent logs', `${formatNumber(logs.filter((log) => String(log.path || '').includes('/api/admin/financials')).length)} hits`, colors.blue],
      ['Log ingestion', logCount >= 10 ? 'Healthy' : 'Attention', `${formatNumber(logCount)} events`, errorCount ? 'Review errors' : 'Stable', logCount >= 10 ? colors.green : colors.orange]
    ];
  }, [analytics, logs]);

  return (
    <AdminLayout>
      <Box sx={{ p: { xs: 2.5, md: 4, xl: 5 }, maxWidth: 1600, mx: 'auto' }}>
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2} sx={{ mb: 4 }}>
          <Box>
            <Typography sx={{ fontSize: 32, fontWeight: 700, fontFamily: 'Georgia, serif' }}>System health</Typography>
            <Typography sx={{ mt: 0.5, color: colors.muted, fontSize: 14.5 }}>
              Live status built from current backend analytics and logs.
            </Typography>
          </Box>
          <Button onClick={load} sx={{ borderRadius: 2.5, border: `1px solid ${colors.line}`, px: 3, py: 1.2, textTransform: 'none', color: colors.text }}>
            Refresh status
          </Button>
        </Stack>

        {loading ? (
          <Box sx={{ py: 8, display: 'grid', placeItems: 'center' }}>
            <CircularProgress sx={{ color: colors.blue }} />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ borderRadius: 3 }}>{error}</Alert>
        ) : (
          <>
            {(analytics?.system?.errorCount24h || 0) > 0 && (
              <Alert severity="warning" sx={{ mb: 4, borderRadius: 3, bgcolor: colors.orangeSoft }}>
                {analytics.system.errorCount24h} error log entries were recorded in the last 24 hours.
              </Alert>
            )}

            <Grid container spacing={2.5} sx={{ mb: 5 }}>
              {stats.map(([label, value, helper, color]) => (
                <Grid item xs={12} sm={6} md={3} key={label}>
                  <Paper sx={{ p: 2.5, borderRadius: 4, border: `1px solid ${colors.line}`, boxShadow: 'none' }}>
                    <Typography sx={{ fontSize: 13, color: colors.muted, fontWeight: 600, mb: 1.5 }}>
                      <Box component="span" sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: color, display: 'inline-block', mr: 1 }} />
                      {label}
                    </Typography>
                    <Typography sx={{ fontSize: 28, fontWeight: 700, mb: 0.5 }}>{value}</Typography>
                    <Typography sx={{ fontSize: 12, color: colors.muted }}>{helper}</Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>

            <Grid container spacing={4}>
              <Grid item xs={12} lg={7}>
                <Paper sx={{ borderRadius: 5, border: `1px solid ${colors.line}`, boxShadow: 'none', overflow: 'hidden' }}>
                  <Box sx={{ p: 4, borderBottom: `1px solid ${colors.line}` }}>
                    <Typography sx={{ fontSize: 18, fontWeight: 700 }}>Service status</Typography>
                  </Box>
                  <Box sx={{ p: 3 }}>
                    <Stack spacing={2.5}>
                      {serviceRows.map(([name, status, uptime, latency, color]) => (
                        <Stack key={name} direction="row" justifyContent="space-between" alignItems="center">
                          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ width: '42%' }}>
                            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: color }} />
                            <Typography sx={{ fontSize: 14, fontWeight: 600 }}>{name}</Typography>
                          </Stack>
                          <Typography sx={{ fontSize: 13, fontWeight: 700, color, width: '18%' }}>{status}</Typography>
                          <Typography sx={{ fontSize: 13, color: colors.muted, width: '20%', textAlign: 'right' }}>{uptime}</Typography>
                          <Typography sx={{ fontSize: 13, color: colors.muted, width: '20%', textAlign: 'right' }}>{latency}</Typography>
                        </Stack>
                      ))}
                    </Stack>
                  </Box>
                </Paper>
              </Grid>

              <Grid item xs={12} lg={5}>
                <Paper sx={{ p: 4, borderRadius: 5, border: `1px solid ${colors.line}`, boxShadow: 'none' }}>
                  <Typography sx={{ fontSize: 16, fontWeight: 700, mb: 3 }}>Recent system logs</Typography>
                  <Stack spacing={2.5}>
                    {logs.length ? logs.map((log) => (
                      <Box key={log._id} sx={{ position: 'relative', pl: 3 }}>
                        <Box sx={{ position: 'absolute', left: 0, top: 6, width: 10, height: 10, borderRadius: '50%', bgcolor: log.level === 'error' ? colors.red : log.level === 'warn' ? colors.orange : colors.green }} />
                        <Typography sx={{ fontSize: 14, fontWeight: 700 }}>{log.level?.toUpperCase?.() || 'INFO'}</Typography>
                        <Typography sx={{ fontSize: 12, color: colors.muted, mt: 0.4 }}>{buildLogLabel(log)}</Typography>
                      </Box>
                    )) : (
                      <Typography sx={{ color: colors.muted }}>No recent logs.</Typography>
                    )}
                  </Stack>
                </Paper>
              </Grid>
            </Grid>
          </>
        )}
      </Box>
    </AdminLayout>
  );
}
