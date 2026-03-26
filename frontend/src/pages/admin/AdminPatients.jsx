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
    { key: 'complete', label: '70%+ complete', count: patients.filter((patient) => Number(patient.completionPercentage || 0) >= 70).length, active: quickFilter === 'complete' },
    { key: 'incomplete', label: 'Below 70%', count: patients.filter((patient) => Number(patient.completionPercentage || 0) < 70).length, active: quickFilter === 'incomplete' },
    { key: 'active', label: 'Active', count: patients.filter((patient) => Number(patient.monthConsultations || 0) > 0).length, active: quickFilter === 'active' },
    { key: 'inactive', label: 'Inactive', count: patients.filter((patient) => Number(patient.monthConsultations || 0) === 0).length, active: quickFilter === 'inactive' },
    { key: 'flagged', label: 'Flagged', count: summary.flaggedAccounts || 0, active: quickFilter === 'flagged' },
    { key: 'new', label: 'New this week', count: summary.registeredThisWeek || 0, active: quickFilter === 'new' }
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
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems="flex-start" spacing={2} sx={{ mb: 4 }}>
          <Box>
            <Typography sx={{ fontSize: 32, fontWeight: 700, fontFamily: 'Georgia, serif' }}>
              Patients
            </Typography>
            <Typography sx={{ mt: 0.5, color: colors.muted, fontSize: 14.5 }}>
              Full patient registry with live activity, demographics, and review signals.
            </Typography>
          </Box>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box sx={{ px: 2, py: 1.2, borderRadius: 2.5, bgcolor: '#fff', border: `1px solid ${colors.line}` }}>
              <Typography sx={{ fontSize: 13, fontWeight: 600 }}>{formatToday()}</Typography>
            </Box>
            <Button
              startIcon={<ExportIcon />}
              onClick={handleExport}
              variant="contained"
              sx={{ bgcolor: colors.text, color: '#fff', borderRadius: 2.5, px: 3, py: 1.2, textTransform: 'none', fontWeight: 600, '&:hover': { bgcolor: '#000' } }}
            >
              Export CSV
            </Button>
          </Stack>
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
              {metrics.map((stat) => (
                <Grid item xs={12} sm={6} md={3} key={stat.label}>
                  <Paper sx={{ p: 2.5, borderRadius: 4, border: `1px solid ${colors.line}`, boxShadow: 'none' }}>
                    <Typography sx={{ fontSize: 13, color: colors.muted, fontWeight: 600, mb: 1.5 }}>
                      <Box component="span" sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: stat.color, display: 'inline-block', mr: 1 }} />
                      {stat.label}
                    </Typography>
                    <Typography sx={{ fontSize: 28, fontWeight: 700, mb: 0.5 }}>{stat.val}</Typography>
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      <Typography sx={{ fontSize: 13, fontWeight: 700, color: stat.color }}>
                        {stat.change}
                      </Typography>
                      <Typography sx={{ fontSize: 12, color: colors.muted }}>{stat.sub}</Typography>
                    </Stack>
                  </Paper>
                </Grid>
              ))}
            </Grid>

            <Grid container spacing={4}>
              <Grid item xs={12} lg={8.5}>
                <Paper sx={{ p: 0, borderRadius: 5, border: `1px solid ${colors.line}`, boxShadow: 'none', overflow: 'hidden' }}>
                  <Box sx={{ p: 3, bgcolor: '#fff', borderBottom: `1px solid ${colors.line}` }}>
                    <Stack spacing={2}>
                      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                        <TextField
                          value={search}
                          onChange={(event) => setSearch(event.target.value)}
                          placeholder="Search patient name, SVT ID, phone, or email..."
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
                        <TextField
                          select
                          size="small"
                          value={stateFilter}
                          onChange={(event) => setStateFilter(event.target.value)}
                          sx={{ minWidth: 150, '& fieldset': { borderRadius: 2.5, borderColor: colors.line } }}
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
                          sx={{ minWidth: 170, '& fieldset': { borderRadius: 2.5, borderColor: colors.line } }}
                        >
                          <MenuItem value="All conditions">All conditions</MenuItem>
                          {filterOptions.conditions.map((condition) => (
                            <MenuItem key={condition} value={condition}>{condition}</MenuItem>
                          ))}
                        </TextField>
                        <TextField
                          select
                          size="small"
                          value={sortOrder}
                          onChange={(event) => setSortOrder(event.target.value)}
                          sx={{ minWidth: 150, '& fieldset': { borderRadius: 2.5, borderColor: colors.line } }}
                        >
                          <MenuItem value="newest">Sort: Newest</MenuItem>
                          <MenuItem value="oldest">Sort: Oldest</MenuItem>
                          <MenuItem value="name">Sort: Name</MenuItem>
                          <MenuItem value="consultations">Sort: Consultations</MenuItem>
                        </TextField>
                      </Stack>

                      <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                        {quickFilters.map((pill) => (
                          <Chip
                            key={pill.key}
                            label={`${pill.label} ${formatNumber(pill.count)}`}
                            onClick={() => setQuickFilter(pill.key)}
                            sx={{
                              borderRadius: 2,
                              height: 32,
                              fontSize: 13,
                              fontWeight: 600,
                              bgcolor: pill.active ? colors.green : 'transparent',
                              color: pill.active ? '#fff' : colors.muted,
                              border: pill.active ? 'none' : `1px solid ${colors.line}`,
                              '&:hover': { bgcolor: pill.active ? colors.green : colors.soft }
                            }}
                          />
                        ))}
                      </Stack>
                    </Stack>
                  </Box>

                  <Box>
                    <Box sx={{ px: 3, py: 2, bgcolor: colors.soft, display: 'flex', alignItems: 'center' }}>
                      <Typography sx={{ fontSize: 12, fontWeight: 700, color: colors.muted, width: '34%' }}>Patient</Typography>
                      <Typography sx={{ fontSize: 12, fontWeight: 700, color: colors.muted, width: '18%' }}>ID</Typography>
                      <Typography sx={{ fontSize: 12, fontWeight: 700, color: colors.muted, width: '20%' }}>Location</Typography>
                      <Typography sx={{ fontSize: 12, fontWeight: 700, color: colors.muted, width: '16%' }}>Conditions</Typography>
                      <Typography sx={{ fontSize: 12, fontWeight: 700, color: colors.muted, width: '12%', textAlign: 'right' }}>Status</Typography>
                    </Box>

                    {filteredPatients.length ? filteredPatients.slice(0, 50).map((patient, index) => {
                      const isFlagged = Number(patient.duplicatePrescriptions2d || 0) >= 4 || Number(patient.openComplaints || 0) >= 2 || !patient.is_active;
                      return (
                        <Box key={patient.userId} sx={{ px: 3, py: 2.5, display: 'flex', alignItems: 'center', borderBottom: index === Math.min(filteredPatients.length, 50) - 1 ? 'none' : `1px solid ${colors.line}` }}>
                          <Stack direction="row" spacing={2} sx={{ width: '34%' }}>
                            <Avatar sx={{ bgcolor: colors.blueSoft, color: colors.blue, fontWeight: 700, fontSize: 13 }}>
                              {getInitials(patient.full_name)}
                            </Avatar>
                            <Box>
                              <Typography sx={{ fontSize: 14, fontWeight: 700 }}>{patient.full_name}</Typography>
                              <Typography sx={{ fontSize: 12, color: colors.muted }}>{patient.phone}</Typography>
                            </Box>
                          </Stack>
                          <Box sx={{ width: '18%' }}>
                            <Typography sx={{ fontSize: 13, fontWeight: 600, color: colors.text }}>{patient.registryId}</Typography>
                            <Typography sx={{ fontSize: 11.5, color: colors.muted }}>{patient.totalConsultations} consults</Typography>
                          </Box>
                          <Typography sx={{ fontSize: 13, color: colors.muted, width: '20%' }}>{patient.location?.label || 'Not added'}</Typography>
                          <Typography sx={{ fontSize: 13, color: colors.muted, width: '16%' }}>
                            {patient.chronicDiseases?.length ? patient.chronicDiseases.slice(0, 2).join(', ') : 'General'}
                          </Typography>
                          <Box sx={{ width: '12%', textAlign: 'right' }}>
                            <Chip
                              label={isFlagged ? 'Flagged' : patient.monthConsultations > 0 ? 'Active' : 'Quiet'}
                              size="small"
                              sx={{
                                bgcolor: isFlagged ? colors.redSoft : patient.monthConsultations > 0 ? colors.greenSoft : colors.soft,
                                color: isFlagged ? colors.red : patient.monthConsultations > 0 ? colors.green : colors.muted
                              }}
                            />
                          </Box>
                        </Box>
                      );
                    }) : (
                      <Box sx={{ px: 3, py: 5 }}>
                        <Typography sx={{ color: colors.muted }}>No patients match the current filters.</Typography>
                      </Box>
                    )}
                  </Box>
                </Paper>
              </Grid>

              <Grid item xs={12} lg={3.5}>
                <Stack spacing={4}>
                  <Paper sx={{ p: 3, borderRadius: 5, border: `1px solid ${colors.line}`, boxShadow: 'none' }}>
                    <Typography sx={{ fontSize: 16, fontWeight: 700, mb: 3 }}>Patient demographics</Typography>
                    <Stack spacing={2.5}>
                      {demographicRows.map((row) => (
                        <Stack key={row.label} direction="row" justifyContent="space-between" alignItems="center">
                          <Typography sx={{ fontSize: 13.5, color: colors.muted, fontWeight: 500 }}>{row.label}</Typography>
                          <Typography sx={{ fontSize: 14, fontWeight: 700 }}>{row.val}</Typography>
                        </Stack>
                      ))}
                    </Stack>
                  </Paper>

                  <Paper sx={{ p: 3, borderRadius: 5, border: `1px solid ${colors.line}`, boxShadow: 'none' }}>
                    <Typography sx={{ fontSize: 16, fontWeight: 700, mb: 3 }}>Top conditions</Typography>
                    <Stack spacing={2.5}>
                      {topConditions.length ? topConditions.map((condition) => (
                        <Box key={condition.name}>
                          <Stack direction="row" justifyContent="space-between">
                            <Typography sx={{ fontSize: 13, fontWeight: 600 }}>{condition.name}</Typography>
                            <Typography sx={{ fontSize: 13, color: colors.muted }}>{formatPercent(condition.percentage)}</Typography>
                          </Stack>
                          <Box sx={{ mt: 1, height: 4, bgcolor: colors.soft, borderRadius: 2, overflow: 'hidden' }}>
                            <Box sx={{ width: `${Math.min(condition.percentage, 100)}%`, height: '100%', bgcolor: colors.blue }} />
                          </Box>
                        </Box>
                      )) : (
                        <Typography sx={{ color: colors.muted }}>No condition data yet.</Typography>
                      )}
                    </Stack>
                  </Paper>

                  <Paper sx={{ p: 3, borderRadius: 5, border: `1px solid ${colors.line}`, boxShadow: 'none' }}>
                    <Typography sx={{ fontSize: 16, fontWeight: 700, mb: 1.5 }}>
                      Flagged accounts
                      <Typography component="span" sx={{ fontSize: 12, color: colors.red, fontWeight: 700, float: 'right' }}>
                        {formatNumber(flaggedAccounts.length)} pending
                      </Typography>
                    </Typography>
                    <Stack spacing={2}>
                      {flaggedAccounts.length ? flaggedAccounts.map((item) => (
                        <Box key={item.registryId} sx={{ p: 1.5, borderRadius: 3, border: `1px solid ${colors.line}`, borderLeft: `4px solid ${item.risk === 'High' ? colors.red : colors.orange}` }}>
                          <Typography sx={{ fontSize: 13, fontWeight: 700 }}>{item.registryId}</Typography>
                          <Typography sx={{ fontSize: 12, fontWeight: 600, color: item.risk === 'High' ? colors.red : colors.orange, mt: 0.5 }}>{item.reason}</Typography>
                          <Typography sx={{ fontSize: 11, color: colors.muted, mt: 0.2 }}>{item.description}</Typography>
                        </Box>
                      )) : (
                        <Typography sx={{ color: colors.muted }}>No flagged patient accounts right now.</Typography>
                      )}
                    </Stack>
                    <Button fullWidth variant="contained" onClick={() => setQuickFilter('flagged')} sx={{ mt: 3, bgcolor: '#16a34a', color: '#fff', textTransform: 'none', borderRadius: 2, fontWeight: 600, py: 1.2, '&:hover': { bgcolor: '#12823c' } }}>
                      Review flagged accounts
                    </Button>
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
