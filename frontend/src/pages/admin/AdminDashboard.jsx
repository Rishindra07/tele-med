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
import { useLanguage } from '../../context/LanguageContext';
import { ADMIN_DASHBOARD_TRANSLATIONS } from '../../utils/translations/admin';
import AdminLayout from '../../components/AdminLayout';
import {
  approvePendingUser,
  fetchAdminAnalytics,
  fetchPendingApprovals,
  fetchSystemLogs
} from '../../api/adminApi';

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
  orangeSoft: '#fff8e1'
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
  const { language } = useLanguage();
  const t = ADMIN_DASHBOARD_TRANSLATIONS[language] || ADMIN_DASHBOARD_TRANSLATIONS['en'];
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
      setError(err.message || t.labels.no_pending);
    } finally {
      setApprovingId('');
    }
  };

  const stats = useMemo(() => {
    const active = analytics?.activeUsers || {};
    const consultations = analytics?.consultations || {};
    return [
      [t.stats.patients, formatNumber(active.patients), t.stats.active_patients_desc, colors.green],
      [t.stats.doctors, formatNumber(active.doctors), t.stats.active_doctors_desc, colors.blue],
      [t.stats.pharmacists, formatNumber(active.pharmacists), t.stats.active_pharmacy_desc, colors.orange],
      [t.stats.today_cons, formatNumber(consultations.today), t.stats.today_cons_desc, colors.blue],
      [t.stats.week_cons, formatNumber(consultations.week), t.stats.week_cons_desc, colors.green],
      [t.stats.month_cons, formatNumber(consultations.month), t.stats.month_cons_desc, colors.orange],
      [t.stats.pending, formatNumber(pending.length), t.stats.pending_queue_desc, colors.red],
      [t.stats.avg_resp, formatNumber(analytics?.system?.avgResponseTimeMs), t.stats.backend_avg_desc, colors.blue]
    ];
  }, [analytics, pending, t]);

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
            <Typography sx={{ fontSize: { xs: 36, md: 46 }, fontWeight: 700, fontFamily: 'Inter, sans-serif', lineHeight: 1.05 }}>
              {t.title}
            </Typography>
            <Typography sx={{ mt: 1, color: colors.muted, fontSize: 18, maxWidth: 640 }}>
              {t.subtitle}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
            <Box sx={{ px: 2.5, py: 1.25, borderRadius: '12px', border: `1px solid ${colors.line}`, bgcolor: colors.paper, fontSize: 17 }}>
              {new Date().toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })}
            </Box>
            <Button
              onClick={() => loadDashboard({ silent: true })}
              variant="contained"
              disabled={refreshing}
              sx={{
                bgcolor: colors.blue,
                borderRadius: '12px',
                px: 3,
                py: 1.25,
                textTransform: 'none',
                fontSize: 15,
                '&:hover': { bgcolor: colors.blue }
              }}
            >
              {refreshing ? t.refreshing : t.refresh}
            </Button>
          </Box>
        </Stack>

        {actionMessage && (
          <Alert severity="success" sx={{ borderRadius: '20px', mb: 3 }} onClose={() => setActionMessage('')}>
            {actionMessage}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ py: 8, display: 'grid', placeItems: 'center' }}>
            <CircularProgress sx={{ color: colors.blue }} />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ borderRadius: '20px' }}>{error}</Alert>
        ) : (
          <>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2, mb: 3 }}>
              {stats.map(([label, value, helper, tone]) => (
                <Box
                  key={label}
                  sx={{
                    p: 2.5,
                    borderRadius: '12px',
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
              <Box sx={{ p: 2.5, borderRadius: '16px', border: `1px solid ${colors.line}`, bgcolor: colors.paper }}>
                <Typography sx={{ fontSize: 18, mb: 2 }}>{t.sections.pending}</Typography>
                <Stack spacing={2}>
                  {pending.length ? pending.map((user) => (
                    <Box key={user._id} sx={{ p: 2, borderRadius: '12px', bgcolor: colors.blueSoft, border: `1px solid ${colors.line}` }}>
                      <Stack direction="row" justifyContent="space-between" spacing={2} alignItems="flex-start">
                        <Box sx={{ minWidth: 0 }}>
                          <Typography sx={{ fontSize: 16, fontWeight: 600 }}>{user.full_name}</Typography>
                          <Typography sx={{ fontSize: 13.5, color: colors.muted, mt: 0.4 }}>
                            {user.role} • {user.email}
                          </Typography>
                          <Typography sx={{ fontSize: 13, color: colors.muted, mt: 0.4 }}>
                            {t.labels.requested_on} {formatRelativeDate(user.createdAt)}
                          </Typography>
                        </Box>
                        <Button
                          onClick={() => handleApprove(user._id)}
                          disabled={approvingId === user._id}
                          variant="contained"
                          sx={{
                            minWidth: 94,
                            borderRadius: '12px',
                            textTransform: 'none',
                            bgcolor: colors.greenSoft,
                            color: colors.green,
                            fontSize: 13,
                            boxShadow: 'none',
                            '&:hover': { bgcolor: colors.greenSoft, boxShadow: 'none' }
                          }}
                        >
                          {approvingId === user._id ? t.labels.saving : t.labels.approve}
                        </Button>
                      </Stack>
                    </Box>
                  )) : (
                    <Typography sx={{ color: colors.muted, fontSize: 14.5 }}>{t.labels.no_pending}</Typography>
                  )}
                </Stack>
              </Box>

              <Stack spacing={3}>
                <Box sx={{ p: 2.5, borderRadius: '16px', border: `1px solid ${colors.line}`, bgcolor: colors.paper }}>
                  <Typography sx={{ fontSize: 18, mb: 2 }}>{t.sections.health_issues}</Typography>
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
                      <Typography sx={{ color: colors.muted, fontSize: 14.5 }}>{t.labels.no_symptoms}</Typography>
                    )}
                  </Stack>
                </Box>

                <Box sx={{ p: 2.5, borderRadius: '16px', border: `1px solid ${colors.line}`, bgcolor: colors.paper }}>
                  <Typography sx={{ fontSize: 18, mb: 2 }}>{t.sections.complaints}</Typography>
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
                      <Typography sx={{ color: colors.muted, fontSize: 14.5 }}>{t.labels.no_complaints}</Typography>
                    )}
                  </Stack>
                </Box>
              </Stack>

              <Stack spacing={3}>
                <Box sx={{ p: 2.5, borderRadius: '16px', border: `1px solid ${colors.line}`, bgcolor: colors.paper }}>
                  <Typography sx={{ fontSize: 18, mb: 2 }}>{t.sections.fulfillment}</Typography>
                  <Typography sx={{ fontSize: 30, lineHeight: 1 }}>
                    {analytics?.pharmacyFulfillment?.rate || 0}%
                  </Typography>
                  <Typography sx={{ fontSize: 15, color: colors.muted, mt: 1, mb: 2 }}>
                    {t.sections.fulfillment_desc}
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
                      <Typography sx={{ color: colors.muted, fontSize: 14.5 }}>{t.labels.no_fulfillment}</Typography>
                    )}
                  </Stack>
                </Box>

                <Box sx={{ p: 2.5, borderRadius: '16px', border: `1px solid ${colors.line}`, bgcolor: colors.paper }}>
                  <Typography sx={{ fontSize: 18, mb: 2 }}>{t.sections.system_health}</Typography>
                  <Stack spacing={1.5}>
                    {[
                      [t.labels.uptime, `${analytics?.system?.uptimeHours || 0} ${t.labels.hrs}`, colors.text],
                      [t.labels.error_count, formatNumber(analytics?.system?.errorCount24h), colors.red],
                      [t.labels.avg_resp, `${formatNumber(analytics?.system?.avgResponseTimeMs)} ${t.labels.ms}`, colors.text],
                      [t.labels.avg_cons, `${analytics?.averageConsultationDurationMinutes || 0} ${t.labels.min}`, colors.text]
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

            <Box sx={{ p: 2.5, borderRadius: '16px', border: `1px solid ${colors.line}`, bgcolor: colors.paper, mt: 4 }}>
              <Typography sx={{ fontSize: 18, mb: 2 }}>{t.sections.recent_logs}</Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, gap: 2 }}>
                {logs.length ? logs.map((log) => (
                  <Box key={log._id} sx={{ p: 1.6, borderRadius: '12px', bgcolor: '#f1f3f4', border: `1px solid ${colors.line}` }}>
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
                  <Typography sx={{ color: colors.muted, fontSize: 14.5 }}>{t.labels.no_logs}</Typography>
                )}
              </Box>
            </Box>
          </>

        )}
      </Box>
    </AdminLayout>
  );
}
