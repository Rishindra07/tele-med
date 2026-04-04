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
        <Stack direction={{ xs: 'column', lg: 'row' }} justifyContent="space-between" spacing={2} sx={{ mb: 3 }}>
          <Box>
            <Typography sx={{ fontSize: { xs: 36, md: 46 }, fontFamily: 'Georgia, serif', lineHeight: 1.05 }}>System health</Typography>
            <Typography sx={{ mt: 1, color: colors.muted, fontSize: 18, maxWidth: 640 }}>
              Live status built from current backend analytics and logs.
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
            <Box sx={{ px: 2.5, py: 1.25, borderRadius: 4, border: `1px solid ${colors.line}`, bgcolor: '#f7f3ea', fontSize: 17 }}>
              {new Date().toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })}
            </Box>
            <Button
              onClick={load}
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
              Refresh Status
            </Button>
          </Box>
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

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2, mb: 3 }}>
              {stats.map(([label, value, helper, color]) => (
                <Box
                  key={label}
                  sx={{
                    p: 2.5,
                    borderRadius: 3.5,
                    border: `1px solid ${colors.line}`,
                    bgcolor: colors.paper,
                    transition: '0.2s',
                    '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', borderColor: color }
                  }}
                >
                  <Typography sx={{ fontSize: 16, color: colors.muted, mb: 1.5, display: 'flex', alignItems: 'center' }}>
                    <Box component="span" sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: color, display: 'inline-block', mr: 1 }} />
                    {label}
                  </Typography>
                  <Typography sx={{ fontSize: 30, lineHeight: 1, mb: 1 }}>{value}</Typography>
                  <Typography sx={{ fontSize: 13, color: colors.muted }}>{helper}</Typography>
                </Box>
              ))}
            </Box>

            <Grid container spacing={4}>
              <Grid item xs={12} lg={7}>
                <Box sx={{ borderRadius: 3.5, border: `1px solid ${colors.line}`, bgcolor: colors.paper, height: '100%' }}>
                  <Box sx={{ p: 4, borderBottom: `1px solid ${colors.line}` }}>
                    <Typography sx={{ fontSize: 18 }}>Service status</Typography>
                  </Box>
                  <Box sx={{ p: 3 }}>
                    <Stack spacing={2.5}>
                      {serviceRows.map(([name, status, uptime, latency, color]) => (
                        <Stack key={name} direction="row" justifyContent="space-between" alignItems="center" sx={{ p: 1.5, borderRadius: 2.5, bgcolor: colors.soft }}>
                          <Stack direction="row" spacing={2} alignItems="center" sx={{ width: '42%' }}>
                            <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: color }} />
                            <Typography sx={{ fontSize: 15, fontWeight: 700 }}>{name}</Typography>
                          </Stack>
                          <Typography sx={{ fontSize: 14, fontWeight: 800, color, width: '18%' }}>{status}</Typography>
                          <Typography sx={{ fontSize: 14, color: colors.muted, width: '20%', textAlign: 'right' }}>{uptime}</Typography>
                          <Typography sx={{ fontSize: 14, color: colors.muted, width: '20%', textAlign: 'right' }}>{latency}</Typography>
                        </Stack>
                      ))}
                    </Stack>
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12} lg={5}>
                <Box sx={{ p: 4, borderRadius: 3.5, border: `1px solid ${colors.line}`, bgcolor: colors.paper }}>
                  <Typography sx={{ fontSize: 18, mb: 3 }}>Recent system logs</Typography>
                  <Stack spacing={2.5}>
                    {logs.length ? logs.map((log) => (
                      <Box key={log._id} sx={{ position: 'relative', pl: 3, p: 1.8, borderRadius: 2.5, bgcolor: colors.soft }}>
                        <Box sx={{ position: 'absolute', left: 12, top: 22, width: 10, height: 10, borderRadius: '50%', bgcolor: log.level === 'error' ? colors.red : log.level === 'warn' ? colors.orange : colors.green }} />
                        <Typography sx={{ fontSize: 14, fontWeight: 800, ml: 1 }}>{log.level?.toUpperCase?.() || 'INFO'}</Typography>
                        <Typography sx={{ fontSize: 13, color: colors.muted, mt: 0.5, ml: 1 }}>{buildLogLabel(log)}</Typography>
                      </Box>
                    )) : (
                      <Typography sx={{ color: colors.muted, fontSize: 14.5 }}>No recent logs.</Typography>
                    )}
                  </Stack>
                </Box>
              </Grid>
            </Grid>
          </>
        )}
      </Box>
    </AdminLayout>
  );
}
