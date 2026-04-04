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
        <Stack direction={{ xs: 'column', lg: 'row' }} justifyContent="space-between" spacing={2} sx={{ mb: 3 }}>
          <Box>
            <Typography sx={{ fontSize: { xs: 36, md: 46 }, fontFamily: 'Georgia, serif', lineHeight: 1.05 }}>Doctors</Typography>
            <Typography sx={{ mt: 1, color: colors.muted, fontSize: 18, maxWidth: 640 }}>
              Live doctor registry, verification queue, and performance overview.
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
            <Box sx={{ px: 2.5, py: 1.25, borderRadius: 4, border: `1px solid ${colors.line}`, bgcolor: '#f7f3ea', fontSize: 17 }}>
              {new Date().toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })}
            </Box>
            <Button
              variant="contained"
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
              Add Doctor
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

            <Grid container spacing={4} sx={{ mb: 5 }}>
              <Grid item xs={12} lg={7}>
                <Box sx={{ p: 4, borderRadius: 3.5, border: `1px solid ${colors.line}`, bgcolor: colors.paper, height: '100%' }}>
                  <Typography sx={{ fontSize: 18, mb: 4 }}>Verification queue</Typography>
                  <Stack spacing={2}>
                    {pendingDoctors.length ? pendingDoctors.map((doctor) => (
                      <Box key={doctor.userId} sx={{ p: 2, borderRadius: 2.5, bgcolor: colors.soft }}>
                        <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2} justifyContent="space-between" alignItems="center">
                          <Box sx={{ flex: 1 }}>
                            <Typography sx={{ fontSize: 16, fontWeight: 700 }}>{doctor.full_name}</Typography>
                            <Typography sx={{ fontSize: 13, color: colors.muted, mt: 0.4 }}>
                              {doctor.specialization || 'Specialization pending'} • {doctor.hospitalName || 'Hospital not added'}
                            </Typography>
                            <Typography sx={{ fontSize: 12.5, color: colors.muted, mt: 0.4 }}>
                              {doctor.email} • License: {doctor.medicalLicense || 'Pending'}
                            </Typography>
                          </Box>
                          <Stack direction="row" spacing={1.5} alignItems="center">
                            <Chip label="Pending" size="small" sx={{ borderRadius: 1.5, fontWeight: 700, bgcolor: colors.orangeSoft, color: colors.orange }} />
                            <Button
                              onClick={() => handleApprove(doctor.userId)}
                              disabled={approvingId === doctor.userId}
                              variant="contained"
                              sx={{
                                borderRadius: 1.5,
                                textTransform: 'none',
                                bgcolor: colors.greenSoft,
                                color: colors.green,
                                fontWeight: 700,
                                boxShadow: 'none',
                                '&:hover': { bgcolor: colors.greenSoft, boxShadow: 'none' }
                              }}
                            >
                              {approvingId === doctor.userId ? 'Saving...' : 'Approve'}
                            </Button>
                          </Stack>
                        </Stack>
                      </Box>
                    )) : (
                      <Typography sx={{ color: colors.muted, fontSize: 14.5 }}>No doctors are waiting for approval.</Typography>
                    )}
                  </Stack>
                </Box>
              </Grid>

              <Grid item xs={12} lg={5}>
                <Stack spacing={4}>
                  <Box sx={{ p: 4, borderRadius: 3.5, border: `1px solid ${colors.line}`, bgcolor: colors.paper }}>
                    <Typography sx={{ fontSize: 18, mb: 3 }}>By specialization</Typography>
                    <Stack spacing={1.5}>
                      {specializationRows.length ? specializationRows.map((item) => (
                        <Box key={item.name} sx={{ p: 1.6, borderRadius: 2.5, bgcolor: colors.soft }}>
                          <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Typography sx={{ fontSize: 14.5, fontWeight: 600 }}>{item.name}</Typography>
                            <Chip label={formatNumber(item.count)} size="small" sx={{ fontWeight: 700, bgcolor: colors.greenSoft, color: colors.green }} />
                          </Stack>
                        </Box>
                      )) : (
                        <Typography sx={{ color: colors.muted, fontSize: 14.5 }}>No specialization data yet.</Typography>
                      )}
                    </Stack>
                  </Box>

                  <Box sx={{ p: 4, borderRadius: 3.5, border: `1px solid ${colors.line}`, bgcolor: colors.paper }}>
                    <Typography sx={{ fontSize: 18, mb: 3 }}>Status snapshot</Typography>
                    <Stack spacing={2}>
                      <Stack direction="row" justifyContent="space-between"><Typography sx={{ fontSize: 15, color: colors.muted }}>Approved</Typography><Typography sx={{ fontSize: 16, fontWeight: 700, color: colors.green }}>{formatNumber(doctors.filter((d) => d.is_approved).length)}</Typography></Stack>
                      <Stack direction="row" justifyContent="space-between"><Typography sx={{ fontSize: 15, color: colors.muted }}>Pending</Typography><Typography sx={{ fontSize: 16, fontWeight: 700, color: colors.orange }}>{formatNumber(pendingDoctors.length)}</Typography></Stack>
                      <Stack direction="row" justifyContent="space-between"><Typography sx={{ fontSize: 15, color: colors.muted }}>Inactive</Typography><Typography sx={{ fontSize: 16, fontWeight: 700, color: colors.red }}>{formatNumber(doctors.filter((d) => !d.is_active).length)}</Typography></Stack>
                    </Stack>
                  </Box>
                </Stack>
              </Grid>
            </Grid>

            <Box sx={{ borderRadius: 3.5, border: `1px solid ${colors.line}`, bgcolor: colors.paper, overflow: 'hidden' }}>
              <Box sx={{ p: 4, borderBottom: `1px solid ${colors.line}` }}>
                <Typography sx={{ fontSize: 18 }}>Top doctors by performance</Typography>
              </Box>
              <Box sx={{ px: 4, py: 2, bgcolor: colors.soft, display: { xs: 'none', lg: 'flex' } }}>
                <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: colors.muted, width: '24%' }}>Doctor</Typography>
                <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: colors.muted, width: '16%' }}>Specialization</Typography>
                <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: colors.muted, width: '16%' }}>Hospital</Typography>
                <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: colors.muted, width: '14%' }}>Consultations</Typography>
                <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: colors.muted, width: '10%' }}>Rating</Typography>
                <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: colors.muted, width: '10%' }}>Rx count</Typography>
                <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: colors.muted, width: '10%', textAlign: 'right' }}>Status</Typography>
              </Box>
              {topDoctors.map((doctor, index) => (
                <Box key={doctor.userId} sx={{ px: 4, py: 2.5, display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, borderBottom: index === topDoctors.length - 1 ? 'none' : `1px solid ${colors.line}`, '&:hover': { bgcolor: '#fbfbfb' } }}>
                  <Box sx={{ width: { xs: '100%', lg: '24%' }, mb: { xs: 1, lg: 0 } }}>
                    <Typography sx={{ fontSize: 15, fontWeight: 700 }}>{doctor.full_name}</Typography>
                  </Box>
                  <Typography sx={{ fontSize: 14, color: colors.muted, width: { xs: '100%', lg: '16%' }, mb: { xs: 0.5, lg: 0 } }}>{doctor.specialization || 'Unspecified'}</Typography>
                  <Typography sx={{ fontSize: 14, color: colors.muted, width: { xs: '100%', lg: '16%' }, mb: { xs: 0.5, lg: 0 } }}>{doctor.hospitalName || 'Not added'}</Typography>
                  <Typography sx={{ fontSize: 14, width: { xs: '100%', lg: '14%' }, mb: { xs: 0.5, lg: 0 } }}>{formatNumber(doctor.totalConsultations)} sessions</Typography>
                  <Typography sx={{ fontSize: 14, width: { xs: '100%', lg: '10%' }, mb: { xs: 0.5, lg: 0 } }}>★ {Number(doctor.rating || 0).toFixed(1)}</Typography>
                  <Typography sx={{ fontSize: 14, width: { xs: '100%', lg: '10%' }, mb: { xs: 0.5, lg: 0 } }}>{formatNumber(doctor.totalPrescriptions)} Rx</Typography>
                  <Box sx={{ width: { xs: '100%', lg: '10%' }, textAlign: { lg: 'right' }, mt: { xs: 1, lg: 0 } }}>
                    <Chip
                      label={doctor.is_approved ? 'Active' : 'Pending'}
                      size="small"
                      sx={{ borderRadius: 1.5, fontWeight: 700, bgcolor: doctor.is_approved ? colors.greenSoft : colors.orangeSoft, color: doctor.is_approved ? colors.green : colors.orange }}
                    />
                  </Box>
                </Box>
              ))}
            </Box>
          </>
        )}
      </Box>
    </AdminLayout>
  );
}
