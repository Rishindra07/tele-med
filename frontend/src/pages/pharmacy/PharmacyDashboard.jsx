import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  Stack,
  Typography
} from '@mui/material';
import PharmacyLayout from '../../components/PharmacyLayout';
import { 
  fetchPharmacyDashboard, 
  updateDeliverySettings, 
  updateOrderStatus 
} from '../../api/pharmacyApi';
import { 
  LocalShippingOutlined as DeliveryIcon, 
  StorefrontOutlined as PickupIcon, 
  CheckCircleOutline as AcceptIcon, 
  CancelOutlined as RejectIcon 
} from '@mui/icons-material';
import { Button, Switch, FormControlLabel } from '@mui/material';

const colors = {
  paper: '#ffffff',
  line: '#ebe9e0',
  soft: '#f5f1e8',
  text: '#252525',
  muted: '#6f6a62',
  green: '#26a37c',
  greenSoft: '#dff3eb',
  greenDark: '#176d57',
  amber: '#d18a1f',
  red: '#d9635b',
  blue: '#4a90e2'
};

export default function PharmacyDashboard() {
  const pharmacyName = (() => {
    try {
      const u = JSON.parse(localStorage.getItem('user') || '{}');
      return (u.full_name || u.name || 'Pharmacist').split(' ')[0];
    } catch { return 'Pharmacist'; }
  })();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      const response = await fetchPharmacyDashboard();
      setData(response);
    } catch (err) {
      setError(err.message || 'Failed to load pharmacy dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDeliveryToggle = async () => {
    try {
      const current = data?.profile?.pharmacy?.deliveryAvailable || false;
      await updateDeliverySettings({ deliveryAvailable: !current });
      load();
    } catch (err) {
      setError('Failed to update delivery settings');
    }
  };

  const handleUpdateStatus = async (orderId, status) => {
    try {
      await updateOrderStatus({ orderId, status });
      load();
    } catch (err) {
      setError('Failed to update order status');
    }
  };

  const stats = useMemo(() => {
    const summary = data?.summary || {};
    return [
      ['Prescriptions today', summary.prescriptionsToday || 0, 'Incoming queue', colors.green],
      ['Pending', summary.pendingPrescriptions || 0, 'Awaiting stock or action', colors.amber],
      ['Ready', summary.readyPrescriptions || 0, 'Ready for pickup', colors.blue],
      ['Low stock', summary.lowStockCount || 0, 'Needs reorder soon', colors.red]
    ];
  }, [data]);

  return (
    <PharmacyLayout>
      <Box sx={{ p: { xs: 2.5, md: 4, xl: 5 }, maxWidth: 1400, mx: 'auto' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
          <Box>
            <Typography sx={{ fontSize: { xs: 32, md: 38 }, fontFamily: 'Georgia, serif', lineHeight: 1.1 }}>
              Hello, {pharmacyName}
            </Typography>
            <Typography sx={{ mt: 1.5, color: colors.muted, fontSize: 14.5 }}>
              Live prescription queue, stock pressure, and fulfillment updates.
            </Typography>
          </Box>
          <Box sx={{ p: 2, borderRadius: 3, border: `1px solid ${colors.line}`, bgcolor: colors.paper }}>
            <FormControlLabel
              control={
                <Switch 
                  checked={data?.profile?.pharmacy?.deliveryAvailable || false} 
                  onChange={handleDeliveryToggle}
                  color="success"
                />
              }
              label={
                <Typography sx={{ fontSize: 14, fontWeight: 600 }}>
                  {data?.profile?.pharmacy?.deliveryAvailable ? '🚚 Delivery Active' : '🏬 Pickup Only'}
                </Typography>
              }
            />
          </Box>
        </Stack>

        {loading ? (
          <Box sx={{ py: 8, display: 'grid', placeItems: 'center' }}>
            <CircularProgress sx={{ color: colors.green }} />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ borderRadius: 3 }}>{error}</Alert>
        ) : (
          <>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' }, gap: 2, mb: 4 }}>
              {stats.map(([title, value, sub, color]) => (
                <Box key={title} sx={{ p: 2.5, borderRadius: 3, border: `1px solid ${colors.line}`, bgcolor: colors.paper }}>
                  <Typography sx={{ fontSize: 13, color: colors.text }}>{title}</Typography>
                  <Typography sx={{ mt: 1, fontSize: 32, fontFamily: 'Georgia, serif' }}>{value}</Typography>
                  <Typography sx={{ mt: 0.5, fontSize: 12.5, color }}>{sub}</Typography>
                </Box>
              ))}
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1.1fr 0.9fr' }, gap: 3 }}>
              <Box sx={{ p: 3, borderRadius: 4, border: `1px solid ${colors.line}`, bgcolor: colors.paper }}>
                <Typography sx={{ fontSize: 18, mb: 3 }}>Fulfillment Orders (Direct)</Typography>
                <Stack spacing={2}>
                  {(data?.orders || []).length ? (
                    data.orders.map((item) => (
                      <Box key={item._id} sx={{ p: 2.5, borderRadius: 3, border: `1px solid ${colors.line}`, bgcolor: colors.soft }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                          <Box>
                            <Typography sx={{ fontSize: 16, fontWeight: 700 }}>
                              {item.patient?.full_name || 'Patient'}
                            </Typography>
                            <Typography sx={{ fontSize: 13, color: colors.muted }}>
                              {item.prescription?.prescriptionId}
                            </Typography>
                          </Box>
                          <Chip 
                            size="small" 
                            label={item.deliveryType === 'HOME' ? 'Home Delivery' : 'Store Pickup'} 
                            icon={item.deliveryType === 'HOME' ? <DeliveryIcon sx={{ fontSize: 14 }} /> : <PickupIcon sx={{ fontSize: 14 }} />}
                            sx={{ bgcolor: item.deliveryType === 'HOME' ? colors.greenSoft : '#fff', color: item.deliveryType === 'HOME' ? colors.greenDark : colors.text, border: `1px solid ${colors.line}` }} 
                          />
                        </Stack>

                        {item.deliveryType === 'HOME' && item.deliveryAddress && (
                          <Box sx={{ mt: 2, p: 1.5, bgcolor: '#fff', borderRadius: 2, border: `1px dashed ${colors.line}` }}>
                            <Typography sx={{ fontSize: 12, fontWeight: 700, color: colors.muted, mb: 0.5 }}>DELIVERY ADDRESS</Typography>
                            <Typography sx={{ fontSize: 13 }}>{item.deliveryAddress}</Typography>
                          </Box>
                        )}

                        <Stack direction="row" spacing={1.5} sx={{ mt: 2.5 }}>
                          {item.status === 'Pending' ? (
                            <>
                              <Button 
                                fullWidth 
                                variant="contained" 
                                size="small" 
                                startIcon={<AcceptIcon />}
                                onClick={() => handleUpdateStatus(item._id, 'Accepted')}
                                sx={{ bgcolor: colors.green, '&:hover': { bgcolor: colors.greenDark }, textTransform: 'none', borderRadius: 2 }}
                              >
                                Accept
                              </Button>
                              <Button 
                                fullWidth 
                                variant="outlined" 
                                size="small" 
                                startIcon={<RejectIcon />}
                                onClick={() => handleUpdateStatus(item._id, 'Rejected')}
                                sx={{ color: colors.red, borderColor: colors.red, '&:hover': { borderColor: colors.red, bgcolor: '#fff0f0' }, textTransform: 'none', borderRadius: 2 }}
                              >
                                Reject
                              </Button>
                            </>
                          ) : (
                            <Box sx={{ width: '100%', p: 1, textAlign: 'center', borderRadius: 2, bgcolor: '#fff', border: `1px solid ${colors.line}` }}>
                              <Typography sx={{ fontSize: 13, fontWeight: 700, color: item.status === 'Accepted' || item.status === 'Ready' ? colors.green : colors.muted }}>
                                STATUS: {item.status.toUpperCase()}
                              </Typography>
                            </Box>
                          )}
                        </Stack>
                      </Box>
                    ))
                  ) : (
                    <Typography sx={{ color: colors.muted }}>No direct orders yet.</Typography>
                  )}
                </Stack>
              </Box>

              <Stack spacing={3}>
                <Box sx={{ p: 3, borderRadius: 4, border: `1px solid ${colors.line}`, bgcolor: colors.paper }}>
                  <Typography sx={{ fontSize: 18, mb: 3 }}>Low Stock Items</Typography>
                  <Stack spacing={1.5}>
                    {(data?.lowStockItems || []).length ? (
                      data.lowStockItems.map((stock) => (
                        <Box key={stock._id} sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                          <Box>
                            <Typography sx={{ fontSize: 14.5 }}>{stock.medicineName}</Typography>
                            <Typography sx={{ fontSize: 12.5, color: colors.muted }}>
                              Threshold {stock.lowStockThreshold}
                            </Typography>
                          </Box>
                          <Typography sx={{ fontSize: 14, color: colors.amber, fontWeight: 600 }}>
                            {stock.quantity}
                          </Typography>
                        </Box>
                      ))
                    ) : (
                      <Typography sx={{ color: colors.muted }}>No low stock alerts right now.</Typography>
                    )}
                  </Stack>
                </Box>

                <Box sx={{ p: 3, borderRadius: 4, border: `1px solid ${colors.line}`, bgcolor: colors.paper }}>
                  <Typography sx={{ fontSize: 18, mb: 3 }}>Notifications</Typography>
                  <Stack spacing={1.5}>
                    {(data?.notifications || []).slice(0, 5).map((item) => (
                      <Box key={item._id}>
                        <Typography sx={{ fontSize: 14.5 }}>{item.title}</Typography>
                        <Typography sx={{ fontSize: 12.5, color: colors.muted, mt: 0.3 }}>
                          {item.message}
                        </Typography>
                      </Box>
                    ))}
                    {!(data?.notifications || []).length && (
                      <Typography sx={{ color: colors.muted }}>No notifications right now.</Typography>
                    )}
                  </Stack>
                </Box>
              </Stack>
            </Box>
          </>
        )}
      </Box>
    </PharmacyLayout>
  );
}
