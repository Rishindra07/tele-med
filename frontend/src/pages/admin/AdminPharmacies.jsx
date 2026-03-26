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
import { approvePendingUser, fetchPharmaciesDirectory } from '../../api/adminApi';

const colors = {
  line: '#ebe9e0',
  muted: '#6f6a62',
  blue: '#2563eb',
  green: '#16a34a',
  greenSoft: '#f0fdf4',
  orange: '#ea580c',
  orangeSoft: '#fff7ed',
  red: '#dc2626'
};

const formatNumber = (value) => new Intl.NumberFormat('en-IN').format(Number(value || 0));

export default function AdminPharmacies() {
  const [pharmacies, setPharmacies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [approvingId, setApprovingId] = useState('');

  const loadPharmacies = async () => {
    try {
      setLoading(true);
      const response = await fetchPharmaciesDirectory();
      setPharmacies(response.pharmacies || []);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to load pharmacies');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPharmacies();
  }, []);

  const stats = useMemo(() => {
    const total = pharmacies.length;
    const jan = pharmacies.filter((item) => item.isJanAushadhi).length;
    const pending = pharmacies.filter((item) => !item.is_approved).length;
    const avgRate = total
      ? (pharmacies.reduce((sum, item) => sum + Number(item.fulfillmentRate || 0), 0) / total).toFixed(1)
      : 0;
    return [
      ['Total pharmacies', formatNumber(total), 'Registered pharmacy profiles', colors.blue],
      ['Jan Aushadhi', formatNumber(jan), 'Network subset', colors.green],
      ['Pending verification', formatNumber(pending), 'Need approval', colors.orange],
      ['Avg fulfilment', `${avgRate}%`, 'Across assigned prescriptions', colors.red]
    ];
  }, [pharmacies]);

  const pendingPharmacies = useMemo(() => pharmacies.filter((item) => !item.is_approved), [pharmacies]);
  const topPharmacies = useMemo(() => [...pharmacies].sort((a, b) => (b.fulfillmentRate || 0) - (a.fulfillmentRate || 0)).slice(0, 10), [pharmacies]);

  const handleApprove = async (userId) => {
    try {
      setApprovingId(userId);
      await approvePendingUser(userId);
      await loadPharmacies();
    } catch (err) {
      setError(err.message || 'Failed to approve pharmacy');
    } finally {
      setApprovingId('');
    }
  };

  return (
    <AdminLayout>
      <Box sx={{ p: { xs: 2.5, md: 4, xl: 5 }, maxWidth: 1600, mx: 'auto' }}>
        <Typography sx={{ fontSize: 32, fontWeight: 700, fontFamily: 'Georgia, serif' }}>Pharmacies</Typography>
        <Typography sx={{ mt: 0.5, color: colors.muted, fontSize: 14.5, mb: 4 }}>
          Live pharmacy registry, approval queue, and fulfillment overview.
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
              <Grid item xs={12} lg={8}>
                <Paper sx={{ borderRadius: 5, border: `1px solid ${colors.line}`, boxShadow: 'none', overflow: 'hidden' }}>
                  <Box sx={{ p: 4, borderBottom: `1px solid ${colors.line}` }}>
                    <Typography sx={{ fontSize: 18, fontWeight: 700 }}>Pharmacy registry</Typography>
                  </Box>
                  <Box sx={{ px: 3, py: 2, bgcolor: '#f5f1e8', display: 'flex' }}>
                    <Typography sx={{ fontSize: 12, fontWeight: 700, color: colors.muted, width: '24%' }}>Pharmacy</Typography>
                    <Typography sx={{ fontSize: 12, fontWeight: 700, color: colors.muted, width: '18%' }}>Contact</Typography>
                    <Typography sx={{ fontSize: 12, fontWeight: 700, color: colors.muted, width: '12%' }}>Type</Typography>
                    <Typography sx={{ fontSize: 12, fontWeight: 700, color: colors.muted, width: '12%' }}>Fulfilled</Typography>
                    <Typography sx={{ fontSize: 12, fontWeight: 700, color: colors.muted, width: '12%' }}>Low stock</Typography>
                    <Typography sx={{ fontSize: 12, fontWeight: 700, color: colors.muted, width: '12%' }}>Status</Typography>
                    <Typography sx={{ fontSize: 12, fontWeight: 700, color: colors.muted, width: '10%', textAlign: 'right' }}>Action</Typography>
                  </Box>
                  {pharmacies.map((pharmacy, index) => (
                    <Box key={pharmacy.pharmacyId} sx={{ px: 3, py: 2.5, display: 'flex', borderBottom: index === pharmacies.length - 1 ? 'none' : `1px solid ${colors.line}` }}>
                      <Box sx={{ width: '24%' }}>
                        <Typography sx={{ fontSize: 14, fontWeight: 700 }}>{pharmacy.pharmacyName}</Typography>
                        <Typography sx={{ fontSize: 11, color: colors.muted }}>{pharmacy.licenseNumber}</Typography>
                      </Box>
                      <Typography sx={{ fontSize: 12.5, color: colors.muted, width: '18%' }}>{pharmacy.email || pharmacy.phone || 'No contact'}</Typography>
                      <Box sx={{ width: '12%' }}>
                        <Chip label={pharmacy.isJanAushadhi ? 'Jan Aushadhi' : 'General'} size="small" sx={{ bgcolor: pharmacy.isJanAushadhi ? colors.greenSoft : '#f5f1e8', color: pharmacy.isJanAushadhi ? colors.green : colors.muted }} />
                      </Box>
                      <Typography sx={{ fontSize: 13, width: '12%' }}>{pharmacy.fulfillmentRate || 0}%</Typography>
                      <Typography sx={{ fontSize: 13, width: '12%', color: pharmacy.lowStockItems > 0 ? colors.orange : '#252525' }}>{formatNumber(pharmacy.lowStockItems)}</Typography>
                      <Box sx={{ width: '12%' }}>
                        <Chip label={pharmacy.is_approved ? 'Active' : 'Pending'} size="small" sx={{ bgcolor: pharmacy.is_approved ? colors.greenSoft : colors.orangeSoft, color: pharmacy.is_approved ? colors.green : colors.orange }} />
                      </Box>
                      <Box sx={{ width: '10%', textAlign: 'right' }}>
                        {!pharmacy.is_approved ? (
                          <Button onClick={() => handleApprove(pharmacy.userId)} disabled={approvingId === pharmacy.userId} sx={{ borderRadius: 1.5, textTransform: 'none' }}>
                            {approvingId === pharmacy.userId ? 'Saving...' : 'Approve'}
                          </Button>
                        ) : (
                          <Button sx={{ borderRadius: 1.5, textTransform: 'none' }}>View</Button>
                        )}
                      </Box>
                    </Box>
                  ))}
                </Paper>
              </Grid>

              <Grid item xs={12} lg={4}>
                <Stack spacing={4}>
                  <Paper sx={{ p: 4, borderRadius: 5, border: `1px solid ${colors.line}`, boxShadow: 'none' }}>
                    <Typography sx={{ fontSize: 16, fontWeight: 700, mb: 3 }}>Pending approvals</Typography>
                    <Stack spacing={2}>
                      {pendingPharmacies.length ? pendingPharmacies.map((item) => (
                        <Box key={item.pharmacyId}>
                          <Typography sx={{ fontSize: 13.5, fontWeight: 600 }}>{item.pharmacyName}</Typography>
                          <Typography sx={{ fontSize: 12, color: colors.muted }}>{item.email || item.phone || 'No contact'}</Typography>
                        </Box>
                      )) : <Typography sx={{ color: colors.muted }}>No pending pharmacy approvals.</Typography>}
                    </Stack>
                  </Paper>

                  <Paper sx={{ p: 4, borderRadius: 5, border: `1px solid ${colors.line}`, boxShadow: 'none' }}>
                    <Typography sx={{ fontSize: 16, fontWeight: 700, mb: 3 }}>Top fulfillment pharmacies</Typography>
                    <Stack spacing={2}>
                      {topPharmacies.slice(0, 5).map((item) => (
                        <Stack key={item.pharmacyId} direction="row" justifyContent="space-between">
                          <Typography sx={{ fontSize: 13.5 }}>{item.pharmacyName}</Typography>
                          <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: colors.blue }}>{item.fulfillmentRate || 0}%</Typography>
                        </Stack>
                      ))}
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
