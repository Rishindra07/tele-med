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
import { exportAdminReport, fetchAdminAnalytics } from '../../api/adminApi';

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

const OutcomeRow = ({ label, value, color }) => (
  <Stack direction="row" alignItems="center" spacing={1}>
    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: color }} />
    <Typography sx={{ fontSize: 13, color: colors.muted, flex: 1 }}>{label}</Typography>
    <Typography sx={{ fontSize: 13, fontWeight: 700 }}>{formatPercent(value)}</Typography>
  </Stack>
);

const MetricRow = ({ label, val, showBar, color = colors.green }) => (
  <Box>
    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={showBar ? 1 : 0}>
      <Typography sx={{ fontSize: 13, color: colors.muted, fontWeight: 500 }}>{label}</Typography>
      <Typography sx={{ fontSize: 15, fontWeight: 800 }}>{val}</Typography>
    </Stack>
    {showBar && (
      <Box sx={{ height: 4, bgcolor: colors.soft, borderRadius: 2, overflow: 'hidden' }}>
        <Box sx={{ width: val, height: '100%', bgcolor: color }} />
      </Box>
    )}
  </Box>
);

export default function AdminAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const response = await fetchAdminAnalytics();
        setAnalytics(response.analytics || null);
      } catch (err) {
        setError(err.message || 'Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const growthStats = useMemo(() => {
    const growth = analytics?.growth || {};
    return [
      ['Total patients', formatNumber(growth.totalPatients), `${growth.patientGrowthRate >= 0 ? '+' : ''}${growth.patientGrowthRate || 0}%`, 'vs last month', colors.green],
      ['Consultations / day', formatNumber(growth.consultationsPerDay), `${growth.consultationsDayGrowth >= 0 ? '+' : ''}${growth.consultationsDayGrowth || 0}%`, 'this week', colors.blue],
      ['Rx fulfilment rate', formatPercent(analytics?.pharmacyFulfillment?.rate || 0), 'Live', 'from current data', colors.blue],
      ['Avg patient retention', formatPercent(growth.retentionRate || 0), 'Return within', '30 days', colors.orange]
    ];
  }, [analytics]);

  const acquisition = analytics?.acquisition || {};
  const outcomes = analytics?.consultationOutcomes || {};
  const modes = analytics?.consultationModes || {};
  const topStates = analytics?.topStates || [];
  const hourlyConsultations = analytics?.hourlyConsultations || [];
  const monthlyGrowth = analytics?.monthlyGrowth || [];
  const engagement = analytics?.engagement || {};

  const maxMonthly = Math.max(1, ...monthlyGrowth.map((item) => Math.max(item.newPatients || 0, item.consultations || 0)));
  const maxHourly = Math.max(1, ...hourlyConsultations.map((item) => item.count || 0));

  const handleExport = async () => {
    try {
      const csv = await exportAdminReport('overview');
      downloadBlob(csv, 'admin-overview-report.csv');
      setMessage('Analytics report downloaded.');
    } catch (err) {
      setError(err.message || 'Failed to export analytics report');
    }
  };

  return (
    <AdminLayout>
      <Box sx={{ p: { xs: 2.5, md: 4, xl: 5 }, maxWidth: 1600, mx: 'auto' }}>
        <Stack direction={{ xs: 'column', lg: 'row' }} justifyContent="space-between" spacing={2} sx={{ mb: 3 }}>
          <Box>
            <Typography sx={{ fontSize: { xs: 36, md: 46 }, fontWeight: 700, fontFamily: 'Inter, sans-serif', lineHeight: 1.05 }}>Analytics</Typography>
            <Typography sx={{ mt: 1, color: colors.muted, fontSize: 18, maxWidth: 640 }}>
              Platform-wide growth, engagement and health metrics
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
            <Box sx={{ px: 2.5, py: 1.25, borderRadius: '12px', border: `1px solid ${colors.line}`, bgcolor: colors.paper, fontSize: 17 }}>
              {new Date().toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })}
            </Box>
            <Button
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
              Export report
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
              {growthStats.map(([label, val, change, sub, color]) => (
                <Box
                  key={label}
                  sx={{
                    p: 2.5,
                    borderRadius: '12px',
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
                  <Typography sx={{ fontSize: 30, lineHeight: 1, mb: 1 }}>{val}</Typography>
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <Typography sx={{ fontSize: 13, fontWeight: 700, color }}>{change}</Typography>
                    <Typography sx={{ fontSize: 12, color: colors.muted }}>{sub}</Typography>
                  </Stack>
                </Box>
              ))}
            </Box>

            <Grid container spacing={4} sx={{ mb: 5 }}>
              <Grid item xs={12} lg={8}>
                <Box sx={{ p: 4, borderRadius: '16px', border: `1px solid ${colors.line}`, bgcolor: colors.paper, height: '100%' }}>
                  <Typography sx={{ fontSize: 18, mb: 4 }}>Patient & consultation growth</Typography>
                  <Box sx={{ height: 260, borderBottom: `1px solid ${colors.line}`, mb: 4, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 1 }}>
                    {monthlyGrowth.map((item) => (
                      <Box key={item.label} sx={{ flex: 1, textAlign: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 0.4, height: 210 }}>
                          <Box sx={{ width: '38%', bgcolor: colors.green, borderRadius: '4px 4px 0 0', height: `${Math.max(8, ((item.newPatients || 0) / maxMonthly) * 190)}px` }} />
                          <Box sx={{ width: '38%', bgcolor: colors.blue, borderRadius: '4px 4px 0 0', height: `${Math.max(8, ((item.consultations || 0) / maxMonthly) * 190)}px`, opacity: 0.65 }} />
                        </Box>
                        <Typography sx={{ fontSize: 11, color: colors.muted, mt: 1 }}>{item.label}</Typography>
                      </Box>
                    ))}
                  </Box>
                  <Stack direction="row" spacing={3}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: colors.green }} />
                      <Typography sx={{ fontSize: 12, color: colors.muted }}>New patients</Typography>
                    </Stack>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: colors.blue }} />
                      <Typography sx={{ fontSize: 12, color: colors.muted }}>Consultations</Typography>
                    </Stack>
                  </Stack>
                </Box>
              </Grid>

              <Grid item xs={12} lg={4}>
                <Stack spacing={4}>
                  <Box sx={{ p: 4, borderRadius: '16px', border: `1px solid ${colors.line}`, bgcolor: colors.paper }}>
                    <Typography sx={{ fontSize: 18, mb: 3 }}>Patient acquisition</Typography>
                    <Stack spacing={2}>
                      {[
                        ['App installs', formatNumber(acquisition.appInstalls), '100%'],
                        ['Registrations', formatNumber(acquisition.registrations), formatPercent(acquisition.registrationRate)],
                        ['First consultation', formatNumber(acquisition.firstConsultation), formatPercent(acquisition.firstConsultationRate)],
                        ['Retained (30d)', formatNumber(acquisition.retained30d), formatPercent(acquisition.retained30dRate)]
                      ].map(([label, val, perc]) => (
                        <Box key={label} sx={{ p: 1.8, borderRadius: '12px', bgcolor: colors.soft }}>
                          <Stack direction="row" alignItems="center" justifyContent="space-between">
                            <Typography sx={{ fontSize: 15, fontWeight: 600 }}>{label}</Typography>
                            <Box sx={{ textAlign: 'right' }}>
                              <Typography sx={{ fontSize: 15, fontWeight: 800 }}>{val}</Typography>
                              <Typography sx={{ fontSize: 12, color: colors.muted }}>{perc}</Typography>
                            </Box>
                          </Stack>
                        </Box>
                      ))}
                    </Stack>
                  </Box>

                  <Box sx={{ p: 3, borderRadius: '16px', border: `1px solid ${colors.line}`, bgcolor: colors.paper }}>
                    <Typography sx={{ fontSize: 18, mb: 2 }}>Outcome summary</Typography>
                    <Stack spacing={1.5} sx={{ mb: 4, p: 2, borderRadius: '12px', bgcolor: colors.soft }}>
                      <OutcomeRow color={colors.green} label="Prescription issued" value={outcomes.prescriptionIssued} />
                      <OutcomeRow color={colors.orange} label="Follow-up booked" value={outcomes.followUpBooked} />
                      <OutcomeRow color={colors.blue} label="Escalated" value={outcomes.escalated} />
                    </Stack>
                    <Stack spacing={2}>
                      <MetricRow label="Video call" val={formatPercent(modes.video)} showBar color={colors.green} />
                      <MetricRow label="Audio call" val={formatPercent(modes.audio)} showBar color={colors.blue} />
                      <MetricRow label="Chat / async" val={formatPercent(modes.chat)} showBar color={colors.muted} />
                    </Stack>
                  </Box>
                </Stack>
              </Grid>
            </Grid>

            <Grid container spacing={4}>
              <Grid item xs={12} lg={4}>
                <Box sx={{ p: 4, borderRadius: '16px', border: `1px solid ${colors.line}`, bgcolor: colors.paper, height: '100%' }}>
                  <Typography sx={{ fontSize: 18, mb: 4 }}>Top states by patients</Typography>
                  <Stack spacing={2.5}>
                    {topStates.map((state, index) => (
                      <Stack key={state.state} direction="row" alignItems="center" spacing={2}>
                        <Typography sx={{ fontSize: 12, color: colors.muted, width: 20 }}>{index + 1}</Typography>
                        <Typography sx={{ fontSize: 13.5, fontWeight: 600, width: 130 }}>{state.state}</Typography>
                        <Box sx={{ flex: 1, height: 8, bgcolor: colors.soft, borderRadius: 4, overflow: 'hidden' }}>
                          <Box sx={{ width: `${(state.patients / Math.max(...topStates.map((item) => item.patients), 1)) * 100}%`, height: '100%', bgcolor: colors.green }} />
                        </Box>
                        <Typography sx={{ fontSize: 13.5, fontWeight: 700, width: 55, textAlign: 'right' }}>{formatNumber(state.patients)}</Typography>
                      </Stack>
                    ))}
                  </Stack>
                </Box>
              </Grid>

              <Grid item xs={12} lg={8}>
                <Grid container spacing={4}>
                  <Grid item xs={12} md={7}>
                    <Box sx={{ p: 4, borderRadius: '16px', border: `1px solid ${colors.line}`, bgcolor: colors.paper, height: '100%' }}>
                      <Typography sx={{ fontSize: 18, mb: 2 }}>Heatmap (by hour)</Typography>
                      <Typography sx={{ fontSize: 13, color: colors.muted, mb: 4 }}>Avg consultations per hour · Past 30 days</Typography>
                      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 1, mb: 2 }}>
                        {hourlyConsultations.map((item) => {
                          const intensity = item.count / maxHourly;
                          return (
                            <Box
                              key={item.hour}
                              sx={{
                                aspectRatio: '1',
                                borderRadius: 1.2,
                                bgcolor: intensity > 0.75 ? colors.green : intensity > 0.45 ? '#88d3a6' : intensity > 0.2 ? colors.greenSoft : '#eef6f1'
                              }}
                            />
                          );
                        })}
                      </Box>
                      <Stack direction="row" justifyContent="space-between" mb={4}>
                        {['12 AM', '6 AM', '12 PM', '6 PM', '11 PM'].map((label) => (
                          <Typography key={label} sx={{ fontSize: 10, color: colors.muted }}>{label}</Typography>
                        ))}
                      </Stack>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography sx={{ fontSize: 10, color: colors.muted }}>Low</Typography>
                        <Box sx={{ flex: 1, height: 4, borderRadius: 2, background: `linear-gradient(to right, #eef6f1, ${colors.green})` }} />
                        <Typography sx={{ fontSize: 10, color: colors.muted }}>High</Typography>
                      </Stack>
                    </Box>
                  </Grid>

                  <Grid item xs={12} md={5}>
                    <Box sx={{ p: 4, borderRadius: '16px', border: `1px solid ${colors.line}`, bgcolor: colors.paper, height: '100%' }}>
                      <Typography sx={{ fontSize: 18, mb: 3 }}>Engagement metrics</Typography>
                      <Stack spacing={3.5}>
                        <MetricRow label="Avg session duration" val={`${analytics?.averageConsultationDurationMinutes || 0} min`} />
                        <MetricRow label="Symptom checker usage" val={formatPercent(engagement.symptomCheckerUsageRate)} showBar color={colors.green} />
                        <MetricRow label="Offline mode usage" val={formatPercent(engagement.offlineModeUsageRate)} showBar color={colors.blue} />
                        <MetricRow label="Rural (non-urban) patients" val={formatPercent(engagement.ruralPatientRate)} />
                      </Stack>
                    </Box>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </>
        )}
      </Box>
    </AdminLayout>
  );
}
