import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  MenuItem,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import PharmacyLayout from '../../components/PharmacyLayout';
import { fetchPharmacyPrescriptions } from '../../api/pharmacyApi';
import { useLanguage } from '../../context/LanguageContext';
import { PHARMACY_PRESCRIPTIONS_TRANSLATIONS } from '../../utils/translations/pharmacy';

const colors = {
  paper: '#ffffff',
  line: '#e1e3e1',
  text: '#202124',
  muted: '#5f6368',
  primary: '#1a73e8',
  primarySoft: '#e8f0fe',
  primaryDark: '#174ea6',
  success: '#1e8e3e',
  successSoft: '#e6f4ea',
  warning: '#f9ab00',
  warningSoft: '#fef7e0',
  red: '#d93025',
  redSoft: '#fce8e6'
};

const statusOptions = ['all', 'Pending', 'Ready', 'Partially Available', 'Completed'];

export default function PharmacyPrescriptions() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [query, setQuery] = useState('');
  
  const { language } = useLanguage();
  const t = PHARMACY_PRESCRIPTIONS_TRANSLATIONS[language] || PHARMACY_PRESCRIPTIONS_TRANSLATIONS['en'];

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const response = await fetchPharmacyPrescriptions(statusFilter === 'all' ? undefined : statusFilter);
        setPrescriptions(response.prescriptions || []);
      } catch (err) {
        setError(err.message || 'Failed to load prescriptions');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [statusFilter]);

  const filtered = useMemo(() => (
    prescriptions.filter((item) => {
      const haystack = [
        item.patient?.full_name,
        item.doctor?.full_name,
        item.prescriptionId,
        ...(item.medications || []).map((med) => med.name)
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return !query.trim() || haystack.includes(query.toLowerCase());
    })
  ), [prescriptions, query]);

  return (
    <PharmacyLayout>
      <Box sx={{ p: { xs: 2.5, md: 4, xl: 5 }, maxWidth: 1400, mx: 'auto' }}>
        <Typography sx={{ fontSize: { xs: 32, md: 36 }, fontWeight: 700, fontFamily: 'Inter, sans-serif', letterSpacing: '-0.5px', color: colors.text }}>
          {t.title}
        </Typography>
        <Typography sx={{ mt: 1, color: colors.muted, fontSize: 16, mb: 4 }}>
          {t.subtitle}
        </Typography>

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} sx={{ mb: 3 }}>
          <TextField
            placeholder={t.search}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            fullWidth
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5, bgcolor: colors.paper } }}
          />
          <TextField
            select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            sx={{ minWidth: 220, '& .MuiOutlinedInput-root': { borderRadius: 2.5, bgcolor: colors.paper } }}
          >
            {statusOptions.map((status) => {
              let displayStatus = status;
              if (status === 'all') displayStatus = t.all_statuses;
              else if (status === 'Pending') displayStatus = t.status_pending;
              else if (status === 'Ready') displayStatus = t.status_ready;
              else if (status === 'Partially Available') displayStatus = t.status_partially_available;
              else if (status === 'Completed') displayStatus = t.status_completed;

              return (
                <MenuItem key={status} value={status}>
                  {displayStatus}
                </MenuItem>
              );
            })}
          </TextField>
        </Stack>

        {loading ? (
          <Box sx={{ py: 8, display: 'grid', placeItems: 'center' }}>
            <CircularProgress sx={{ color: colors.primary }} />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ borderRadius: 3 }}>{error}</Alert>
        ) : (
          <Stack spacing={2}>
            {filtered.length ? filtered.map((item) => (
              <Box
                key={item._id}
                sx={{
                  p: 3,
                  bgcolor: colors.paper,
                  borderRadius: 4,
                  border: `1px solid ${colors.line}`,
                  boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
                  borderLeft: `4px solid ${
                    item.fulfillmentStatus === 'Completed' ? colors.primary :
                    item.fulfillmentStatus === 'Ready' ? colors.success :
                    item.fulfillmentStatus === 'Partially Available' ? colors.warning :
                    colors.red
                  }`
                }}
              >
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} justifyContent="space-between">
                  <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ fontSize: 16, fontWeight: 700, color: colors.text }}>
                      {item.patient?.full_name || t.patient}
                    </Typography>
                    <Typography sx={{ fontSize: 13, color: colors.muted, mt: 0.5 }}>
                      {t.doctor_prefix} {item.doctor?.full_name || 'Doctor'} • {item.prescriptionId}
                    </Typography>
                    <Typography sx={{ fontSize: 13, color: colors.muted, mt: 0.5 }}>
                      {(item.medications || []).map((med) => med.name).join(', ') || t.no_medicines}
                    </Typography>
                  </Box>
                  <Chip
                    label={item.fulfillmentStatus}
                    sx={{
                      alignSelf: 'flex-start',
                      bgcolor:
                        item.fulfillmentStatus === 'Completed' ? colors.primarySoft :
                        item.fulfillmentStatus === 'Ready' ? colors.successSoft :
                        item.fulfillmentStatus === 'Partially Available' ? colors.warningSoft :
                        colors.redSoft,
                      color:
                        item.fulfillmentStatus === 'Completed' ? colors.primary :
                        item.fulfillmentStatus === 'Ready' ? colors.success :
                        item.fulfillmentStatus === 'Partially Available' ? colors.warning :
                        colors.red,
                      fontWeight: 700
                    }}
                  />
                </Stack>
              </Box>
            )) : (
              <Typography sx={{ color: colors.muted }}>{t.no_prescriptions}</Typography>
            )}
          </Stack>
        )}
      </Box>
    </PharmacyLayout>
  );
}
