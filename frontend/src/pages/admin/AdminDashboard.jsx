import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Grid,
  Paper,
  Stack,
  Typography
} from '@mui/material';
import AdminLayout from '../../components/AdminLayout';
import {
  approvePendingUser,
  fetchAdminAnalytics,
  fetchPendingApprovals,
  fetchSystemLogs
} from '../../api/adminApi';

const colors = {
  line: '#ebe9e0',
  muted: '#6f6a62',
  text: '#252525',
  blue: '#2563eb',
  blueSoft: '#eff6ff',
  green: '#16a34a',
  greenSoft: '#f0fdf4',
  red: '#dc2626',
  redSoft: '#fef2f2',
  orange: '#ea580c',
  orangeSoft: '#fff7ed'
};

const formatNumber = (value) => new Intl.NumberFormat('en-IN').format(Number(value || 0));

const formatRelativeDate = (value) => {
  if (!value) return 'Unknown date';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Unknown date';
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

const formatLogLabel = (log) => {
  const method = log?.method ? String(log.method).toUpperCase() : '';
  const path = log?.path || log?.message || 'System event';
  const status = log?.statusCode ? ` (${log.statusCode})` : '';
  return [method, path].filter(Boolean).join(' ') + status;
};

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [pending, setPending] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [actionMessage, setActionMessage] = useState('');
  const [approvingId, setApprovingId] = useState('');

  const loadDashboard = useCallback(async ({ silent = false } = {}) => {
    try {
      setError('');
      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const [analyticsRes, pendingRes, logsRes] = await Promise.all([
        fetchAdminAnalytics(),
        fetchPendingApprovals(),
        fetchSystemLogs({ limit: 6 })
      ]);

      setAnalytics(analyticsRes.analytics || null);
      setPending(pendingRes.users || []);
      setLogs(logsRes.logs || analyticsRes.analytics?.system?.recentLogs || []);
    } catch (err) {
      setError(err.message || 'Failed to load admin dashboard');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const handleApprove = async (userId) => {
    try {
      setApprovingId(userId);
      await approvePendingUser(userId);
      setActionMessage('Approval updated successfully.');
      await loadDashboard({ silent: true });
    } catch (err) {
      setError(err.message || 'Failed to approve user');
    } finally {
      setApprovingId('');
    }
  };

  const stats = useMemo(() => {
    const active = analytics?.activeUsers || {};
    const consultations = analytics?.consultations || {};
    return [
      ['Patients', formatNumber(active.patients), 'Active patient accounts', colors.green],
      ['Doctors', formatNumber(active.doctors), 'Approved and active', colors.blue],
      ['Pharmacists', formatNumber(active.pharmacists), 'Active pharmacy users', colors.orange],
      ['Today Consultations', formatNumber(consultations.today), 'Created today', colors.blue],
      ['Week Consultations', formatNumber(consultations.week), 'Last 7 days', colors.green],
      ['Month Consultations', formatNumber(consultations.month), 'Current month', colors.orange],
      ['Pending Approvals', formatNumber(pending.length), 'Doctor and pharmacy queue', colors.red],
      ['Avg Response (ms)', formatNumber(analytics?.system?.avgResponseTimeMs), 'Backend average', colors.blue]
    ];
  }, [analytics, pending]);

  const complaintRows = useMemo(() => {
    const complaints = analytics?.complaints || {};
    const keys = Object.keys(complaints);
    if (!keys.length) {
      return [];
    }
    return keys.map((status) => ({
      status,
      count: complaints[status]
    }));
  }, [analytics]);

  const fulfillmentRows = useMemo(() => {
    const breakdown = analytics?.pharmacyFulfillment?.breakdown || {};
    const keys = Object.keys(breakdown);
    if (!keys.length) {
      return [];
    }
    return keys.map((status) => ({
      status,
      count: breakdown[status]
    }));
  }, [analytics]);

  return (
    <AdminLayout>
      <Box sx={{ p: { xs: 2.5, md: 4, xl: 5 }, maxWidth: 1600, mx: 'auto' }}>
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2} sx={{ mb: 4 }}>
          <Box>
            <Typography sx={{ fontSize: 32, fontWeight: 700, fontFamily: 'Georgia, serif' }}>
              Admin dashboard
            </Typography>
            <Typography sx={{ mt: 0.5, color: colors.muted, fontSize: 14.5 }}>
              Live platform analytics, pending approvals, complaints, fulfillment, and system health.
            </Typography>
          </Box>
          <Stack direction="row" spacing={1.5} alignItems="center">
            {refreshing && <Typography sx={{ fontSize: 13, color: colors.muted }}>Refreshing...</Typography>}
            <Button
              onClick={() => loadDashboard({ silent: true })}
              sx={{
                borderRadius: 2.5,
                border: `1px solid ${colors.line}`,
                px: 2.5,
                py: 1,
                textTransform: 'none',
                color: colors.text
              }}
            >
              Refresh
            </Button>
          </Stack>
        </Stack>

        {actionMessage && (
          <Alert severity="success" sx={{ borderRadius: 3, mb: 3 }} onClose={() => setActionMessage('')}>
            {actionMessage}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ py: 8, display: 'grid', placeItems: 'center' }}>
            <CircularProgress sx={{ color: colors.blue }} />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ borderRadius: 3 }}>{error}</Alert>
        ) : (
          <>
            <Grid container spacing={2.5} sx={{ mb: 5 }}>
              {stats.map(([label, value, helper, tone]) => (
                <Grid item xs={12} sm={6} md={3} key={label}>
                  <Paper sx={{ p: 2.5, borderRadius: 4, border: `1px solid ${colors.line}`, boxShadow: 'none' }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography sx={{ fontSize: 13, color: colors.muted, fontWeight: 500 }}>{label}</Typography>
                      <Box sx={{ width: 9, height: 9, borderRadius: '50%', bgcolor: tone }} />
                    </Stack>
                    <Typography sx={{ fontSize: 28, fontWeight: 700, mt: 1 }}>{value}</Typography>
                    <Typography sx={{ fontSize: 12.5, color: colors.muted, mt: 0.75 }}>{helper}</Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>

            <Grid container spacing={4}>
              <Grid item xs={12} lg={4}>
                <Paper sx={{ p: 3, borderRadius: 5, border: `1px solid ${colors.line}`, boxShadow: 'none', height: '100%' }}>
                  <Typography sx={{ fontSize: 18, fontWeight: 700, mb: 3 }}>Pending approvals</Typography>
                  <Stack spacing={2}>
                    {pending.length ? pending.map((user) => (
                      <Box key={user._id} sx={{ p: 2, borderRadius: 3, bgcolor: '#fff', border: `1px solid ${colors.line}` }}>
                        <Stack direction="row" justifyContent="space-between" spacing={2} alignItems="flex-start">
                          <Box sx={{ minWidth: 0 }}>
                            <Typography sx={{ fontSize: 14, fontWeight: 600 }}>{user.full_name}</Typography>
                            <Typography sx={{ fontSize: 12, color: colors.muted, mt: 0.4 }}>
                              {user.role} • {user.email}
                            </Typography>
                            <Typography sx={{ fontSize: 12, color: colors.muted, mt: 0.4 }}>
                              Requested on {formatRelativeDate(user.createdAt)}
                            </Typography>
                          </Box>
                          <Button
                            onClick={() => handleApprove(user._id)}
                            disabled={approvingId === user._id}
                            sx={{
                              minWidth: 94,
                              borderRadius: 2,
                              textTransform: 'none',
                              bgcolor: colors.greenSoft,
                              color: colors.green,
                              '&:hover': { bgcolor: colors.greenSoft }
                            }}
                          >
                            {approvingId === user._id ? 'Saving...' : 'Approve'}
                          </Button>
                        </Stack>
                      </Box>
                    )) : (
                      <Typography sx={{ color: colors.muted }}>No pending approvals.</Typography>
                    )}
                  </Stack>
                </Paper>
              </Grid>

              <Grid item xs={12} lg={4}>
                <Stack spacing={4}>
                  <Paper sx={{ p: 3, borderRadius: 5, border: `1px solid ${colors.line}`, boxShadow: 'none' }}>
                    <Typography sx={{ fontSize: 18, fontWeight: 700, mb: 3 }}>Common health issues</Typography>
                    <Stack spacing={2}>
                      {(analytics?.commonHealthIssues || []).length ? analytics.commonHealthIssues.map((item) => (
                        <Stack key={item.issue} direction="row" justifyContent="space-between" alignItems="center">
                          <Typography sx={{ fontSize: 14 }}>{item.issue}</Typography>
                          <Chip
                            label={formatNumber(item.count)}
                            size="small"
                            sx={{ bgcolor: colors.orangeSoft, color: colors.orange }}
                          />
                        </Stack>
                      )) : (
                        <Typography sx={{ color: colors.muted }}>No symptom analytics yet.</Typography>
                      )}
                    </Stack>
                  </Paper>

                  <Paper sx={{ p: 3, borderRadius: 5, border: `1px solid ${colors.line}`, boxShadow: 'none' }}>
                    <Typography sx={{ fontSize: 18, fontWeight: 700, mb: 3 }}>Complaint summary</Typography>
                    <Stack spacing={2}>
                      {complaintRows.length ? complaintRows.map((item) => (
                        <Stack key={item.status} direction="row" justifyContent="space-between" alignItems="center">
                          <Typography sx={{ fontSize: 14 }}>{item.status}</Typography>
                          <Chip
                            label={formatNumber(item.count)}
                            size="small"
                            sx={{
                              bgcolor: item.status.toLowerCase().includes('resolve') ? colors.greenSoft : colors.redSoft,
                              color: item.status.toLowerCase().includes('resolve') ? colors.green : colors.red
                            }}
                          />
                        </Stack>
                      )) : (
                        <Typography sx={{ color: colors.muted }}>No complaint data yet.</Typography>
                      )}
                    </Stack>
                  </Paper>
                </Stack>
              </Grid>

              <Grid item xs={12} lg={4}>
                <Stack spacing={4}>
                  <Paper sx={{ p: 3, borderRadius: 5, border: `1px solid ${colors.line}`, boxShadow: 'none' }}>
                    <Typography sx={{ fontSize: 18, fontWeight: 700, mb: 3 }}>Pharmacy fulfillment</Typography>
                    <Typography sx={{ fontSize: 28, fontWeight: 700, mb: 0.75 }}>
                      {analytics?.pharmacyFulfillment?.rate || 0}%
                    </Typography>
                    <Typography sx={{ fontSize: 12.5, color: colors.muted, mb: 2 }}>
                      Ready, partial, and completed fulfillment rate
                    </Typography>
                    <Stack spacing={1.5}>
                      {fulfillmentRows.length ? fulfillmentRows.map((item) => (
                        <Stack key={item.status} direction="row" justifyContent="space-between" alignItems="center">
                          <Typography sx={{ fontSize: 14 }}>{item.status}</Typography>
                          <Typography sx={{ fontSize: 14, fontWeight: 600, color: colors.blue }}>
                            {formatNumber(item.count)}
                          </Typography>
                        </Stack>
                      )) : (
                        <Typography sx={{ color: colors.muted }}>No fulfillment data yet.</Typography>
                      )}
                    </Stack>
                  </Paper>

                  <Paper sx={{ p: 3, borderRadius: 5, border: `1px solid ${colors.line}`, boxShadow: 'none' }}>
                    <Typography sx={{ fontSize: 18, fontWeight: 700, mb: 3 }}>System health</Typography>
                    <Stack spacing={1.5}>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography sx={{ fontSize: 14 }}>Uptime</Typography>
                        <Typography sx={{ fontSize: 14, fontWeight: 600 }}>{analytics?.system?.uptimeHours || 0} hrs</Typography>
                      </Stack>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography sx={{ fontSize: 14 }}>Error count 24h</Typography>
                        <Typography sx={{ fontSize: 14, fontWeight: 600, color: colors.red }}>
                          {formatNumber(analytics?.system?.errorCount24h)}
                        </Typography>
                      </Stack>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography sx={{ fontSize: 14 }}>Avg response</Typography>
                        <Typography sx={{ fontSize: 14, fontWeight: 600 }}>
                          {formatNumber(analytics?.system?.avgResponseTimeMs)} ms
                        </Typography>
                      </Stack>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography sx={{ fontSize: 14 }}>Avg consultation</Typography>
                        <Typography sx={{ fontSize: 14, fontWeight: 600 }}>
                          {analytics?.averageConsultationDurationMinutes || 0} min
                        </Typography>
                      </Stack>
                    </Stack>
                  </Paper>
                </Stack>
              </Grid>
            </Grid>

            <Paper sx={{ p: 3, borderRadius: 5, border: `1px solid ${colors.line}`, boxShadow: 'none', mt: 4 }}>
              <Typography sx={{ fontSize: 18, fontWeight: 700, mb: 3 }}>Recent logs</Typography>
              <Grid container spacing={2}>
                {logs.length ? logs.map((log) => (
                  <Grid item xs={12} md={6} lg={4} key={log._id}>
                    <Box sx={{ p: 2, borderRadius: 3, border: `1px solid ${colors.line}`, bgcolor: '#fff' }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography
                          sx={{
                            fontSize: 12.5,
                            fontWeight: 700,
                            color: log.level === 'error' ? colors.red : log.level === 'warn' ? colors.orange : colors.text
                          }}
                        >
                          {log.level?.toUpperCase?.() || 'INFO'}
                        </Typography>
                        <Typography sx={{ fontSize: 11.5, color: colors.muted }}>
                          {formatRelativeDate(log.createdAt)}
                        </Typography>
                      </Stack>
                      <Typography sx={{ fontSize: 13, color: colors.text, mt: 1 }}>
                        {formatLogLabel(log)}
                      </Typography>
                    </Box>
                  </Grid>
                )) : (
                  <Grid item xs={12}>
                    <Typography sx={{ color: colors.muted }}>No recent system logs.</Typography>
                  </Grid>
                )}
              </Grid>
            </Paper>
          </>
        )}
      </Box>
    </AdminLayout>
  );
}
