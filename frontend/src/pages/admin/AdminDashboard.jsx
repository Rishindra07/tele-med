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
  orangeSoft: '#fdf4e4'
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
        <Stack direction={{ xs: 'column', lg: 'row' }} justifyContent="space-between" spacing={2} sx={{ mb: 3 }}>
          <Box>
            <Typography sx={{ fontSize: { xs: 36, md: 46 }, fontFamily: 'Georgia, serif', lineHeight: 1.05 }}>
              Admin dashboard
            </Typography>
            <Typography sx={{ mt: 1, color: colors.muted, fontSize: 18, maxWidth: 640 }}>
              Live platform analytics, pending approvals, complaints, fulfillment, and system health.
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
            <Box sx={{ px: 2.5, py: 1.25, borderRadius: 4, border: `1px solid ${colors.line}`, bgcolor: '#f7f3ea', fontSize: 17 }}>
              {new Date().toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })}
            </Box>
            <Button
              onClick={() => loadDashboard({ silent: true })}
              variant="contained"
              disabled={refreshing}
              sx={{
                bgcolor: colors.blue,
                borderRadius: 3,
                px: 3,
                py: 1.25,
                textTransform: 'none',
                fontSize: 15,
                '&:hover': { bgcolor: colors.blue }
              }}
            >
              {refreshing ? 'Refreshing...' : 'Refresh dashboard'}
            </Button>
          </Box>
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
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2, mb: 3 }}>
              {stats.map(([label, value, helper, tone]) => (
                <Box
                  key={label}
                  sx={{
                    p: 2.5,
                    borderRadius: 3.5,
                    border: `1px solid ${colors.line}`,
                    bgcolor: colors.paper,
                    transition: '0.2s',
                    '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', borderColor: tone }
                  }}
                >
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: tone }} />
                    <Typography sx={{ fontSize: 16, color: colors.muted }}>{label}</Typography>
                  </Stack>
                  <Typography sx={{ mt: 1.2, fontSize: 30, lineHeight: 1 }}>{value}</Typography>
                  <Typography sx={{ mt: 1, color: tone, fontSize: 15 }}>{helper}</Typography>
                </Box>
              ))}
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', xl: '1.2fr 0.9fr 0.9fr' }, gap: 3 }}>
              <Box sx={{ p: 2.5, borderRadius: 3.5, border: `1px solid ${colors.line}`, bgcolor: colors.paper }}>
                <Typography sx={{ fontSize: 18, mb: 2 }}>Pending approvals</Typography>
                <Stack spacing={2}>
                  {pending.length ? pending.map((user) => (
                    <Box key={user._id} sx={{ p: 2, borderRadius: 2.5, bgcolor: '#f7f3ea' }}>
                      <Stack direction="row" justifyContent="space-between" spacing={2} alignItems="flex-start">
                        <Box sx={{ minWidth: 0 }}>
                          <Typography sx={{ fontSize: 16, fontWeight: 600 }}>{user.full_name}</Typography>
                          <Typography sx={{ fontSize: 13.5, color: colors.muted, mt: 0.4 }}>
                            {user.role} • {user.email}
                          </Typography>
                          <Typography sx={{ fontSize: 13, color: colors.muted, mt: 0.4 }}>
                            Requested on {formatRelativeDate(user.createdAt)}
                          </Typography>
                        </Box>
                        <Button
                          onClick={() => handleApprove(user._id)}
                          disabled={approvingId === user._id}
                          variant="contained"
                          sx={{
                            minWidth: 94,
                            borderRadius: 2,
                            textTransform: 'none',
                            bgcolor: colors.greenSoft,
                            color: colors.green,
                            fontSize: 13,
                            boxShadow: 'none',
                            '&:hover': { bgcolor: colors.greenSoft, boxShadow: 'none' }
                          }}
                        >
                          {approvingId === user._id ? 'Saving...' : 'Approve'}
                        </Button>
                      </Stack>
                    </Box>
                  )) : (
                    <Typography sx={{ color: colors.muted, fontSize: 14.5 }}>No pending approvals.</Typography>
                  )}
                </Stack>
              </Box>

              <Stack spacing={3}>
                <Box sx={{ p: 2.5, borderRadius: 3.5, border: `1px solid ${colors.line}`, bgcolor: colors.paper }}>
                  <Typography sx={{ fontSize: 18, mb: 2 }}>Common health issues</Typography>
                  <Stack spacing={2}>
                    {(analytics?.commonHealthIssues || []).length ? analytics.commonHealthIssues.map((item) => (
                      <Stack key={item.issue} direction="row" justifyContent="space-between" alignItems="center">
                        <Typography sx={{ fontSize: 14.5 }}>{item.issue}</Typography>
                        <Chip
                          label={formatNumber(item.count)}
                          size="small"
                          sx={{ bgcolor: colors.orangeSoft, color: colors.orange, fontWeight: 'bold' }}
                        />
                      </Stack>
                    )) : (
                      <Typography sx={{ color: colors.muted, fontSize: 14.5 }}>No symptom analytics yet.</Typography>
                    )}
                  </Stack>
                </Box>

                <Box sx={{ p: 2.5, borderRadius: 3.5, border: `1px solid ${colors.line}`, bgcolor: colors.paper }}>
                  <Typography sx={{ fontSize: 18, mb: 2 }}>Complaint summary</Typography>
                  <Stack spacing={2}>
                    {complaintRows.length ? complaintRows.map((item) => (
                      <Stack key={item.status} direction="row" justifyContent="space-between" alignItems="center">
                        <Typography sx={{ fontSize: 14.5 }}>{item.status}</Typography>
                        <Chip
                          label={formatNumber(item.count)}
                          size="small"
                          sx={{
                            bgcolor: item.status.toLowerCase().includes('resolve') ? colors.greenSoft : colors.redSoft,
                            color: item.status.toLowerCase().includes('resolve') ? colors.green : colors.red,
                            fontWeight: 'bold'
                          }}
                        />
                      </Stack>
                    )) : (
                      <Typography sx={{ color: colors.muted, fontSize: 14.5 }}>No complaint data yet.</Typography>
                    )}
                  </Stack>
                </Box>
              </Stack>

              <Stack spacing={3}>
                <Box sx={{ p: 2.5, borderRadius: 3.5, border: `1px solid ${colors.line}`, bgcolor: colors.paper }}>
                  <Typography sx={{ fontSize: 18, mb: 2 }}>Pharmacy fulfillment</Typography>
                  <Typography sx={{ fontSize: 30, lineHeight: 1 }}>
                    {analytics?.pharmacyFulfillment?.rate || 0}%
                  </Typography>
                  <Typography sx={{ fontSize: 15, color: colors.muted, mt: 1, mb: 2 }}>
                    Ready, partial, and completed fulfillment rate
                  </Typography>
                  <Stack spacing={1.5}>
                    {fulfillmentRows.length ? fulfillmentRows.map((item) => (
                      <Stack key={item.status} direction="row" justifyContent="space-between" alignItems="center">
                        <Typography sx={{ fontSize: 14.5 }}>{item.status}</Typography>
                        <Typography sx={{ fontSize: 14.5, fontWeight: 600, color: colors.blue }}>
                          {formatNumber(item.count)}
                        </Typography>
                      </Stack>
                    )) : (
                      <Typography sx={{ color: colors.muted, fontSize: 14.5 }}>No fulfillment data yet.</Typography>
                    )}
                  </Stack>
                </Box>

                <Box sx={{ p: 2.5, borderRadius: 3.5, border: `1px solid ${colors.line}`, bgcolor: colors.paper }}>
                  <Typography sx={{ fontSize: 18, mb: 2 }}>System health</Typography>
                  <Stack spacing={1.5}>
                    {[
                      ['Uptime', `${analytics?.system?.uptimeHours || 0} hrs`, colors.text],
                      ['Error count 24h', formatNumber(analytics?.system?.errorCount24h), colors.red],
                      ['Avg response', `${formatNumber(analytics?.system?.avgResponseTimeMs)} ms`, colors.text],
                      ['Avg consultation', `${analytics?.averageConsultationDurationMinutes || 0} min`, colors.text]
                    ].map(([label, value, tone]) => (
                      <Stack key={label} direction="row" justifyContent="space-between">
                        <Typography sx={{ fontSize: 14.5 }}>{label}</Typography>
                        <Typography sx={{ fontSize: 14.5, fontWeight: 600, color: tone }}>{value}</Typography>
                      </Stack>
                    ))}
                  </Stack>
                </Box>
              </Stack>
            </Box>

            <Box sx={{ p: 2.5, borderRadius: 3.5, border: `1px solid ${colors.line}`, bgcolor: colors.paper, mt: 4 }}>
              <Typography sx={{ fontSize: 18, mb: 2 }}>Recent logs</Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, gap: 2 }}>
                {logs.length ? logs.map((log) => (
                  <Box key={log._id} sx={{ p: 1.6, borderRadius: 2.5, bgcolor: '#f7f3ea' }}>
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
                )) : (
                  <Typography sx={{ color: colors.muted, fontSize: 14.5 }}>No recent system logs.</Typography>
                )}
              </Box>
            </Box>
          </>
        )}
      </Box>
    </AdminLayout>
  );
}
