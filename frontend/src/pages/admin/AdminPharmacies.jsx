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
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Divider,
  Avatar
} from '@mui/material';
import {
  CloseRounded as CloseIcon,
  LocalPharmacyRounded as PharmacyIcon,
  EmailRounded as EmailIcon,
  PhoneRounded as PhoneIcon,
  BadgeRounded as LicenseIcon,
  VerifiedUserRounded as VerifiedIcon,
  TimelineRounded as PerformanceIcon,
  MapRounded as MapIcon
} from '@mui/icons-material';
import AdminLayout from '../../components/AdminLayout';
import { approvePendingUser, fetchPharmaciesDirectory } from '../../api/adminApi';

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

export default function AdminPharmacies() {
  const [pharmacies, setPharmacies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [approvingId, setApprovingId] = useState('');
  const [selectedPharmacy, setSelectedPharmacy] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

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
            <Typography sx={{ fontSize: { xs: 36, md: 46 }, fontWeight: 700, fontFamily: 'Inter, sans-serif', lineHeight: 1.05 }}>Pharmacies</Typography>
            <Typography sx={{ mt: 1, color: colors.muted, fontSize: 18, maxWidth: 640 }}>
              Live pharmacy registry, approval queue, and fulfillment overview.
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
            <Box sx={{ px: 2.5, py: 1.25, borderRadius: '12px', border: `1px solid ${colors.line}`, bgcolor: colors.paper, fontSize: 17 }}>
              {new Date().toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })}
            </Box>
            <Button
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
              Add Pharmacy
            </Button>
          </Box>
        </Stack>

        {loading ? (
          <Box sx={{ py: 8, display: 'grid', placeItems: 'center' }}>
            <CircularProgress sx={{ color: colors.blue }} />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ borderRadius: '12px' }}>{error}</Alert>
        ) : (
          <>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2, mb: 3 }}>
              {stats.map(([label, value, helper, color]) => (
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
                  <Typography sx={{ fontSize: 30, lineHeight: 1, mb: 1 }}>{value}</Typography>
                  <Typography sx={{ fontSize: 13, color: colors.muted }}>{helper}</Typography>
                </Box>
              ))}
            </Box>

            <Grid container spacing={4} sx={{ mb: 5 }}>
              <Grid item xs={12} lg={8}>
                <Box sx={{ borderRadius: '16px', border: `1px solid ${colors.line}`, bgcolor: colors.paper, overflow: 'hidden' }}>
                  <Box sx={{ p: 4, borderBottom: `1px solid ${colors.line}` }}>
                    <Typography sx={{ fontSize: 18 }}>Pharmacy registry</Typography>
                  </Box>
                  <Box sx={{ px: 4, py: 2, bgcolor: colors.soft, display: { xs: 'none', lg: 'flex' } }}>
                    <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: colors.muted, width: '20%' }}>Pharmacy</Typography>
                    <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: colors.muted, width: '26%' }}>Contact</Typography>
                    <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: colors.muted, width: '10%' }}>Type</Typography>
                    <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: colors.muted, width: '11%' }}>Fulfilled</Typography>
                    <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: colors.muted, width: '11%' }}>Low stock</Typography>
                    <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: colors.muted, width: '11%' }}>Status</Typography>
                    <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: colors.muted, width: '11%', textAlign: 'right' }}>Action</Typography>
                  </Box>
                  {pharmacies.map((pharmacy, index) => (
                    <Box key={pharmacy.pharmacyId} sx={{ px: 4, py: 2.5, display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, borderBottom: index === pharmacies.length - 1 ? 'none' : `1px solid ${colors.line}`, '&:hover': { bgcolor: '#fbfbfb' } }}>
                      <Box sx={{ width: { xs: '100%', lg: '20%' }, mb: { xs: 1, lg: 0 } }}>
                        <Typography sx={{ fontSize: 15, fontWeight: 700 }}>{pharmacy.pharmacyName}</Typography>
                        <Typography sx={{ fontSize: 12, color: colors.muted }}>{pharmacy.licenseNumber}</Typography>
                      </Box>
                      <Typography sx={{ fontSize: 14, color: colors.muted, width: { xs: '100%', lg: '26%' }, mb: { xs: 0.5, lg: 0 }, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pharmacy.email || pharmacy.phone || 'No contact'}</Typography>
                      <Box sx={{ width: { xs: '100%', lg: '10%' }, mb: { xs: 1, lg: 0 } }}>
                        <Chip label={pharmacy.isJanAushadhi ? 'Jan Aushadhi' : 'General'} size="small" sx={{ borderRadius: 1.5, fontWeight: 700, bgcolor: pharmacy.isJanAushadhi ? colors.greenSoft : colors.soft, color: pharmacy.isJanAushadhi ? colors.green : colors.muted }} />
                      </Box>
                      <Typography sx={{ fontSize: 14, width: { xs: '100%', lg: '11%' }, mb: { xs: 0.5, lg: 0 } }}>{pharmacy.fulfillmentRate || 0}%</Typography>
                      <Typography sx={{ fontSize: 14, width: { xs: '100%', lg: '11%' }, color: pharmacy.lowStockItems > 0 ? colors.orange : colors.text, mb: { xs: 0.5, lg: 0 } }}>{formatNumber(pharmacy.lowStockItems)} items</Typography>
                      <Box sx={{ width: { xs: '100%', lg: '11%' }, mb: { xs: 1, lg: 0 } }}>
                        <Chip label={pharmacy.is_approved ? 'Active' : 'Pending'} size="small" sx={{ borderRadius: 1.5, fontWeight: 700, bgcolor: pharmacy.is_approved ? colors.greenSoft : colors.orangeSoft, color: pharmacy.is_approved ? colors.green : colors.orange }} />
                      </Box>
                      <Box sx={{ width: { xs: '100%', lg: '11%' }, textAlign: { lg: 'right' }, mt: { xs: 1, lg: 0 } }}>
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
                          <Button 
                            onClick={() => {
                              setSelectedPharmacy(pharmacy);
                              setModalOpen(true);
                            }} 
                            sx={{ borderRadius: 1.5, textTransform: 'none', color: colors.blue, fontWeight: 700 }}
                          >
                            View
                          </Button>
                        )}
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Grid>

              <Grid item xs={12} lg={4}>
                <Stack spacing={4}>
                  <Box sx={{ p: 4, borderRadius: '16px', border: `1px solid ${colors.line}`, bgcolor: colors.paper }}>
                    <Typography sx={{ fontSize: 18, mb: 3 }}>Pending approvals</Typography>
                    <Stack spacing={2}>
                      {pendingPharmacies.length ? pendingPharmacies.map((item) => (
                        <Box key={item.pharmacyId} sx={{ p: 1.8, borderRadius: '12px', bgcolor: colors.soft }}>
                          <Typography sx={{ fontSize: 15, fontWeight: 700 }}>{item.pharmacyName}</Typography>
                          <Typography sx={{ fontSize: 12.5, color: colors.muted, mt: 0.4 }}>{item.email || item.phone || 'No contact'}</Typography>
                        </Box>
                      )) : <Typography sx={{ color: colors.muted, fontSize: 14.5 }}>No pending pharmacy approvals.</Typography>}
                    </Stack>
                  </Box>

                  <Box sx={{ p: 4, borderRadius: '16px', border: `1px solid ${colors.line}`, bgcolor: colors.paper }}>
                    <Typography sx={{ fontSize: 18, mb: 3 }}>Top fulfillment</Typography>
                    <Stack spacing={2}>
                      {topPharmacies.slice(0, 5).map((item) => (
                        <Box key={item.pharmacyId} sx={{ p: 1.8, borderRadius: '12px', bgcolor: colors.soft }}>
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

        {/* Pharmacy Detail Modal */}
        <Dialog 
          open={modalOpen} 
          onClose={() => setModalOpen(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{ sx: { borderRadius: '16px', boxShadow: '0 8px 32px rgba(0,0,0,0.12)' } }}
        >
          <Box sx={{ p: 4 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar sx={{ bgcolor: colors.blueSoft, color: colors.blue }}>
                  <PharmacyIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight={800}>{selectedPharmacy?.pharmacyName}</Typography>
                  <Typography variant="caption" sx={{ color: colors.muted }}>ID: {selectedPharmacy?.pharmacyId}</Typography>
                </Box>
              </Stack>
              <IconButton onClick={() => setModalOpen(false)} sx={{ bgcolor: colors.soft }}>
                <CloseIcon />
              </IconButton>
            </Stack>

            <Divider sx={{ mb: 4 }} />

            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Stack spacing={2.5}>
                  <Box>
                    <Typography variant="caption" sx={{ color: colors.muted, mb: 0.5, display: 'block' }}>CONTACT EMAIL</Typography>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <EmailIcon sx={{ fontSize: 18, color: colors.blue }} />
                      <Typography fontWeight={600} sx={{ wordBreak: 'break-all' }}>{selectedPharmacy?.email || 'N/A'}</Typography>
                    </Stack>
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ color: colors.muted, mb: 0.5, display: 'block' }}>PHONE NUMBER</Typography>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <PhoneIcon sx={{ fontSize: 18, color: colors.blue }} />
                      <Typography fontWeight={600}>{selectedPharmacy?.phone || 'N/A'}</Typography>
                    </Stack>
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ color: colors.muted, mb: 0.5, display: 'block' }}>LICENSE INFO</Typography>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <LicenseIcon sx={{ fontSize: 18, color: colors.blue }} />
                      <Typography fontWeight={600}>{selectedPharmacy?.licenseNumber || 'N/A'}</Typography>
                    </Stack>
                  </Box>
                </Stack>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box sx={{ p: 3, borderRadius: '12px', bgcolor: colors.soft }}>
                  <Typography variant="caption" sx={{ color: colors.muted, mb: 2, display: 'block' }}>PLATFORM PERFORMANCE</Typography>
                  <Stack spacing={3}>
                    <Box>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                        <Typography variant="body2" fontWeight={700}>Fulfillment</Typography>
                        <Typography variant="body2" fontWeight={800} color={colors.blue}>{selectedPharmacy?.fulfillmentRate || 0}%</Typography>
                      </Stack>
                      <Box sx={{ height: 6, bgcolor: colors.paper, borderRadius: 3, overflow: 'hidden' }}>
                        <Box sx={{ width: `${selectedPharmacy?.fulfillmentRate || 0}%`, height: '100%', bgcolor: colors.blue }} />
                      </Box>
                    </Box>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <PerformanceIcon sx={{ color: colors.muted }} />
                      <Box>
                        <Typography variant="body2" fontWeight={700}>{selectedPharmacy?.lowStockItems || 0} Low items</Typography>
                        <Typography variant="caption" sx={{ color: colors.muted }}>Requires inventory update</Typography>
                      </Box>
                    </Stack>
                  </Stack>
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ mt: 1, p: 2, borderRadius: '12px', border: `1px solid ${colors.line}`, display: 'flex', alignItems: 'center', gap: 2 }}>
                  <VerifiedIcon sx={{ color: selectedPharmacy?.is_approved ? colors.green : colors.orange }} />
                  <Box>
                    <Typography variant="body2" fontWeight={700}>Status: {selectedPharmacy?.is_approved ? 'Verified Merchant' : 'Verification Pending'}</Typography>
                    <Typography variant="caption" sx={{ color: colors.muted }}>Account created on {new Date().toLocaleDateString()}</Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>

            <Button 
              fullWidth 
              variant="contained" 
              onClick={() => setModalOpen(false)}
              sx={{ mt: 4, py: 1.5, borderRadius: '12px', bgcolor: colors.blue, textTransform: 'none', fontWeight: 700 }}
            >
              Close Profile
            </Button>
          </Box>
        </Dialog>
      </Box>
    </AdminLayout>
  );
}
