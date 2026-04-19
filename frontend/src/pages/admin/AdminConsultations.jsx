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
        <Stack direction={{ xs: 'column', lg: 'row' }} justifyContent="space-between" spacing={2} sx={{ mb: 3 }}>
          <Box>
            <Typography sx={{ fontSize: { xs: 36, md: 46 }, fontWeight: 700, fontFamily: 'Inter, sans-serif', lineHeight: 1.05 }}>Consultations</Typography>
            <Typography sx={{ mt: 1, color: colors.muted, fontSize: 18, maxWidth: 640 }}>
              All platform consultations with live feed monitoring.
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
            <Box sx={{ px: 2.5, py: 1.25, borderRadius: '12px', border: `1px solid ${colors.line}`, bgcolor: colors.paper, fontSize: 17 }}>
              {new Date().toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })}
            </Box>
            <Button
              startIcon={<ExportIcon />}
              onClick={handleExport}
              variant="contained"
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
              Export log
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
                <Box sx={{ p: 4, borderRadius: 3.5, border: `1px solid ${colors.line}`, bgcolor: colors.paper, height: '100%' }}>
                  <Stack direction="row" justifyContent="space-between" mb={4}>
                    <Typography sx={{ fontSize: 18 }}>Live consultation feed</Typography>
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
                            <Typography sx={{ fontSize: 16, fontWeight: 700 }}>{item.doctorName} ↔ {item.patientName}</Typography>
                            <Typography sx={{ fontSize: 13, color: colors.muted }}>{item.specialization} • {modeLabel[item.mode] || 'Video'} call</Typography>
                          </Box>
                          <Stack direction="row" spacing={2} alignItems="center" sx={{ flexShrink: 0 }}>
                            <Chip
                              label={item.status}
                              size="small"
                              icon={<ModeIcon mode={item.mode} />}
                              sx={{
                                height: 26,
                                px: 1,
                                fontSize: 11,
                                fontWeight: 700,
                                bgcolor: item.flagged ? colors.redSoft : colors.soft,
                                color: item.flagged ? colors.red : colors.text
                              }}
                            />
                            <Button
                              variant={item.flagged ? 'contained' : 'outlined'}
                              size="small"
                              sx={{
                                borderRadius: 1.5,
                                textTransform: 'none',
                                minWidth: 90,
                                fontSize: 12,
                                fontWeight: 700,
                                ...(item.flagged ? { bgcolor: colors.red, '&:hover': { bgcolor: colors.red } } : { borderColor: colors.line, color: colors.text })
                              }}
                            >
                              {item.flagged ? 'Intervene' : 'Monitor'}
                            </Button>
                          </Stack>
                        </Stack>
                        {index < liveFeed.length - 1 && <Divider sx={{ mt: 3, borderColor: colors.line, opacity: 0.5 }} />}
                      </Box>
                    )) : (
                      <Typography sx={{ color: colors.muted, fontSize: 14.5 }}>No active consultations are in the live feed right now.</Typography>
                    )}
                  </Stack>
                </Box>
              </Grid>

              <Grid item xs={12} lg={5}>
                <Stack spacing={4}>
                  <Box sx={{ p: 4, borderRadius: 3.5, border: `1px solid ${colors.line}`, bgcolor: colors.paper }}>
                    <Typography sx={{ fontSize: 18, mb: 3 }}>Today&apos;s trend</Typography>
                    <Stack direction="row" spacing={1.5} alignItems="flex-end" sx={{ height: 110, mb: 2 }}>
                      {trend.map((item) => (
                        <Box key={item.label} sx={{ flex: 1, textAlign: 'center' }}>
                          <Box sx={{ height: `${Math.max(8, ((item.count || 0) / maxTrend) * 100)}px`, bgcolor: item.label === 'Peak' ? colors.green : colors.greenSoft, borderRadius: 1.2 }} />
                          <Typography sx={{ fontSize: 10, mt: 1, fontWeight: 700, color: colors.muted }}>{item.label}</Typography>
                        </Box>
                      ))}
                    </Stack>
                    <Stack direction="row" flexWrap="wrap" gap={2} sx={{ mt: 3 }}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: colors.green }} />
                        <Typography sx={{ fontSize: 12, fontWeight: 600 }}>Video ({formatPercent(modes.video)})</Typography>
                      </Stack>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: colors.blue }} />
                        <Typography sx={{ fontSize: 12, fontWeight: 600 }}>Audio ({formatPercent(modes.audio)})</Typography>
                      </Stack>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: colors.line }} />
                        <Typography sx={{ fontSize: 12, fontWeight: 600 }}>Chat ({formatPercent(modes.chat)})</Typography>
                      </Stack>
                    </Stack>
                  </Box>

                  <Box sx={{ p: 4, borderRadius: 3.5, border: `1px solid ${colors.line}`, bgcolor: colors.paper }}>
                    <Typography sx={{ fontSize: 18, mb: 3 }}>Outcomes — today</Typography>
                    <Stack spacing={2}>
                      {[
                        ['Prescription issued', formatPercent(outcomes.prescriptionIssued)],
                        ['Follow-up scheduled', formatPercent(outcomes.followUpScheduled)],
                        ['Insurance authorized', formatPercent(outcomes.insuranceAuthorized)],
                        ['Deep-ref (Consultant)', formatPercent(outcomes.deepRefConsultant)],
                        ['Avg doctor rating', `${Number(outcomes.avgDoctorRating || 0).toFixed(1)} / 5`]
                      ].map(([label, val]) => (
                        <Stack key={label} direction="row" justifyContent="space-between" alignItems="center">
                          <Typography sx={{ fontSize: 14.5, color: colors.muted }}>{label}</Typography>
                          <Typography sx={{ fontSize: 15, fontWeight: 700 }}>{val}</Typography>
                        </Stack>
                      ))}
                    </Stack>
                  </Box>

                  <Box sx={{ p: 4, borderRadius: 3.5, border: `1px solid ${colors.line}`, bgcolor: colors.paper }}>
                    <Typography sx={{ fontSize: 18, mb: 3 }}>Complaints — today</Typography>
                    <Stack spacing={2}>
                      {complaints.length ? complaints.map((item, index) => (
                        <Box key={`${item.id}-${index}`} sx={{ p: 1.8, borderRadius: 2.5, bgcolor: colors.soft, borderLeft: `4px solid ${item.severity === 'high' ? colors.red : item.severity === 'medium' ? colors.orange : colors.muted}50` }}>
                          <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Typography sx={{ fontSize: 14, fontWeight: 700 }}>{item.id}</Typography>
                            <WarningIcon sx={{ fontSize: 18, color: item.severity === 'high' ? colors.red : colors.orange }} />
                          </Stack>
                          <Typography sx={{ fontSize: 14, fontWeight: 600, color: item.severity === 'high' ? colors.red : colors.text, mt: 0.5 }}>{item.reason}</Typography>
                          <Typography sx={{ fontSize: 12.5, color: colors.muted, mt: 0.4 }}>{item.details} • {item.createdAtLabel}</Typography>
                        </Box>
                      )) : (
                        <Typography sx={{ color: colors.muted, fontSize: 14.5 }}>No complaints logged today.</Typography>
                      )}
                    </Stack>
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
