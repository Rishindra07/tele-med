import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  Paper,
  Stack,
  Typography
} from '@mui/material';
import {
  FileDownloadRounded as ExportIcon,
  GraphicEqRounded as AudioIcon,
  VideocamRounded as VideoIcon,
  ChatRounded as ChatIcon,
  WarningRounded as WarningIcon
} from '@mui/icons-material';
import AdminLayout from '../../components/AdminLayout';
import { exportAdminReport, fetchConsultationMonitor } from '../../api/adminApi';

const colors = {
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
  orangeSoft: '#fff7ed'
};

const formatNumber = (value) => new Intl.NumberFormat('en-IN').format(Number(value || 0));
const formatPercent = (value) => `${Number(value || 0).toFixed(value % 1 === 0 ? 0 : 1)}%`;

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
    .join('') || 'CT';

const modeLabel = {
  video: 'Video',
  audio: 'Audio',
  chat: 'Chat',
  in_person: 'In-person'
};

const ModeIcon = ({ mode }) => {
  if (mode === 'audio') return <AudioIcon sx={{ fontSize: 16 }} />;
  if (mode === 'chat') return <ChatIcon sx={{ fontSize: 16 }} />;
  return <VideoIcon sx={{ fontSize: 16 }} />;
};

export default function AdminConsultations() {
  const [payload, setPayload] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadMonitor = async () => {
    try {
      setLoading(true);
      const response = await fetchConsultationMonitor();
      setPayload(response);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to load consultation monitor');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMonitor();
  }, []);

  const summary = payload?.summary || {};
  const liveFeed = payload?.liveFeed || [];
  const trend = payload?.trend || [];
  const modes = payload?.modes || {};
  const outcomes = payload?.outcomes || {};
  const complaints = payload?.complaints || [];

  const stats = useMemo(() => ([
    {
      label: 'Live now',
      val: formatNumber(summary.liveNow),
      change: `Across ${formatNumber(summary.specializations)} specializations`,
      color: colors.green
    },
    {
      label: 'Today so far',
      val: formatNumber(summary.todaySoFar),
      change: `${summary.todayGrowth >= 0 ? '+' : ''}${summary.todayGrowth || 0}% vs yesterday`,
      color: colors.blue
    },
    {
      label: 'Avg duration',
      val: `${Number(summary.avgDurationMinutes || 0).toFixed(1)}m`,
      change: 'Across platform activity',
      color: colors.orange
    },
    {
      label: 'Complaints today',
      val: formatNumber(summary.complaintsToday),
      change: 'Live complaint queue',
      color: colors.red
    }
  ]), [summary]);

  const maxTrend = Math.max(1, ...trend.map((item) => item.count || 0));

  const handleExport = async () => {
    try {
      const csv = await exportAdminReport('consultations');
      downloadBlob(csv, 'admin-consultations-report.csv');
      setMessage('Consultation log exported.');
    } catch (err) {
      setError(err.message || 'Failed to export consultation log');
    }
  };

  return (
    <AdminLayout>
      <Box sx={{ p: { xs: 2.5, md: 4, xl: 5 }, maxWidth: 1600, mx: 'auto' }}>
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems="flex-start" spacing={2} sx={{ mb: 4 }}>
          <Box>
            <Typography sx={{ fontSize: 32, fontWeight: 700, fontFamily: 'Georgia, serif' }}>Consultations</Typography>
            <Typography sx={{ mt: 0.5, color: colors.muted, fontSize: 14.5 }}>
              All platform consultations with live feed monitoring.
            </Typography>
          </Box>
          <Button startIcon={<ExportIcon />} onClick={handleExport} variant="contained" sx={{ bgcolor: colors.text, color: '#fff', borderRadius: 2.5, px: 3, py: 1.2, textTransform: 'none', fontWeight: 600 }}>
            Export log
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
            <Grid container spacing={2.5} sx={{ mb: 5 }}>
              {stats.map((stat) => (
                <Grid item xs={12} sm={6} md={3} key={stat.label}>
                  <Paper sx={{ p: 2.5, borderRadius: 4, border: `1px solid ${colors.line}`, boxShadow: 'none' }}>
                    <Typography sx={{ fontSize: 13, color: colors.muted, fontWeight: 600, mb: 1.5 }}>
                      <Box component="span" sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: stat.color, display: 'inline-block', mr: 1 }} />
                      {stat.label}
                    </Typography>
                    <Typography sx={{ fontSize: 28, fontWeight: 700, mb: 0.5 }}>{stat.val}</Typography>
                    <Typography sx={{ fontSize: 12, color: colors.muted }}>{stat.change}</Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>

            <Grid container spacing={4}>
              <Grid item xs={12} lg={7}>
                <Paper sx={{ p: 4, borderRadius: 5, border: `1px solid ${colors.line}`, boxShadow: 'none' }}>
                  <Stack direction="row" justifyContent="space-between" mb={4}>
                    <Typography sx={{ fontSize: 18, fontWeight: 700 }}>Live consultation feed</Typography>
                    <Chip label={`${formatNumber(summary.liveNow)} active`} size="small" sx={{ bgcolor: colors.greenSoft, color: colors.green, fontWeight: 700 }} />
                  </Stack>
                  <Stack spacing={3}>
                    {liveFeed.length ? liveFeed.map((item, index) => (
                      <Box key={item.consultationId}>
                        <Stack direction="row" spacing={2.5} alignItems="center">
                          <Avatar sx={{ width: 44, height: 44, bgcolor: colors.blueSoft, color: colors.blue, fontWeight: 700 }}>
                            {getInitials(item.doctorName)}
                          </Avatar>
                          <Box sx={{ flex: 1 }}>
                            <Typography sx={{ fontSize: 15, fontWeight: 700 }}>{item.doctorName} ↔ {item.patientName}</Typography>
                            <Typography sx={{ fontSize: 12, color: colors.muted }}>{item.specialization} • {modeLabel[item.mode] || 'Video'} call</Typography>
                          </Box>
                          <Stack direction="row" spacing={2} alignItems="center">
                            <Chip
                              label={item.status}
                              size="small"
                              icon={<ModeIcon mode={item.mode} />}
                              sx={{
                                height: 22,
                                fontSize: 11,
                                fontWeight: 700,
                                bgcolor: item.flagged ? colors.redSoft : colors.soft,
                                color: item.flagged ? colors.red : colors.muted
                              }}
                            />
                            <Button
                              variant={item.flagged ? 'contained' : 'outlined'}
                              color={item.flagged ? 'error' : 'inherit'}
                              size="small"
                              sx={{ borderRadius: 1.5, textTransform: 'none', minWidth: 90 }}
                            >
                              {item.flagged ? 'Intervene' : 'Monitor'}
                            </Button>
                          </Stack>
                        </Stack>
                        {index < liveFeed.length - 1 && <Divider sx={{ mt: 3 }} />}
                      </Box>
                    )) : (
                      <Typography sx={{ color: colors.muted }}>No active consultations are in the live feed right now.</Typography>
                    )}
                  </Stack>
                </Paper>
              </Grid>

              <Grid item xs={12} lg={5}>
                <Stack spacing={4}>
                  <Paper sx={{ p: 4, borderRadius: 5, border: `1px solid ${colors.line}`, boxShadow: 'none' }}>
                    <Typography sx={{ fontSize: 16, fontWeight: 700, mb: 3 }}>Today&apos;s trend</Typography>
                    <Stack direction="row" spacing={1.5} alignItems="flex-end" sx={{ height: 110, mb: 2 }}>
                      {trend.map((item) => (
                        <Box key={item.label} sx={{ flex: 1, textAlign: 'center' }}>
                          <Box sx={{ height: `${Math.max(8, ((item.count || 0) / maxTrend) * 100)}px`, bgcolor: item.label === 'Peak' ? colors.green : colors.greenSoft, borderRadius: 1 }} />
                          <Typography sx={{ fontSize: 9, mt: 1, fontWeight: 700, color: colors.muted }}>{item.label}</Typography>
                        </Box>
                      ))}
                    </Stack>
                    <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: colors.green }} />
                        <Typography sx={{ fontSize: 11, fontWeight: 600 }}>Video ({formatPercent(modes.video)})</Typography>
                      </Stack>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: colors.blue }} />
                        <Typography sx={{ fontSize: 11, fontWeight: 600 }}>Audio ({formatPercent(modes.audio)})</Typography>
                      </Stack>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: colors.soft }} />
                        <Typography sx={{ fontSize: 11, fontWeight: 600 }}>Chat ({formatPercent(modes.chat)})</Typography>
                      </Stack>
                    </Stack>
                  </Paper>

                  <Paper sx={{ p: 4, borderRadius: 5, border: `1px solid ${colors.line}`, boxShadow: 'none' }}>
                    <Typography sx={{ fontSize: 16, fontWeight: 700, mb: 3 }}>Outcomes — today</Typography>
                    <Stack spacing={2}>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography sx={{ fontSize: 13, color: colors.muted, fontWeight: 500 }}>Prescription issued</Typography>
                        <Typography sx={{ fontSize: 14, fontWeight: 700 }}>{formatPercent(outcomes.prescriptionIssued)}</Typography>
                      </Stack>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography sx={{ fontSize: 13, color: colors.muted, fontWeight: 500 }}>Follow-up scheduled</Typography>
                        <Typography sx={{ fontSize: 14, fontWeight: 700 }}>{formatPercent(outcomes.followUpScheduled)}</Typography>
                      </Stack>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography sx={{ fontSize: 13, color: colors.muted, fontWeight: 500 }}>Insurance authorized</Typography>
                        <Typography sx={{ fontSize: 14, fontWeight: 700 }}>{formatPercent(outcomes.insuranceAuthorized)}</Typography>
                      </Stack>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography sx={{ fontSize: 13, color: colors.muted, fontWeight: 500 }}>Deep-ref (Consultant)</Typography>
                        <Typography sx={{ fontSize: 14, fontWeight: 700 }}>{formatPercent(outcomes.deepRefConsultant)}</Typography>
                      </Stack>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography sx={{ fontSize: 13, color: colors.muted, fontWeight: 500 }}>Avg doctor rating</Typography>
                        <Typography sx={{ fontSize: 14, fontWeight: 700 }}>{Number(outcomes.avgDoctorRating || 0).toFixed(1)} / 5</Typography>
                      </Stack>
                    </Stack>
                  </Paper>

                  <Paper sx={{ p: 4, borderRadius: 5, border: `1px solid ${colors.line}`, boxShadow: 'none' }}>
                    <Typography sx={{ fontSize: 16, fontWeight: 700, mb: 2.5 }}>Complaints — today</Typography>
                    <Stack spacing={2}>
                      {complaints.length ? complaints.map((item, index) => (
                        <Box key={`${item.id}-${index}`} sx={{ p: 1.5, borderRadius: 3, border: `1px solid ${colors.line}`, borderLeft: `4px solid ${item.severity === 'high' ? colors.red : item.severity === 'medium' ? colors.orange : colors.soft}` }}>
                          <Typography sx={{ fontSize: 13, fontWeight: 700 }}>
                            {item.id} <WarningIcon sx={{ fontSize: 14, color: item.severity === 'high' ? colors.red : colors.orange, verticalAlign: 'middle', ml: 0.5 }} />
                          </Typography>
                          <Typography sx={{ fontSize: 12, fontWeight: 600, color: item.severity === 'high' ? colors.red : colors.text, mt: 0.5 }}>{item.reason}</Typography>
                          <Typography sx={{ fontSize: 11, color: colors.muted, mt: 0.2 }}>{item.details} • {item.createdAtLabel}</Typography>
                        </Box>
                      )) : (
                        <Typography sx={{ color: colors.muted }}>No complaints logged today.</Typography>
                      )}
                    </Stack>
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
