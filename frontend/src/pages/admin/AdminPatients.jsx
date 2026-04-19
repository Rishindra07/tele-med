import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Grid,
  InputAdornment,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import {
  FileDownloadRounded as ExportIcon,
  SearchRounded as SearchIcon
} from '@mui/icons-material';
import AdminLayout from '../../components/AdminLayout';
import { exportAdminReport, fetchPatientsRegistry } from '../../api/adminApi';

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
    .join('') || 'PT';

const formatToday = () =>
  new Date().toLocaleDateString('en-GB', {
    weekday: 'short',
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

export default function AdminPatients() {
  const [payload, setPayload] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [search, setSearch] = useState('');
  const [stateFilter, setStateFilter] = useState('All states');
  const [conditionFilter, setConditionFilter] = useState('All conditions');
  const [sortOrder, setSortOrder] = useState('newest');
  const [quickFilter, setQuickFilter] = useState('all');

  const loadPatients = async () => {
    try {
      setLoading(true);
      const response = await fetchPatientsRegistry();
      setPayload(response);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to load patient registry');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPatients();
  }, []);

  const summary = payload?.summary || {};
  const demographics = payload?.demographics || {};
  const patients = payload?.patients || [];
  const topConditions = payload?.topConditions || [];
  const flaggedAccounts = payload?.flaggedAccounts || [];
  const filterOptions = payload?.filters || { states: [], conditions: [] };

  const filteredPatients = useMemo(() => {
    const query = search.trim().toLowerCase();
    const result = patients.filter((patient) => {
      const matchesSearch = !query || [
        patient.full_name,
        patient.registryId,
        patient.phone,
        patient.email
      ].some((value) => String(value || '').toLowerCase().includes(query));

      const matchesState = stateFilter === 'All states' || patient.state === stateFilter;
      const matchesCondition =
        conditionFilter === 'All conditions' ||
        (patient.chronicDiseases || []).includes(conditionFilter);

      const matchesQuickFilter =
        quickFilter === 'all' ||
        (quickFilter === 'complete' && Number(patient.completionPercentage || 0) >= 70) ||
        (quickFilter === 'incomplete' && Number(patient.completionPercentage || 0) < 70) ||
        (quickFilter === 'active' && Number(patient.monthConsultations || 0) > 0) ||
        (quickFilter === 'inactive' && Number(patient.monthConsultations || 0) === 0) ||
        (quickFilter === 'flagged' && (Number(patient.duplicatePrescriptions2d || 0) >= 4 || Number(patient.openComplaints || 0) >= 2 || !patient.is_active)) ||
        (quickFilter === 'new' && patient.createdAt && new Date(patient.createdAt) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));

      return matchesSearch && matchesState && matchesCondition && matchesQuickFilter;
    });

    const sorted = [...result];
    sorted.sort((a, b) => {
      if (sortOrder === 'oldest') {
        return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
      }
      if (sortOrder === 'name') {
        return String(a.full_name || '').localeCompare(String(b.full_name || ''));
      }
      if (sortOrder === 'consultations') {
        return Number(b.totalConsultations || 0) - Number(a.totalConsultations || 0);
      }
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });

    return sorted;
  }, [patients, search, stateFilter, conditionFilter, sortOrder, quickFilter]);

  const quickFilters = useMemo(() => ([
    { key: 'all', label: 'All', count: patients.length, active: quickFilter === 'all' },
    { key: 'complete', label: '70%+', count: patients.filter((patient) => Number(patient.completionPercentage || 0) >= 70).length, active: quickFilter === 'complete' },
    { key: 'incomplete', label: '< 70%', count: patients.filter((patient) => Number(patient.completionPercentage || 0) < 70).length, active: quickFilter === 'incomplete' },
    { key: 'active', label: 'Active', count: patients.filter((patient) => Number(patient.monthConsultations || 0) > 0).length, active: quickFilter === 'active' },
    { key: 'inactive', label: 'Inactive', count: patients.filter((patient) => Number(patient.monthConsultations || 0) === 0).length, active: quickFilter === 'inactive' },
    { key: 'flagged', label: 'Flagged', count: summary.flaggedAccounts || 0, active: quickFilter === 'flagged' },
    { key: 'new', label: 'New', count: summary.registeredThisWeek || 0, active: quickFilter === 'new' }
  ]), [patients, quickFilter, summary.flaggedAccounts, summary.registeredThisWeek]);

  const metrics = useMemo(() => ([
    {
      label: 'Total registered',
      val: formatNumber(summary.totalRegistered),
      change: `+${formatNumber(summary.registeredThisWeek)}`,
      sub: 'this week',
      color: colors.green
    },
    {
      label: 'Profiles 70%+ complete',
      val: formatNumber(summary.profileCompleteCount),
      change: formatPercent(summary.profileCompleteRate),
      sub: 'of total',
      color: colors.blue
    },
    {
      label: 'Active this month',
      val: formatNumber(summary.activeThisMonth),
      change: formatPercent(summary.activeRate),
      sub: 'active rate',
      color: colors.orange
    },
    {
      label: 'Flagged accounts',
      val: formatNumber(summary.flaggedAccounts),
      change: summary.flaggedAccounts ? 'Needs review' : 'No alerts',
      sub: flaggedAccounts[0]?.risk ? `Risk: ${flaggedAccounts[0].risk}` : 'Monitoring',
      color: colors.red
    }
  ]), [summary, flaggedAccounts]);

  const demographicRows = useMemo(() => ([
    { label: 'Avg age', val: `${Number(demographics.averageAge || 0).toFixed(1)} years` },
    { label: 'Male / Female', val: `${formatPercent(demographics.maleRate)} / ${formatPercent(demographics.femaleRate)}` },
    { label: 'Rural patients', val: formatPercent(demographics.ruralRate) },
    { label: 'Urban patients', val: formatPercent(demographics.urbanRate) },
    { label: 'Profiles 70%+ complete', val: formatPercent(demographics.profileCompleteRate) },
    { label: 'Avg consultations', val: `${Number(demographics.averageConsultations || 0).toFixed(1)} / patient` }
  ]), [demographics]);

  const handleExport = async () => {
    try {
      const csv = await exportAdminReport('patients');
      downloadBlob(csv, 'admin-patients-report.csv');
      setMessage('Patient registry exported.');
    } catch (err) {
      setError(err.message || 'Failed to export patient registry');
    }
  };

  return (
    <AdminLayout>
      <Box sx={{ p: { xs: 2.5, md: 4, xl: 5 }, maxWidth: 1600, mx: 'auto' }}>
        <Stack direction={{ xs: 'column', lg: 'row' }} justifyContent="space-between" spacing={2} sx={{ mb: 3 }}>
          <Box>
            <Typography sx={{ fontSize: { xs: 36, md: 46 }, fontWeight: 700, fontFamily: 'Inter, sans-serif', lineHeight: 1.05 }}>Patients</Typography>
            <Typography sx={{ mt: 1, color: colors.muted, fontSize: 18, maxWidth: 640 }}>
              Full patient registry with live activity, demographics, and review signals.
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
                fontWeight: 700,
                '&:hover': { bgcolor: colors.blue }
              }}
            >
              Export CSV
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
              {metrics.map((stat) => (
                <Box
                  key={stat.label}
                  sx={{
                    p: 2.5,
                    borderRadius: 3.5,
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
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <Typography sx={{ fontSize: 13, fontWeight: 700, color: stat.color }}>{stat.change}</Typography>
                    <Typography sx={{ fontSize: 12, color: colors.muted }}>{stat.sub}</Typography>
                  </Stack>
                </Box>
              ))}
            </Box>

            <Grid container spacing={4}>
              <Grid item xs={12} lg={8.5}>
                <Paper sx={{ p: 0, borderRadius: '16px', border: `1px solid ${colors.line}`, boxShadow: 'none', overflow: 'hidden' }}>
                  <Box sx={{ p: 4, borderRadius: '16px', border: `1px solid ${colors.line}`, bgcolor: colors.paper, mb: 0 }}>
                    <Stack spacing={3}>
                      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ width: '100%' }}>
                        <TextField
                          value={search}
                          onChange={(event) => setSearch(event.target.value)}
                          placeholder="Search patient name, SVT ID, phone..."
                          fullWidth
                          size="small"
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <SearchIcon sx={{ color: colors.muted, fontSize: 20 }} />
                              </InputAdornment>
                            ),
                            sx: { borderRadius: 2.5, bgcolor: colors.soft, '& fieldset': { border: 'none' } }
                          }}
                        />
                        <Stack direction="row" spacing={2} sx={{ minWidth: { md: 340 } }}>
                          <TextField
                            select
                            size="small"
                            value={stateFilter}
                            onChange={(event) => setStateFilter(event.target.value)}
                            sx={{ flex: 1, minWidth: 120, '& fieldset': { borderRadius: 2.5, borderColor: colors.line } }}
                          >
                            <MenuItem value="All states">All states</MenuItem>
                            {filterOptions.states.map((state) => (
                              <MenuItem key={state} value={state}>{state}</MenuItem>
                            ))}
                          </TextField>
                          <TextField
                            select
                            size="small"
                            value={conditionFilter}
                            onChange={(event) => setConditionFilter(event.target.value)}
                            sx={{ flex: 1, minWidth: 140, '& fieldset': { borderRadius: 2.5, borderColor: colors.line } }}
                          >
                            <MenuItem value="All conditions">All conditions</MenuItem>
                            {filterOptions.conditions.map((condition) => (
                              <MenuItem key={condition} value={condition}>{condition}</MenuItem>
                            ))}
                          </TextField>
                        </Stack>
                      </Stack>
                      <Stack direction="row" flexWrap="wrap" gap={1.5} sx={{ mt: 2, rowGap: 2 }}>
                        {quickFilters.map((pill) => (
                          <Chip
                            key={pill.key}
                            label={`${pill.label} (${pill.count})`}
                            onClick={() => setQuickFilter(pill.key)}
                            sx={{
                              borderRadius: '12px',
                              height: 32,
                              px: 0.5,
                              fontSize: 12.5,
                              fontWeight: 600,
                              bgcolor: pill.active ? colors.blueSoft : 'transparent',
                              color: pill.active ? colors.blue : colors.muted,
                              border: `1px solid ${pill.active ? colors.blue : colors.line}`,
                              transition: '0.2s',
                              '&:hover': { bgcolor: colors.soft }
                            }}
                          />
                        ))}
                      </Stack>
                    </Stack>
                  </Box>

                  <Box>
                    <Box sx={{ borderRadius: '16px', border: `1px solid ${colors.line}`, bgcolor: colors.paper, overflow: 'hidden' }}>
                    <Box sx={{ px: 4, py: 2, bgcolor: colors.soft, display: { xs: 'none', md: 'flex' }, alignItems: 'center', width: '100%' }}>
                      <Typography sx={{ fontSize: 11, fontWeight: 700, color: colors.muted, width: '30%', letterSpacing: 1.2, textTransform: 'uppercase' }}>Patient</Typography>
                      <Typography sx={{ fontSize: 11, fontWeight: 700, color: colors.muted, width: '18%', letterSpacing: 1.2, textTransform: 'uppercase' }}>Registry ID</Typography>
                      <Typography sx={{ fontSize: 11, fontWeight: 700, color: colors.muted, width: '22%', letterSpacing: 1.2, textTransform: 'uppercase' }}>Location</Typography>
                      <Typography sx={{ fontSize: 11, fontWeight: 700, color: colors.muted, width: '18%', letterSpacing: 1.2, textTransform: 'uppercase' }}>Conditions</Typography>
                      <Typography sx={{ fontSize: 11, fontWeight: 700, color: colors.muted, width: '12%', textAlign: 'right', letterSpacing: 1.2, textTransform: 'uppercase' }}>Status</Typography>
                    </Box>
                    {filteredPatients.length ? filteredPatients.slice(0, 50).map((patient, index) => {
                      const isFlagged = Number(patient.duplicatePrescriptions2d || 0) >= 4 || Number(patient.openComplaints || 0) >= 2 || !patient.is_active;
                      return (
                        <Box key={patient.userId} sx={{ px: 4, py: 2.5, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: { md: 'center' }, borderBottom: index === Math.min(filteredPatients.length, 50) - 1 ? 'none' : `1px solid ${colors.line}`, '&:hover': { bgcolor: '#fbfbfb' } }}>
                          <Stack direction="row" spacing={2.5} sx={{ width: { xs: '100%', md: '30%' }, mb: { xs: 1.5, md: 0 } }}>
                            <Avatar sx={{ width: 44, height: 44, bgcolor: colors.blueSoft, color: colors.blue, fontWeight: 700, fontSize: 14 }}>
                              {getInitials(patient.full_name)}
                            </Avatar>
                            <Box sx={{ minWidth: 0 }}>
                              <Typography sx={{ fontSize: 15, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{patient.full_name}</Typography>
                              <Typography sx={{ fontSize: 12.5, color: colors.muted }}>{patient.phone}</Typography>
                            </Box>
                          </Stack>
                          <Box sx={{ width: { xs: '100%', md: '18%' }, mb: { xs: 1, md: 0 } }}>
                            <Typography sx={{ fontSize: 14, fontWeight: 700 }}>{patient.registryId}</Typography>
                            <Typography sx={{ fontSize: 12, color: colors.muted }}>{patient.totalConsultations} consults</Typography>
                          </Box>
                          <Box sx={{ width: { xs: '100%', md: '22%' }, mb: { xs: 1, md: 0 } }}>
                            <Typography sx={{ fontSize: 14, color: colors.text, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {patient.location?.label || 'Not added'}
                            </Typography>
                          </Box>
                          <Box sx={{ width: { xs: '100%', md: '18%' }, mb: { xs: 1.5, md: 0 } }}>
                            <Typography sx={{ fontSize: 14, color: colors.muted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {patient.chronicDiseases?.length ? patient.chronicDiseases.slice(0, 2).join(', ') : 'General'}
                            </Typography>
                          </Box>
                          <Box sx={{ width: { xs: '100%', md: '12%' }, textAlign: { md: 'right' } }}>
                            <Chip
                              label={isFlagged ? 'Flagged' : patient.monthConsultations > 0 ? 'Active' : 'Quiet'}
                              size="small"
                              sx={{
                                borderRadius: 1.5,
                                fontWeight: 700,
                                bgcolor: isFlagged ? colors.redSoft : patient.monthConsultations > 0 ? colors.greenSoft : colors.soft,
                                color: isFlagged ? colors.red : patient.monthConsultations > 0 ? colors.green : colors.text
                              }}
                            />
                          </Box>
                        </Box>
                      );
                    }) : (
                      <Box sx={{ px: 4, py: 5 }}>
                        <Typography sx={{ color: colors.muted, fontSize: 14.5 }}>No patients match the current filters.</Typography>
                      </Box>
                    )}
                  </Box>
                  </Box>
                </Paper>
              </Grid>

              <Grid item xs={12} lg={3.5}>
                <Stack spacing={4}>
                  <Box sx={{ p: 4, borderRadius: '16px', border: `1px solid ${colors.line}`, bgcolor: colors.paper }}>
                    <Typography sx={{ fontSize: 18, mb: 3 }}>Patient demographics</Typography>
                    <Stack spacing={2}>
                      {demographicRows.map((row) => (
                        <Stack key={row.label} direction="row" justifyContent="space-between" alignItems="center">
                          <Typography sx={{ fontSize: 14.5, color: colors.muted }}>{row.label}</Typography>
                          <Typography sx={{ fontSize: 15, fontWeight: 800 }}>{row.val}</Typography>
                        </Stack>
                      ))}
                    </Stack>
                  </Box>

                  <Box sx={{ p: 4, borderRadius: '16px', border: `1px solid ${colors.line}`, bgcolor: colors.paper }}>
                    <Typography sx={{ fontSize: 18, mb: 3 }}>Top conditions</Typography>
                    <Stack spacing={2.5}>
                      {topConditions.length ? topConditions.map((condition) => (
                        <Box key={condition.name}>
                          <Stack direction="row" justifyContent="space-between">
                            <Typography sx={{ fontSize: 14.5, fontWeight: 700 }}>{condition.name}</Typography>
                            <Typography sx={{ fontSize: 14.5, color: colors.muted }}>{formatPercent(condition.percentage)}</Typography>
                          </Stack>
                          <Box sx={{ mt: 1, height: 6, bgcolor: colors.soft, borderRadius: 3, overflow: 'hidden' }}>
                            <Box sx={{ width: `${Math.min(condition.percentage, 100)}%`, height: '100%', bgcolor: colors.blue }} />
                          </Box>
                        </Box>
                      )) : (
                        <Typography sx={{ color: colors.muted, fontSize: 14.5 }}>No condition data yet.</Typography>
                      )}
                    </Stack>
                  </Box>

                  <Box sx={{ p: 4, borderRadius: '16px', border: `1px solid ${colors.line}`, bgcolor: colors.paper }}>
                    <Typography sx={{ fontSize: 18, mb: 3 }}>Flagged accounts</Typography>
                    <Stack spacing={2.5}>
                      {flaggedAccounts.length ? flaggedAccounts.map((item) => (
                        <Box key={item.registryId} sx={{ p: 1.8, borderRadius: '12px', bgcolor: colors.soft, borderLeft: `4px solid ${item.risk === 'High' ? colors.red : colors.orange}` }}>
                          <Typography sx={{ fontSize: 14.5, fontWeight: 800 }}>{item.registryId}</Typography>
                          <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: item.risk === 'High' ? colors.red : colors.orange, mt: 0.5 }}>{item.reason}</Typography>
                          <Typography sx={{ fontSize: 12.5, color: colors.muted, mt: 0.4 }}>{item.description}</Typography>
                        </Box>
                      )) : (
                        <Typography sx={{ color: colors.muted, fontSize: 14.5 }}>No flagged patient accounts right now.</Typography>
                      )}
                    </Stack>
                    <Button fullWidth onClick={() => setQuickFilter('flagged')} sx={{ mt: 4, bgcolor: colors.text, color: '#fff', textTransform: 'none', borderRadius: '12px', fontWeight: 800, py: 1.4, '&:hover': { bgcolor: '#000' } }}>
                      Review flags
                    </Button>
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
