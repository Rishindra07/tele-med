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
import { fetchPharmacyDashboard } from '../../api/pharmacyApi';

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
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
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

    load();
  }, []);

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
        <Typography sx={{ fontSize: { xs: 32, md: 38 }, fontFamily: 'Georgia, serif', lineHeight: 1.1 }}>
          Pharmacy Dashboard
        </Typography>
        <Typography sx={{ mt: 1.5, color: colors.muted, fontSize: 14.5, mb: 4 }}>
          Live prescription queue, stock pressure, and fulfillment updates.
        </Typography>

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
                <Typography sx={{ fontSize: 18, mb: 3 }}>Recent Prescription Queue</Typography>
                <Stack spacing={2}>
                  {(data?.prescriptions || []).length ? (
                    data.prescriptions.map((item) => (
                      <Box key={item._id} sx={{ p: 2, borderRadius: 2.5, bgcolor: colors.soft }}>
                        <Typography sx={{ fontSize: 15, fontWeight: 600 }}>
                          {item.patient?.full_name || 'Patient'}
                        </Typography>
                        <Typography sx={{ fontSize: 12.5, color: colors.muted, mt: 0.5 }}>
                          Dr. {item.doctor?.full_name || 'Doctor'} • {item.prescriptionId}
                        </Typography>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1.25 }} useFlexGap flexWrap="wrap">
                          <Chip size="small" label={item.fulfillmentStatus} sx={{ bgcolor: colors.greenSoft, color: colors.greenDark }} />
                          <Typography sx={{ fontSize: 12.5, color: colors.muted }}>
                            {Array.isArray(item.medications) ? item.medications.length : 0} medicines
                          </Typography>
                        </Stack>
                      </Box>
                    ))
                  ) : (
                    <Typography sx={{ color: colors.muted }}>No prescriptions in the queue.</Typography>
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
