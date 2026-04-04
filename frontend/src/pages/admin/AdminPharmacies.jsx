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
        <Stack direction={{ xs: 'column', lg: 'row' }} justifyContent="space-between" spacing={2} sx={{ mb: 3 }}>
          <Box>
            <Typography sx={{ fontSize: { xs: 36, md: 46 }, fontFamily: 'Georgia, serif', lineHeight: 1.05 }}>Pharmacies</Typography>
            <Typography sx={{ mt: 1, color: colors.muted, fontSize: 18, maxWidth: 640 }}>
              Live pharmacy registry, approval queue, and fulfillment overview.
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
                fontWeight: 700,
                '&:hover': { bgcolor: colors.blue }
              }}
            >
              Add Pharmacy
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
              <Grid item xs={12} lg={8}>
                <Box sx={{ borderRadius: 3.5, border: `1px solid ${colors.line}`, bgcolor: colors.paper, overflow: 'hidden' }}>
                  <Box sx={{ p: 4, borderBottom: `1px solid ${colors.line}` }}>
                    <Typography sx={{ fontSize: 18 }}>Pharmacy registry</Typography>
                  </Box>
                  <Box sx={{ px: 4, py: 2, bgcolor: colors.soft, display: { xs: 'none', lg: 'flex' } }}>
                    <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: colors.muted, width: '24%' }}>Pharmacy</Typography>
                    <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: colors.muted, width: '18%' }}>Contact</Typography>
                    <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: colors.muted, width: '12%' }}>Type</Typography>
                    <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: colors.muted, width: '12%' }}>Fulfilled</Typography>
                    <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: colors.muted, width: '12%' }}>Low stock</Typography>
                    <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: colors.muted, width: '12%' }}>Status</Typography>
                    <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: colors.muted, width: '10%', textAlign: 'right' }}>Action</Typography>
                  </Box>
                  {pharmacies.map((pharmacy, index) => (
                    <Box key={pharmacy.pharmacyId} sx={{ px: 4, py: 2.5, display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, borderBottom: index === pharmacies.length - 1 ? 'none' : `1px solid ${colors.line}`, '&:hover': { bgcolor: '#fbfbfb' } }}>
                      <Box sx={{ width: { xs: '100%', lg: '24%' }, mb: { xs: 1, lg: 0 } }}>
                        <Typography sx={{ fontSize: 15, fontWeight: 700 }}>{pharmacy.pharmacyName}</Typography>
                        <Typography sx={{ fontSize: 12, color: colors.muted }}>{pharmacy.licenseNumber}</Typography>
                      </Box>
                      <Typography sx={{ fontSize: 14, color: colors.muted, width: { xs: '100%', lg: '18%' }, mb: { xs: 0.5, lg: 0 } }}>{pharmacy.email || pharmacy.phone || 'No contact'}</Typography>
                      <Box sx={{ width: { xs: '100%', lg: '12%' }, mb: { xs: 1, lg: 0 } }}>
                        <Chip label={pharmacy.isJanAushadhi ? 'Jan Aushadhi' : 'General'} size="small" sx={{ borderRadius: 1.5, fontWeight: 700, bgcolor: pharmacy.isJanAushadhi ? colors.greenSoft : colors.soft, color: pharmacy.isJanAushadhi ? colors.green : colors.muted }} />
                      </Box>
                      <Typography sx={{ fontSize: 14, width: { xs: '100%', lg: '12%' }, mb: { xs: 0.5, lg: 0 } }}>{pharmacy.fulfillmentRate || 0}%</Typography>
                      <Typography sx={{ fontSize: 14, width: { xs: '100%', lg: '12%' }, color: pharmacy.lowStockItems > 0 ? colors.orange : colors.text, mb: { xs: 0.5, lg: 0 } }}>{formatNumber(pharmacy.lowStockItems)} items</Typography>
                      <Box sx={{ width: { xs: '100%', lg: '12%' }, mb: { xs: 1, lg: 0 } }}>
                        <Chip label={pharmacy.is_approved ? 'Active' : 'Pending'} size="small" sx={{ borderRadius: 1.5, fontWeight: 700, bgcolor: pharmacy.is_approved ? colors.greenSoft : colors.orangeSoft, color: pharmacy.is_approved ? colors.green : colors.orange }} />
                      </Box>
                      <Box sx={{ width: { xs: '100%', lg: '10%' }, textAlign: { lg: 'right' }, mt: { xs: 1, lg: 0 } }}>
                        {!pharmacy.is_approved ? (
                          <Button 
                            onClick={() => handleApprove(pharmacy.userId)} 
                            disabled={approvingId === pharmacy.userId}
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
                            {approvingId === pharmacy.userId ? 'Saving...' : 'Approve'}
                          </Button>
                        ) : (
                          <Button sx={{ borderRadius: 1.5, textTransform: 'none', color: colors.blue, fontWeight: 700 }}>View</Button>
                        )}
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Grid>

              <Grid item xs={12} lg={4}>
                <Stack spacing={4}>
                  <Box sx={{ p: 4, borderRadius: 3.5, border: `1px solid ${colors.line}`, bgcolor: colors.paper }}>
                    <Typography sx={{ fontSize: 18, mb: 3 }}>Pending approvals</Typography>
                    <Stack spacing={2}>
                      {pendingPharmacies.length ? pendingPharmacies.map((item) => (
                        <Box key={item.pharmacyId} sx={{ p: 1.8, borderRadius: 2.5, bgcolor: colors.soft }}>
                          <Typography sx={{ fontSize: 15, fontWeight: 700 }}>{item.pharmacyName}</Typography>
                          <Typography sx={{ fontSize: 12.5, color: colors.muted, mt: 0.4 }}>{item.email || item.phone || 'No contact'}</Typography>
                        </Box>
                      )) : <Typography sx={{ color: colors.muted, fontSize: 14.5 }}>No pending pharmacy approvals.</Typography>}
                    </Stack>
                  </Box>

                  <Box sx={{ p: 4, borderRadius: 3.5, border: `1px solid ${colors.line}`, bgcolor: colors.paper }}>
                    <Typography sx={{ fontSize: 18, mb: 3 }}>Top fulfillment</Typography>
                    <Stack spacing={2}>
                      {topPharmacies.slice(0, 5).map((item) => (
                        <Box key={item.pharmacyId} sx={{ p: 1.8, borderRadius: 2.5, bgcolor: colors.soft }}>
                          <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Typography sx={{ fontSize: 14.5, fontWeight: 600 }}>{item.pharmacyName}</Typography>
                            <Chip label={`${item.fulfillmentRate || 0}%`} size="small" sx={{ fontWeight: 700, bgcolor: colors.blueSoft, color: colors.blue }} />
                          </Stack>
                        </Box>
                      ))}
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
