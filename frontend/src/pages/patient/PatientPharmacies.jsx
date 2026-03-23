import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  InputAdornment,
  MenuItem,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import {
  LocalPharmacyOutlined as PharmacyIcon,
  SearchRounded as SearchIcon,
  SendRounded as SendIcon
} from '@mui/icons-material';
import PatientShell from '../../components/patient/PatientShell';
import { fetchPharmacies, fetchMyRecords } from '../../api/patientApi';

const colors = {
  bg: '#f8f9fa',
  paper: '#ffffff',
  line: '#e0e0e0',
  soft: '#f0f0f0',
  text: '#202124',
  muted: '#5f6368',
  primary: '#1a73e8',
  primarySoft: '#e8f0fe',
  primaryDark: '#1557b0',
  success: '#1e8e3e',
  warning: '#f9ab00',
  danger: '#d93025',
  gray: '#9aa0a6'
};

const helpfulTips = [
  ['Always carry your prescription code - pharmacies can access it in the app.', colors.primaryDark],
  ['If a medicine is unavailable, ask the doctor to modify the brand.', colors.warning],
  ['Never buy prescription medicines without a valid doctor note.', colors.danger]
];

export default function PatientPharmacies() {
  const [pharmacies, setPharmacies] = useState([]);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('nearest');

  const loadData = async () => {
    setLoading(true);
    try {
      const [pharRes, recRes] = await Promise.all([
        fetchPharmacies(),
        fetchMyRecords()
      ]);
      if (pharRes.success) setPharmacies(pharRes.pharmacies || []);
      if (recRes.success) setRecords(recRes.records || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadData();
  }, []);

  const filteredPharmacies = pharmacies.filter(p => {
    const nameMatch = !query || p.user?.name?.toLowerCase().includes(query.toLowerCase()) || p.address?.toLowerCase().includes(query.toLowerCase());
    return nameMatch;
  });

  const activePrescriptions = records.filter(r => r.type === 'prescription');

  return (
    <PatientShell activeItem="pharmacies">
      <Box sx={{ px: { xs: 2, md: 4, xl: 5 }, py: { xs: 3, md: 4 }, bgcolor: colors.bg, minHeight: '100vh' }}>
        <Stack direction={{ xs: 'column', lg: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', lg: 'center' }} spacing={2} sx={{ mb: 4 }}>
          <Box>
            <Typography sx={{ fontSize: { xs: 28, md: 36 }, fontWeight: 600, color: colors.text, fontFamily: 'Inter, sans-serif' }}>
              Pharmacies
            </Typography>
            <Typography sx={{ mt: 0.5, color: colors.muted, fontSize: 16 }}>
              Find nearby pharmacies, check stock and send prescriptions.
            </Typography>
          </Box>

          <Stack direction="row" spacing={1.5} alignItems="center" useFlexGap flexWrap="wrap">
            <Button startIcon={<SendIcon />} sx={{ px: 3, py: 1.25, borderRadius: 1.5, bgcolor: colors.primary, color: '#fff', textTransform: 'none', fontSize: 15, fontWeight: 600, boxShadow: '0 2px 4px rgba(26,115,232,0.2)', '&:hover': { bgcolor: colors.primaryDark } }}>
              Send Prescription
            </Button>
          </Stack>
        </Stack>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', xl: 'repeat(4, 1fr)' }, gap: 3, mb: 4 }}>
          {[
            ['Nearby Pharmacies', pharmacies.length.toString(), 'Within your area'],
            ['Active Prescriptions', activePrescriptions.length.toString(), 'Awaiting fulfilment'],
            ['Medicines Available', activePrescriptions.length > 0 ? 'Full match' : '-', 'From your prescription'],
            ['Pickup Pending', '0', 'Ready for pickup']
          ].map(([title, value, subtitle]) => (
            <Box key={title} sx={{ p: 3, borderRadius: 2, border: `1px solid ${colors.line}`, bgcolor: colors.paper, boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
              <Typography sx={{ fontSize: 14, fontWeight: 600, color: colors.muted, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{title}</Typography>
              <Typography sx={{ mt: 1, fontSize: 32, fontWeight: 600, color: colors.text }}>{value}</Typography>
              <Typography sx={{ mt: 1, color: colors.muted, fontSize: 14 }}>{subtitle}</Typography>
            </Box>
          ))}
        </Box>

        <Stack direction={{ xs: 'column', xl: 'row' }} spacing={3} alignItems="flex-start">
          <Box sx={{ flex: 1, minWidth: 0, p: 3, borderRadius: 2, border: `1px solid ${colors.line}`, bgcolor: colors.paper, boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mb: 3 }}>
              {[
                ['all', 'All'],
                ['open', 'Open Now'],
                ['meds', 'Has My Medicines'],
                ['jan', 'Jan Aushadhi'],
                ['24h', '24-Hour']
              ].map(([value, label]) => (
                <Chip
                  key={value}
                  label={label}
                  clickable
                  onClick={() => setFilter(value)}
                  sx={{
                    px: 1,
                    py: 2,
                    borderRadius: 1.5,
                    border: `1px solid ${filter === value ? colors.primary : colors.line}`,
                    bgcolor: filter === value ? colors.primary : '#fff',
                    color: filter === value ? '#fff' : colors.muted,
                    fontSize: 14,
                    fontWeight: 500,
                    '&:hover': { bgcolor: filter === value ? colors.primaryDark : colors.soft }
                  }}
                />
              ))}
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mb: 4 }}>
              <TextField
                fullWidth
                placeholder="Search pharmacy or medicine"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                size="small"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" sx={{ color: colors.muted }} />
                    </InputAdornment>
                  )
                }}
              />
              <TextField
                select
                value={sort}
                onChange={(event) => setSort(event.target.value)}
                size="small"
                sx={{ minWidth: 160, '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
              >
                <MenuItem value="nearest">Nearest first</MenuItem>
                <MenuItem value="open">Open now</MenuItem>
                <MenuItem value="stock">Best stock match</MenuItem>
              </TextField>
            </Stack>

            {loading ? (
               <Box sx={{ py: 8, display: 'flex', justifyContent: 'center' }}><CircularProgress /></Box>
            ) : filteredPharmacies.length > 0 ? (
               <Stack spacing={2}>
                  {filteredPharmacies.map(p => (
                    <Box key={p._id} sx={{ p: 2.5, borderRadius: 2, border: `1px solid ${colors.line}`, bgcolor: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                       <Stack direction="row" spacing={2} alignItems="center">
                          <Box sx={{ p: 1.5, borderRadius: 1, bgcolor: colors.soft, color: colors.primary }}><PharmacyIcon /></Box>
                          <Box>
                             <Typography sx={{ fontSize: 16, fontWeight: 600 }}>{p.user?.name || 'Pharmacy'}</Typography>
                             <Typography sx={{ fontSize: 13, color: colors.muted }}>{p.address || 'Address not listed'}</Typography>
                             <Typography sx={{ fontSize: 13, color: colors.success, fontWeight: 600, mt: 0.5 }}>Open Now</Typography>
                          </Box>
                       </Stack>
                       <Button variant="outlined" sx={{ borderRadius: 1.5, textTransform: 'none', fontSize: 13 }}>View Stock</Button>
                    </Box>
                  ))}
               </Stack>
            ) : (
               <Box sx={{ py: 8, textAlign: 'center', bgcolor: colors.soft, borderRadius: 2, border: `1px dashed ${colors.line}` }}>
                  <PharmacyIcon sx={{ fontSize: 48, color: colors.gray, mb: 2 }} />
                  <Typography sx={{ color: colors.text, fontSize: 16, fontWeight: 500 }}>No pharmacies found</Typography>
                  <Typography sx={{ color: colors.muted, fontSize: 14, mt: 1 }}>
                    {query || filter !== 'all' ? 'Try adjusting your search or filters.' : 'There are no active pharmacies in your area right now.'}
                  </Typography>
               </Box>
            )}

          </Box>

          <Stack spacing={3} sx={{ width: { xs: '100%', xl: 320 }, flexShrink: 0 }}>
            <Box sx={{ p: 3, borderRadius: 2, border: `1px solid ${colors.primary}`, bgcolor: colors.primarySoft }}>
              <Typography sx={{ fontSize: 16, fontWeight: 600, color: colors.primaryDark, mb: 1 }}>Active Prescriptions</Typography>
              {activePrescriptions.length > 0 ? (
                <Stack spacing={1} sx={{ mt: 2 }}>
                  {activePrescriptions.slice(0, 5).map((item) => (
                    <Typography key={item._id} sx={{ color: colors.primaryDark, fontSize: 14 }}>• {item.title}</Typography>
                  ))}
                  <Button sx={{ mt: 2, width: '100%', py: 1, borderRadius: 1.5, bgcolor: '#fff', color: colors.primaryDark, textTransform: 'none', fontSize: 14, fontWeight: 600, border: `1px solid ${colors.primary}` }}>
                    Send to pharmacy
                  </Button>
                </Stack>
              ) : (
                <Typography sx={{ color: colors.primaryDark, fontSize: 14, mt: 1 }}>No active prescriptions available.</Typography>
              )}
            </Box>

            <Box sx={{ p: 3, borderRadius: 2, border: `1px solid ${colors.line}`, bgcolor: colors.paper, boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
              <Typography sx={{ fontSize: 16, fontWeight: 600, color: colors.text, mb: 2 }}>Helpful tips</Typography>
              <Stack spacing={1.5}>
                {helpfulTips.map(([text, dotColor]) => (
                  <Stack key={text} direction="row" spacing={1.5} alignItems="flex-start" sx={{ pt: 1, borderTop: `1px solid ${colors.soft}`, '&:first-of-type': { pt: 0, borderTop: 'none' } }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: dotColor, mt: 0.6, flexShrink: 0 }} />
                    <Typography sx={{ color: colors.text, fontSize: 14, lineHeight: 1.5 }}>{text}</Typography>
                  </Stack>
                ))}
              </Stack>
            </Box>
          </Stack>
        </Stack>
      </Box>
    </PatientShell>
  );
}
