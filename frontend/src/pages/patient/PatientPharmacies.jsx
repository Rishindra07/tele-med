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
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  Typography,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import {
  LocalPharmacyOutlined as PharmacyIcon,
  SearchRounded as SearchIcon,
  SendRounded as SendIcon,
  InfoOutlined as InfoIcon,
  CheckCircleRounded as CheckIcon,
  WarningRounded as WarningIcon,
  CancelRounded as ErrorIcon,
  DirectionsRunRounded as DistanceIcon,
  AccessTimeRounded as TimeIcon
} from '@mui/icons-material';
import PatientShell from '../../components/patient/PatientShell';
import { fetchPharmacies, fetchMyRecords, assignPrescriptionToPharmacy, fetchPharmacyStock } from '../../api/patientApi';

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
  const [selectedPharmacy, setSelectedPharmacy] = useState(null);
  const [selectedRx, setSelectedRx] = useState('');
  const [sendOpen, setSendOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // New state for stock viewing
  const [stockOpen, setStockOpen] = useState(false);
  const [pharmacyStock, setPharmacyStock] = useState([]);
  const [fetchingStock, setFetchingStock] = useState(false);
  const [viewingPharmacy, setViewingPharmacy] = useState(null);

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

  useEffect(() => {
    loadData();
  }, []);

  const activePrescriptions = records.filter(r => r.type === 'prescription');
  const latestRx = activePrescriptions[0]?.prescription;

  const isPharmacyOpen = (p) => {
    if (!p.openTime || !p.closeTime) return true; // Assume open if not specified
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const [openH, openM] = p.openTime.split(':').map(Number);
    const [closeH, closeM] = p.closeTime.split(':').map(Number);
    
    const openTime = openH * 60 + openM;
    const closeTime = closeH * 60 + closeM;
    
    return currentTime >= openTime && currentTime <= closeTime;
  };

  const checkAvailability = (stock, medications) => {
    if (!medications || medications.length === 0) return 'none';
    
    const matchCount = medications.filter(med => 
      stock.some(s => s.medicineName.toLowerCase() === med.name.toLowerCase() && s.quantity > 0)
    ).length;

    if (matchCount === medications.length) return 'full';
    if (matchCount > 0) return 'partial';
    return 'none';
  };

  const filteredPharmacies = pharmacies.filter(p => {
    const nameMatch = !query || 
      p.pharmacyName?.toLowerCase().includes(query.toLowerCase()) || 
      p.user?.full_name?.toLowerCase().includes(query.toLowerCase()) || 
      p.address?.toLowerCase().includes(query.toLowerCase());
    
    // Filter by open/closed if applicable (mocked for now or based on data)
    const openMatch = filter === 'open' ? isPharmacyOpen(p) : true;
    const janMatch = filter === 'jan' ? p.isJanAushadhi : true;
    
    return nameMatch && openMatch && janMatch;
  });

  const handleOpenSend = (pharmacy) => {
    setSelectedPharmacy(pharmacy);
    if (activePrescriptions.length > 0) {
      setSelectedRx(activePrescriptions[0]._id);
    }
    setSendOpen(true);
  };

  const handleViewStock = async (pharmacy) => {
    setViewingPharmacy(pharmacy);
    setFetchingStock(true);
    setStockOpen(true);
    try {
      const res = await fetchPharmacyStock(pharmacy._id);
      if (res.success) {
        setPharmacyStock(res.stock || []);
      }
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: 'Failed to fetch stock', severity: 'error' });
    } finally {
      setFetchingStock(false);
    }
  };

  const handleSendToPharmacy = async () => {
    if (!selectedRx || !selectedPharmacy) return;
    setSending(true);
    try {
      const res = await assignPrescriptionToPharmacy({
        prescriptionId: records.find(r => r._id === selectedRx)?.prescription?._id || selectedRx,
        pharmacyId: selectedPharmacy._id
      });
      if (res.success) {
        setSnackbar({ open: true, message: 'Prescription sent to pharmacy!', severity: 'success' });
        setSendOpen(false);
      }
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.message || 'Failed to send prescription', severity: 'error' });
    } finally {
      setSending(false);
    }
  };

  // Summary logic
  const matchSummary = activePrescriptions.length > 0 ? 'Evaluating...' : 'No prescription';

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
            <Button 
              variant="contained" 
              startIcon={<SendIcon />} 
              onClick={() => activePrescriptions.length > 0 && handleOpenSend(null)}
              disabled={activePrescriptions.length === 0}
              sx={{ px: 3, py: 1.25, borderRadius: 1.5, bgcolor: colors.primary, color: '#fff', textTransform: 'none', fontSize: 15, fontWeight: 600, boxShadow: '0 2px 4px rgba(26,115,232,0.2)', '&:hover': { bgcolor: colors.primaryDark } }}
            >
              Send Prescription
            </Button>
          </Stack>
        </Stack>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', xl: 'repeat(4, 1fr)' }, gap: 3, mb: 4 }}>
          {[
            ['Nearby Pharmacies', pharmacies.length.toString(), 'Within your area'],
            ['Active Prescriptions', activePrescriptions.length.toString(), 'Awaiting fulfilment'],
            ['Medicines Available', latestRx ? 'Full match' : 'None', 'From your prescription'],
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
              </TextField>
            </Stack>

            {loading ? (
               <Box sx={{ py: 8, display: 'flex', justifyContent: 'center' }}><CircularProgress /></Box>
            ) : filteredPharmacies.length > 0 ? (
               <Stack spacing={2}>
                  {filteredPharmacies.map(p => {
                    const isOpen = isPharmacyOpen(p);
                    return (
                      <Box key={p._id} sx={{ p: 2.5, borderRadius: 2, border: `1px solid ${colors.line}`, bgcolor: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.2s', '&:hover': { borderColor: colors.primary, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' } }}>
                         <Stack direction="row" spacing={2} alignItems="center">
                            <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: colors.soft, color: colors.primary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <PharmacyIcon />
                            </Box>
                            <Box>
                               <Typography sx={{ fontSize: 16, fontWeight: 600 }}>{p.pharmacyName || p.user?.full_name || 'Pharmacy'}</Typography>
                               <Typography sx={{ fontSize: 13, color: colors.muted, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                 {p.address || 'Address not listed'}
                               </Typography>
                               <Stack direction="row" spacing={1.5} sx={{ mt: 1 }}>
                                 <Typography sx={{ fontSize: 12, color: isOpen ? colors.success : colors.danger, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                   <TimeIcon sx={{ fontSize: 14 }} /> {isOpen ? 'Open Now' : 'Closed'} {p.openTime ? `(${p.openTime} - ${p.closeTime})` : ''}
                                 </Typography>
                                 <Typography sx={{ fontSize: 12, color: colors.muted, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                   <DistanceIcon sx={{ fontSize: 14 }} /> {p.distanceKm ? `${p.distanceKm} km` : 'Near you'}
                                 </Typography>
                               </Stack>
                            </Box>
                         </Stack>
                          <Stack direction="row" spacing={1}>
                            <Button variant="outlined" onClick={() => handleViewStock(p)} sx={{ borderRadius: 1.5, textTransform: 'none', fontSize: 13, borderColor: colors.line, color: colors.text, '&:hover': { borderColor: colors.primary, bgcolor: colors.primarySoft } }}>View Stock</Button>
                            <Button variant="contained" onClick={() => handleOpenSend(p)} sx={{ borderRadius: 1.5, textTransform: 'none', fontSize: 13, bgcolor: colors.primary, '&:hover': { bgcolor: colors.primaryDark } }}>Send Prescription</Button>
                          </Stack>
                       </Box>
                    );
                  })}
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
                    <Box key={item._id} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <InfoIcon sx={{ fontSize: 14, color: colors.primary }} />
                      <Typography sx={{ color: colors.primaryDark, fontSize: 14, fontWeight: 500 }}>{item.title}</Typography>
                    </Box>
                  ))}
                  <Button 
                    onClick={() => handleOpenSend(null)}
                    sx={{ mt: 2, width: '100%', py: 1, borderRadius: 1.5, bgcolor: '#fff', color: colors.primaryDark, textTransform: 'none', fontSize: 14, fontWeight: 600, border: `1px solid ${colors.primary}`, '&:hover': { bgcolor: colors.primarySoft } }}
                  >
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
                    <Typography sx={{ color: colors.text, fontSize: 13, lineHeight: 1.5 }}>{text}</Typography>
                  </Stack>
                ))}
              </Stack>
            </Box>
          </Stack>
        </Stack>
      </Box>

      {/* Stock Dialog */}
      <Dialog open={stockOpen} onClose={() => setStockOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3, p: 1 } }}>
        <DialogTitle sx={{ fontWeight: 700, pb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>Medicine Inventory</Typography>
            <Typography sx={{ fontSize: 13, color: colors.muted, fontWeight: 400 }}>{viewingPharmacy?.pharmacyName}</Typography>
          </Box>
          <Chip label={isPharmacyOpen(viewingPharmacy || {}) ? "Open" : "Closed"} color={isPharmacyOpen(viewingPharmacy || {}) ? "success" : "error"} size="small" />
        </DialogTitle>
        <DialogContent dividers sx={{ pt: 2 }}>
          {fetchingStock ? (
            <Box sx={{ py: 6, textAlign: 'center' }}><CircularProgress size={32} /></Box>
          ) : pharmacyStock.length > 0 ? (
            <Box>
              {latestRx && (
                <Box sx={{ mb: 3, p: 2, bgcolor: colors.primarySoft, borderRadius: 2, border: `1px solid ${colors.primary}` }}>
                  <Typography sx={{ fontSize: 13, fontWeight: 700, color: colors.primaryDark, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckIcon sx={{ fontSize: 16 }} /> CHECKING AGAINST YOUR PRESCRIPTION
                  </Typography>
                  <Stack spacing={1}>
                    {latestRx.medications.map(med => {
                       const inStock = pharmacyStock.find(s => s.medicineName.toLowerCase() === med.name.toLowerCase() && s.quantity > 0);
                       return (
                         <Box key={med.name} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                           <Typography sx={{ fontSize: 14, color: colors.text }}>{med.name} ({med.dosage})</Typography>
                           {inStock ? (
                             <Chip label="In Stock" size="small" sx={{ height: 20, fontSize: 11, bgcolor: colors.success, color: '#fff' }} icon={<CheckIcon sx={{ fontSize: '12px !important', color: '#fff !important' }} />} />
                           ) : (
                             <Chip label="Not Available" size="small" sx={{ height: 20, fontSize: 11, bgcolor: colors.danger, color: '#fff' }} icon={<ErrorIcon sx={{ fontSize: '12px !important', color: '#fff !important' }} />} />
                           )}
                         </Box>
                       );
                    })}
                  </Stack>
                </Box>
              )}

              <Typography sx={{ fontSize: 14, fontWeight: 700, mb: 2, color: colors.muted }}>ALL AVAILABLE MEDICINES</Typography>
              <List disablePadding>
                {pharmacyStock.map((item, idx) => (
                  <React.Fragment key={item._id}>
                    <ListItem sx={{ px: 1 }}>
                      <ListItemIcon sx={{ minWidth: 40 }}>
                         <Box sx={{ width: 32, height: 32, bgcolor: colors.soft, borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.primary }}>
                           <PharmacyIcon sx={{ fontSize: 18 }} />
                         </Box>
                      </ListItemIcon>
                      <ListItemText 
                        primary={<Typography sx={{ fontWeight: 600, fontSize: 15 }}>{item.medicineName}</Typography>}
                        secondary={item.genericName || item.form}
                      />
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography sx={{ fontWeight: 600, fontSize: 14, color: item.quantity > 10 ? colors.success : colors.warning }}>
                          {item.quantity} units
                        </Typography>
                        <Typography sx={{ fontSize: 11, color: colors.muted }}>Available</Typography>
                      </Box>
                    </ListItem>
                    {idx < pharmacyStock.length - 1 && <Divider component="li" />}
                  </React.Fragment>
                ))}
              </List>
            </Box>
          ) : (
            <Box sx={{ py: 6, textAlign: 'center' }}>
               <InfoIcon sx={{ fontSize: 40, color: colors.gray, mb: 1 }} />
               <Typography color="textSecondary">No inventory data available for this pharmacy.</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setStockOpen(false)} sx={{ textTransform: 'none', fontWeight: 600 }}>Close</Button>
          <Button variant="contained" onClick={() => { setStockOpen(false); handleOpenSend(viewingPharmacy); }} sx={{ textTransform: 'none', fontWeight: 600, bgcolor: colors.primary }}>Send Prescription</Button>
        </DialogActions>
      </Dialog>

      {/* Send Dialog */}
      <Dialog open={sendOpen} onClose={() => setSendOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
        <DialogTitle sx={{ fontWeight: 600 }}>Send to Pharmacy</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2, color: colors.muted }}>
            Choose which prescription you want to send to <strong>{selectedPharmacy?.pharmacyName || selectedPharmacy?.user?.full_name || 'this pharmacy'}</strong>.
          </Typography>
          {activePrescriptions.length > 0 ? (
            <FormControl fullWidth sx={{ mt: 1 }}>
              <InputLabel>Select Prescription</InputLabel>
              <Select
                value={selectedRx}
                label="Select Prescription"
                onChange={(e) => setSelectedRx(e.target.value)}
              >
                {activePrescriptions.map((rx) => (
                  <MenuItem key={rx._id} value={rx._id}>
                    {rx.title} ({new Date(rx.date || rx.createdAt).toLocaleDateString()})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : (
             <Alert severity="warning">You have no active prescriptions to send.</Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setSendOpen(false)} sx={{ color: colors.muted }}>Cancel</Button>
          <Button variant="contained" onClick={handleSendToPharmacy} disabled={sending || activePrescriptions.length === 0} sx={{ bgcolor: colors.primary, px: 3, borderRadius: 1.5 }}>
            {sending ? 'Sending...' : 'Confirm & Send'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar(p => ({ ...p, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={snackbar.severity} variant="filled" sx={{ borderRadius: 1.5 }}>{snackbar.message}</Alert>
      </Snackbar>
    </PatientShell>
  );
}
