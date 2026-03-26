import React, { useEffect, useMemo, useState } from 'react';
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
import { approvePendingUser, fetchDoctorsDirectory } from '../../api/adminApi';

const colors = {
  line: '#ebe9e0',
  soft: '#f5f1e8',
  muted: '#6f6a62',
  text: '#252525',
  blue: '#2563eb',
  green: '#16a34a',
  greenSoft: '#f0fdf4',
  red: '#dc2626',
  orange: '#ea580c',
  orangeSoft: '#fff7ed'
};

const formatNumber = (value) => new Intl.NumberFormat('en-IN').format(Number(value || 0));

export default function AdminDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [approvingId, setApprovingId] = useState('');

  const loadDoctors = async () => {
    try {
      setLoading(true);
      const response = await fetchDoctorsDirectory();
      setDoctors(response.doctors || []);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to load doctors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDoctors();
  }, []);

  const stats = useMemo(() => {
    const total = doctors.length;
    const verified = doctors.filter((doctor) => doctor.is_approved && doctor.is_active).length;
    const pending = doctors.filter((doctor) => !doctor.is_approved).length;
    const highExperience = doctors.filter((doctor) => Number(doctor.experience || 0) >= 10).length;
    return [
      ['Total doctors', formatNumber(total), 'All doctor accounts', colors.blue],
      ['Verified & active', formatNumber(verified), 'Approved and active', colors.green],
      ['Pending verification', formatNumber(pending), 'Awaiting admin action', colors.orange],
      ['10+ years exp.', formatNumber(highExperience), 'Senior doctors', colors.red]
    ];
  }, [doctors]);

  const pendingDoctors = useMemo(() => doctors.filter((doctor) => !doctor.is_approved), [doctors]);

  const specializationRows = useMemo(() => {
    const map = new Map();
    doctors.forEach((doctor) => {
      const key = doctor.specialization || 'Unspecified';
      map.set(key, (map.get(key) || 0) + 1);
    });
    return Array.from(map.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [doctors]);

  const topDoctors = useMemo(() => (
    [...doctors]
      .sort((a, b) => {
        if ((b.totalConsultations || 0) !== (a.totalConsultations || 0)) {
          return (b.totalConsultations || 0) - (a.totalConsultations || 0);
        }
        return (b.rating || 0) - (a.rating || 0);
      })
      .slice(0, 8)
  ), [doctors]);

  const handleApprove = async (userId) => {
    try {
      setApprovingId(userId);
      await approvePendingUser(userId);
      await loadDoctors();
    } catch (err) {
      setError(err.message || 'Failed to approve doctor');
    } finally {
      setApprovingId('');
    }
  };

  return (
    <AdminLayout>
      <Box sx={{ p: { xs: 2.5, md: 4, xl: 5 }, maxWidth: 1600, mx: 'auto' }}>
        <Typography sx={{ fontSize: 32, fontWeight: 700, fontFamily: 'Georgia, serif' }}>Doctors</Typography>
        <Typography sx={{ mt: 0.5, color: colors.muted, fontSize: 14.5, mb: 4 }}>
          Live doctor registry, verification queue, and performance overview.
        </Typography>

        {loading ? (
          <Box sx={{ py: 8, display: 'grid', placeItems: 'center' }}>
            <CircularProgress sx={{ color: colors.blue }} />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ borderRadius: 3 }}>{error}</Alert>
        ) : (
          <>
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

            <Grid container spacing={4} sx={{ mb: 5 }}>
              <Grid item xs={12} lg={7}>
                <Paper sx={{ p: 4, borderRadius: 5, border: `1px solid ${colors.line}`, boxShadow: 'none' }}>
                  <Typography sx={{ fontSize: 18, fontWeight: 700, mb: 4 }}>Verification queue</Typography>
                  <Stack spacing={3}>
                    {pendingDoctors.length ? pendingDoctors.map((doctor) => (
                      <Box key={doctor.userId} sx={{ p: 2.5, borderRadius: 3, border: `1px solid ${colors.line}` }}>
                        <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2} justifyContent="space-between">
                          <Box>
                            <Typography sx={{ fontSize: 15, fontWeight: 700 }}>{doctor.full_name}</Typography>
                            <Typography sx={{ fontSize: 12.5, color: colors.muted, mt: 0.5 }}>
                              {doctor.specialization || 'Specialization pending'} • {doctor.hospitalName || 'Hospital not added'}
                            </Typography>
                            <Typography sx={{ fontSize: 12, color: colors.muted, mt: 0.5 }}>
                              {doctor.email} • License: {doctor.medicalLicense || 'Pending'}
                            </Typography>
                          </Box>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Chip label="Pending" size="small" sx={{ bgcolor: colors.orangeSoft, color: colors.orange }} />
                            <Button
                              onClick={() => handleApprove(doctor.userId)}
                              disabled={approvingId === doctor.userId}
                              sx={{ borderRadius: 1.5, textTransform: 'none', bgcolor: colors.greenSoft, color: colors.green }}
                            >
                              {approvingId === doctor.userId ? 'Saving...' : 'Approve'}
                            </Button>
                          </Stack>
                        </Stack>
                      </Box>
                    )) : (
                      <Typography sx={{ color: colors.muted }}>No doctors are waiting for approval.</Typography>
                    )}
                  </Stack>
                </Paper>
              </Grid>

              <Grid item xs={12} lg={5}>
                <Stack spacing={4}>
                  <Paper sx={{ p: 4, borderRadius: 5, border: `1px solid ${colors.line}`, boxShadow: 'none' }}>
                    <Typography sx={{ fontSize: 16, fontWeight: 700, mb: 3 }}>By specialization</Typography>
                    <Stack spacing={2.5}>
                      {specializationRows.length ? specializationRows.map((item) => (
                        <Stack key={item.name} direction="row" justifyContent="space-between" alignItems="center">
                          <Typography sx={{ fontSize: 13.5 }}>{item.name}</Typography>
                          <Chip label={formatNumber(item.count)} size="small" sx={{ bgcolor: colors.greenSoft, color: colors.green }} />
                        </Stack>
                      )) : (
                        <Typography sx={{ color: colors.muted }}>No specialization data yet.</Typography>
                      )}
                    </Stack>
                  </Paper>

                  <Paper sx={{ p: 4, borderRadius: 5, border: `1px solid ${colors.line}`, boxShadow: 'none' }}>
                    <Typography sx={{ fontSize: 16, fontWeight: 700, mb: 3 }}>Approval status snapshot</Typography>
                    <Stack spacing={2}>
                      <Stack direction="row" justifyContent="space-between"><Typography sx={{ fontSize: 13.5, color: colors.muted }}>Approved</Typography><Typography sx={{ fontSize: 14, fontWeight: 700 }}>{formatNumber(doctors.filter((d) => d.is_approved).length)}</Typography></Stack>
                      <Stack direction="row" justifyContent="space-between"><Typography sx={{ fontSize: 13.5, color: colors.muted }}>Pending</Typography><Typography sx={{ fontSize: 14, fontWeight: 700, color: colors.orange }}>{formatNumber(pendingDoctors.length)}</Typography></Stack>
                      <Stack direction="row" justifyContent="space-between"><Typography sx={{ fontSize: 13.5, color: colors.muted }}>Inactive</Typography><Typography sx={{ fontSize: 14, fontWeight: 700, color: colors.red }}>{formatNumber(doctors.filter((d) => !d.is_active).length)}</Typography></Stack>
                    </Stack>
                  </Paper>
                </Stack>
              </Grid>
            </Grid>

            <Paper sx={{ borderRadius: 5, border: `1px solid ${colors.line}`, boxShadow: 'none', overflow: 'hidden' }}>
              <Box sx={{ p: 4, borderBottom: `1px solid ${colors.line}` }}>
                <Typography sx={{ fontSize: 18, fontWeight: 700 }}>Top doctors by performance</Typography>
              </Box>
              <Box sx={{ px: 3, py: 2, bgcolor: colors.soft, display: 'flex' }}>
                <Typography sx={{ fontSize: 12, fontWeight: 700, color: colors.muted, width: '24%' }}>Doctor</Typography>
                <Typography sx={{ fontSize: 12, fontWeight: 700, color: colors.muted, width: '16%' }}>Specialization</Typography>
                <Typography sx={{ fontSize: 12, fontWeight: 700, color: colors.muted, width: '16%' }}>Hospital</Typography>
                <Typography sx={{ fontSize: 12, fontWeight: 700, color: colors.muted, width: '14%' }}>Consultations</Typography>
                <Typography sx={{ fontSize: 12, fontWeight: 700, color: colors.muted, width: '10%' }}>Rating</Typography>
                <Typography sx={{ fontSize: 12, fontWeight: 700, color: colors.muted, width: '10%' }}>Rx count</Typography>
                <Typography sx={{ fontSize: 12, fontWeight: 700, color: colors.muted, width: '10%', textAlign: 'right' }}>Status</Typography>
              </Box>
              {topDoctors.map((doctor, index) => (
                <Box key={doctor.userId} sx={{ px: 3, py: 2.5, display: 'flex', borderBottom: index === topDoctors.length - 1 ? 'none' : `1px solid ${colors.line}` }}>
                  <Typography sx={{ fontSize: 13.5, fontWeight: 700, width: '24%' }}>{doctor.full_name}</Typography>
                  <Typography sx={{ fontSize: 13, color: colors.muted, width: '16%' }}>{doctor.specialization || 'Unspecified'}</Typography>
                  <Typography sx={{ fontSize: 13, color: colors.muted, width: '16%' }}>{doctor.hospitalName || 'Not added'}</Typography>
                  <Typography sx={{ fontSize: 13, width: '14%' }}>{formatNumber(doctor.totalConsultations)}</Typography>
                  <Typography sx={{ fontSize: 13, width: '10%' }}>{Number(doctor.rating || 0).toFixed(1)}</Typography>
                  <Typography sx={{ fontSize: 13, width: '10%' }}>{formatNumber(doctor.totalPrescriptions)}</Typography>
                  <Box sx={{ width: '10%', textAlign: 'right' }}>
                    <Chip
                      label={doctor.is_approved ? 'Active' : 'Pending'}
                      size="small"
                      sx={{ bgcolor: doctor.is_approved ? colors.greenSoft : colors.orangeSoft, color: doctor.is_approved ? colors.green : colors.orange }}
                    />
                  </Box>
                </Box>
              ))}
            </Paper>
          </>
        )}
      </Box>
    </AdminLayout>
  );
}
