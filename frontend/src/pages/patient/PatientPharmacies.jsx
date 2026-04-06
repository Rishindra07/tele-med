import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { PATIENT_PHARMACIES_TRANSLATIONS } from '../../utils/translations/patient';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  InputAdornment,
  IconButton,
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
  AccessTimeRounded as TimeIcon,
  MapRounded as MapIcon,
  ListRounded as ListIcon,
  MyLocationRounded as LocationIcon,
  PhoneRounded as CallIcon
} from '@mui/icons-material';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for leaflet default icons in React
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Custom Pharmacy Icon for Map
const createPharmacyIcon = (color) => L.divIcon({
  html: `<div style="background-color: ${color}; width: 32px; height: 32px; border-radius: 50%; display: flex; alignItems: center; justifyContent: center; color: white; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"><svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" style="margin: auto;"><path d="M21 9h-4V5c0-1.1-.9-2-2-2H9c-1.1 0-2 .9-2 2v4H3c-1.1 0-2 .9-2 2v9c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2v-9c0-1.1-.9-2-2-2zM9 5h6v4H9V5zm12 15H3v-9h4v2h2v-2h6v2h2v-2h4v9z"/></svg></div>`,
  className: '',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});
import PatientShell from '../../components/patient/PatientShell';
import { fetchPharmacies, fetchMyRecords, assignPrescriptionToPharmacy, fetchPharmacyStock, fetchPatientProfile } from '../../api/patientApi';

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



export default function PatientPharmacies() {
  const { language } = useLanguage();
  const t = PATIENT_PHARMACIES_TRANSLATIONS[language] || PATIENT_PHARMACIES_TRANSLATIONS['en'];

  const helpfulTips = [
    [t.tip_1, colors.primaryDark],
    [t.tip_2, colors.warning],
    [t.tip_3, colors.danger]
  ];

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
  
  // New state for delivery
  const [deliveryType, setDeliveryType] = useState('PICKUP');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [patientProfile, setPatientProfile] = useState(null);
  
  // New state for View Mode and Location
  const [viewMode, setViewMode] = useState('list');
  const [userLocation, setUserLocation] = useState([17.3850, 78.4867]); // Default: Hyderabad
  const [mapCenter, setMapCenter] = useState([17.3850, 78.4867]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Get user location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;
            setUserLocation([lat, lng]);
            setMapCenter([lat, lng]);
          },
          (err) => console.warn("Location access denied or failed", err),
          { timeout: 5000 }
        );
      }

      const [pharRes, recRes, profRes] = await Promise.all([
        fetchPharmacies(),
        fetchMyRecords(),
        fetchPatientProfile()
      ]);
      if (pharRes.success) setPharmacies(pharRes.pharmacies || []);
      if (recRes.success) setRecords(recRes.records || []);
      if (profRes.success) {
        setPatientProfile(profRes.patient);
        setDeliveryAddress(profRes.patient.address || '');
      }
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
    
    const parseTime = (timeStr) => {
      if (!timeStr) return 0;
      const [hPart, mPart] = timeStr.split(':');
      let hours = parseInt(hPart);
      let minutes = 0;
      let ampm = '';

      if (mPart.includes(' ')) {
        const parts = mPart.split(' ');
        minutes = parseInt(parts[0]);
        ampm = parts[1].toUpperCase();
      } else {
        minutes = parseInt(mPart);
      }

      if (ampm === 'PM' && hours < 12) hours += 12;
      if (ampm === 'AM' && hours === 12) hours = 0;
      
      return hours * 60 + (isNaN(minutes) ? 0 : minutes);
    };

    const openTime = parseTime(p.openTime);
    const closeTime = parseTime(p.closeTime);
    
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
    setDeliveryType('PICKUP');
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
      setSnackbar({ open: true, message: t.snack_stock_error, severity: 'error' });
    } finally {
      setFetchingStock(false);
    }
  };

  const reverseGeocode = async (lat, lng) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
      const data = await response.json();
      if (data && data.address) {
        const addr = data.address;
        const village = addr.village || addr.town || addr.suburb || addr.neighbourhood || '';
        const mandal = addr.county || addr.subdistrict || '';
        const dist = addr.state_district || addr.county || '';
        const state = addr.state || '';
        const pincode = addr.postcode || '';
        const fullParts = [village, mandal, dist, state, pincode].filter(Boolean);
        return fullParts.join(', ');
      }
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    } catch (err) {
      console.error('Reverse geocode failed:', err);
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }
  };

  const handleSendToPharmacy = async () => {
    if (!selectedRx) return;
    try {
      setSending(true);
      const res = await assignPrescriptionToPharmacy({
        prescriptionId: records.find(r => r._id === selectedRx)?.prescription?._id || selectedRx,
        pharmacyId: selectedPharmacy._id,
        deliveryType,
        deliveryAddress: deliveryType === 'HOME' ? deliveryAddress : null
      });
      if (res.success) {
        setSnackbar({ open: true, message: t.snack_sent, severity: 'success' });
        setSendOpen(false);
      } else {
        setSnackbar({ open: true, message: res.message || t.snack_error, severity: 'error' });
      }
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: t.snack_error, severity: 'error' });
    } finally {
      setSending(false);
    }
  };

  const handleMapClick = (e) => {
    const { lat, lng } = e.latlng;
    setUserLocation([lat, lng]);
    setSnackbar({ open: true, message: t.snack_location, severity: 'success' });
  };

  // Summary logic
  const matchSummary = activePrescriptions.length > 0 ? 'Evaluating...' : 'No prescription';

  return (
    <PatientShell activeItem="pharmacies">
      <Box sx={{ px: { xs: 2, md: 4, xl: 5 }, py: { xs: 3, md: 4 }, bgcolor: colors.bg, minHeight: '100vh' }}>
        <Stack direction={{ xs: 'column', lg: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', lg: 'center' }} spacing={2} sx={{ mb: 4 }}>
          <Box>
            <Typography sx={{ fontSize: { xs: 28, md: 36 }, fontWeight: 600, color: colors.text, fontFamily: 'Inter, sans-serif' }}>
              {t.title}
            </Typography>
            <Typography sx={{ mt: 0.5, color: colors.muted, fontSize: 16 }}>
              {t.subtitle}
            </Typography>
          </Box>

          <Stack direction="row" spacing={1.5} alignItems="center" useFlexGap flexWrap="wrap">
            <Stack direction="row" spacing={0.5} sx={{ bgcolor: colors.soft, p: 0.5, borderRadius: 2 }}>
               <Button 
                 onClick={() => setViewMode('list')}
                 variant={viewMode === 'list' ? 'contained' : 'text'}
                 startIcon={<ListIcon />}
                 sx={{ borderRadius: 1.5, textTransform: 'none', px: 2, bgcolor: viewMode === 'list' ? '#fff' : 'transparent', color: viewMode === 'list' ? colors.primary : colors.muted, boxShadow: viewMode === 'list' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', '&:hover': { bgcolor: viewMode === 'list' ? '#fff' : colors.line } }}
               >
                 {t.btn_list}
               </Button>
               <Button 
                 onClick={() => setViewMode('map')}
                 variant={viewMode === 'map' ? 'contained' : 'text'}
                 startIcon={<MapIcon />}
                 sx={{ borderRadius: 1.5, textTransform: 'none', px: 2, bgcolor: viewMode === 'map' ? '#fff' : 'transparent', color: viewMode === 'map' ? colors.primary : colors.muted, boxShadow: viewMode === 'map' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', '&:hover': { bgcolor: viewMode === 'map' ? '#fff' : colors.line } }}
               >
                 {t.btn_map}
               </Button>
            </Stack>
            <Button 
              variant="contained" 
              startIcon={<SendIcon />} 
              onClick={() => activePrescriptions.length > 0 && handleOpenSend(null)}
              disabled={activePrescriptions.length === 0}
              sx={{ px: 3, py: 1.25, borderRadius: 1.5, bgcolor: colors.primary, color: '#fff', textTransform: 'none', fontSize: 15, fontWeight: 600, boxShadow: '0 2px 4px rgba(26,115,232,0.2)', '&:hover': { bgcolor: colors.primaryDark } }}
            >
              {t.btn_send_prescription}
            </Button>
          </Stack>
        </Stack>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', xl: 'repeat(4, 1fr)' }, gap: 3, mb: 4 }}>
          {[
            [t.stat_nearby, pharmacies.length.toString(), t.stat_nearby_sub],
            [t.stat_active_rx, activePrescriptions.length.toString(), t.stat_active_rx_sub],
            [t.stat_medicines, latestRx ? t.stat_medicines_val_full : t.stat_medicines_val_none, t.stat_medicines_sub],
            [t.stat_pickup, '0', t.stat_pickup_sub]
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
                ['all', t.filter_all],
                ['open', t.filter_open],
                ['jan', t.filter_jan],
                ['24h', t.filter_24h]
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
                placeholder={t.search_placeholder}
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
                <MenuItem value="nearest">{t.sort_nearest}</MenuItem>
                <MenuItem value="open">{t.sort_open}</MenuItem>
              </TextField>
            </Stack>

            {loading ? (
               <Box sx={{ py: 8, display: 'flex', justifyContent: 'center' }}><CircularProgress /></Box>
            ) : viewMode === 'list' ? (
               filteredPharmacies.length > 0 ? (
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
                                   {p.address || t.address_not_listed}
                                 </Typography>
                                 <Stack direction="row" spacing={1.5} sx={{ mt: 1 }}>
                                   <Typography sx={{ fontSize: 12, color: isOpen ? colors.success : colors.danger, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                     <TimeIcon sx={{ fontSize: 14 }} /> {isOpen ? t.open_now : t.closed} {p.openTime ? `(${p.openTime} - ${p.closeTime})` : ''}
                                   </Typography>
                                    <Typography sx={{ fontSize: 12, color: colors.muted, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                      <DistanceIcon sx={{ fontSize: 14 }} /> {p.distanceKm ? `${p.distanceKm} km` : t.near_you}
                                    </Typography>
                                    {p.deliveryAvailable && (
                                      <Chip 
                                        size="small" 
                                        label={t.delivery_available} 
                                        icon={<SendIcon sx={{ fontSize: '12px !important' }} />}
                                        sx={{ height: 20, fontSize: 10, bgcolor: colors.primarySoft, color: colors.primary, fontWeight: 600 }} 
                                      />
                                    )}
                                  </Stack>
                               </Box>
                            </Stack>
                            <Stack direction="row" spacing={1}>
                               {p.phone && (
                                 <Button 
                                   variant="outlined" 
                                   href={`tel:${p.phone}`} 
                                   sx={{ minWidth: 40, p: 1, borderRadius: 1.5, borderColor: colors.line, color: colors.muted, '&:hover': { color: colors.primary, borderColor: colors.primary } }}
                                 >
                                   <CallIcon sx={{ fontSize: 18 }} />
                                 </Button>
                               )}
                               <Button variant="outlined" onClick={() => handleViewStock(p)} sx={{ borderRadius: 1.5, textTransform: 'none', fontSize: 13, borderColor: colors.line, color: colors.text, '&:hover': { borderColor: colors.primary, bgcolor: colors.primarySoft } }}>{t.view_stock}</Button>
                               <Button variant="contained" onClick={() => handleOpenSend(p)} sx={{ borderRadius: 1.5, textTransform: 'none', fontSize: 13, bgcolor: colors.primary, color: '#fff', '&:hover': { bgcolor: colors.primaryDark } }}>{t.send_prescription}</Button>
                            </Stack>
                         </Box>
                      );
                    })}
                 </Stack>
               ) : (
                 <Box sx={{ py: 8, textAlign: 'center', bgcolor: colors.soft, borderRadius: 2, border: `1px dashed ${colors.line}` }}>
                    <PharmacyIcon sx={{ fontSize: 48, color: colors.gray, mb: 2 }} />
                    <Typography sx={{ color: colors.text, fontSize: 16, fontWeight: 500 }}>{t.no_pharmacies}</Typography>
                    <Typography sx={{ color: colors.muted, fontSize: 14, mt: 1 }}>
                      {query || filter !== 'all' ? t.no_pharmacies_filter : t.no_pharmacies_area}
                    </Typography>
                 </Box>
               )
            ) : (
              <Box sx={{ height: 600, borderRadius: 2, overflow: 'hidden', border: `1px solid ${colors.line}`, position: 'relative' }}>
                <MapContainer center={mapCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' />
                  
                  <LocationPicker onLocationSelect={handleMapClick} />

                  {/* User Location Marker */}
                  <Marker position={userLocation} icon={L.divIcon({
                    html: `<div style="background-color: #4285F4; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.3);"></div>`,
                    className: '',
                    iconSize: [24, 24],
                    iconAnchor: [12, 12]
                  })}>
                    <Popup>{t.your_location_popup}</Popup>
                  </Marker>

                  {/* Pharmacy Markers */}
                  {filteredPharmacies.map(p => (
                    <Marker 
                      key={p._id} 
                      position={[p.location?.lat || 17.3850, p.location?.lng || 78.4867]} 
                      icon={createPharmacyIcon(p.isJanAushadhi ? colors.warning : colors.primary)}
                    >
                      <Popup>
                        <Box sx={{ p: 1, minWidth: 200 }}>
                          <Typography sx={{ fontWeight: 700, fontSize: 16, mb: 0.5 }}>{p.pharmacyName}</Typography>
                          {p.deliveryAvailable && (
                            <Typography sx={{ fontSize: 11, color: colors.success, fontWeight: 700, mb: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              🚚 {t.delivery_available}
                            </Typography>
                          )}
                          <Typography sx={{ fontSize: 12, color: colors.muted, mb: 2 }}>{p.address}</Typography>
                          <Stack direction="row" spacing={1}>
                            {p.phone && (
                              <Button 
                                size="small" 
                                variant="outlined" 
                                href={`tel:${p.phone}`} 
                                sx={{ minWidth: 32, p: 0.5, borderRadius: 1.5 }}
                              >
                                📞
                              </Button>
                            )}
                            <Button size="small" variant="outlined" onClick={() => handleViewStock(p)} sx={{ fontSize: 11, py: 0.5 }}>{t.view_stock}</Button>
                            <Button size="small" variant="contained" onClick={() => handleOpenSend(p)} sx={{ fontSize: 11, py: 0.5, bgcolor: colors.primary, color: '#fff' }}>{t.stock_send_rx}</Button>
                          </Stack>
                        </Box>
                      </Popup>
                    </Marker>
                  ))}
                  
                  <MapUpdater center={mapCenter} />
                </MapContainer>
                
                {/* Floating Map Controls */}
                <Box sx={{ position: 'absolute', bottom: 20, right: 20, zIndex: 1000 }}>
                  <Button 
                    variant="contained" 
                    onClick={() => setMapCenter(userLocation)}
                    startIcon={<LocationIcon />}
                    sx={{ bgcolor: '#fff', color: colors.text, '&:hover': { bgcolor: colors.soft } }}
                  >
                    {t.recenter}
                  </Button>
                </Box>
              </Box>
            )}

          </Box>

          <Stack spacing={3} sx={{ width: { xs: '100%', xl: 320 }, flexShrink: 0 }}>
            <Box sx={{ p: 3, borderRadius: 2, border: `1px solid ${colors.primary}`, bgcolor: colors.primarySoft }}>
              <Typography sx={{ fontSize: 16, fontWeight: 600, color: colors.primaryDark, mb: 1 }}>{t.active_prescriptions}</Typography>
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
                    {t.send_to_pharmacy}
                  </Button>
                </Stack>
              ) : (
                <Typography sx={{ color: colors.primaryDark, fontSize: 14, mt: 1 }}>{t.no_active_rx}</Typography>
              )}
            </Box>

            <Box sx={{ p: 3, borderRadius: 2, border: `1px solid ${colors.line}`, bgcolor: colors.paper, boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
              <Typography sx={{ fontSize: 16, fontWeight: 600, color: colors.text, mb: 2 }}>{t.helpful_tips}</Typography>
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
            <Typography variant="h6" sx={{ fontWeight: 700 }}>{t.medicine_inventory}</Typography>
            <Typography sx={{ fontSize: 13, color: colors.muted, fontWeight: 400 }}>{viewingPharmacy?.pharmacyName}</Typography>
          </Box>
          <Chip label={isPharmacyOpen(viewingPharmacy || {}) ? t.open_label : t.closed_label} color={isPharmacyOpen(viewingPharmacy || {}) ? "success" : "error"} size="small" />
        </DialogTitle>
        <DialogContent dividers sx={{ pt: 2 }}>
          {fetchingStock ? (
            <Box sx={{ py: 6, textAlign: 'center' }}><CircularProgress size={32} /></Box>
          ) : pharmacyStock.length > 0 ? (
            <Box>
              {latestRx && (
                <Box sx={{ mb: 3, p: 2, bgcolor: colors.primarySoft, borderRadius: 2, border: `1px solid ${colors.primary}` }}>
                  <Typography sx={{ fontSize: 13, fontWeight: 700, color: colors.primaryDark, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckIcon sx={{ fontSize: 16 }} /> {t.checking_rx}
                  </Typography>
                  <Stack spacing={1}>
                    {latestRx.medications.map(med => {
                       const inStock = pharmacyStock.find(s => s.medicineName.toLowerCase() === med.name.toLowerCase() && s.quantity > 0);
                       return (
                         <Box key={med.name} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                           <Typography sx={{ fontSize: 14, color: colors.text }}>{med.name} ({med.dosage})</Typography>
                           {inStock ? (
                             <Chip label={t.in_stock} size="small" sx={{ height: 20, fontSize: 11, bgcolor: colors.success, color: '#fff' }} icon={<CheckIcon sx={{ fontSize: '12px !important', color: '#fff !important' }} />} />
                           ) : (
                             <Chip label={t.not_available} size="small" sx={{ height: 20, fontSize: 11, bgcolor: colors.danger, color: '#fff' }} icon={<ErrorIcon sx={{ fontSize: '12px !important', color: '#fff !important' }} />} />
                           )}
                         </Box>
                       );
                    })}
                  </Stack>
                </Box>
              )}

              <Typography sx={{ fontSize: 14, fontWeight: 700, mb: 2, color: colors.muted }}>{t.all_medicines}</Typography>
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
                          {item.quantity} {t.units}
                        </Typography>
                        <Typography sx={{ fontSize: 11, color: colors.muted }}>{t.available}</Typography>
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
               <Typography color="textSecondary">{t.no_inventory}</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setStockOpen(false)} sx={{ textTransform: 'none', fontWeight: 600 }}>{t.close}</Button>
          <Button variant="contained" onClick={() => { setStockOpen(false); handleOpenSend(viewingPharmacy); }} sx={{ textTransform: 'none', fontWeight: 600, bgcolor: colors.primary, color: '#fff' }}>{t.send_prescription}</Button>
        </DialogActions>
      </Dialog>

      {/* Send Dialog */}
      <Dialog open={sendOpen} onClose={() => setSendOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
        <DialogTitle sx={{ fontWeight: 600 }}>{t.send_dialog_title}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2, color: colors.muted }}>
            {t.send_dialog_desc} <strong>{selectedPharmacy?.pharmacyName || selectedPharmacy?.user?.full_name || t.this_pharmacy}</strong>.
          </Typography>
          {activePrescriptions.length > 0 ? (
            <>
              <FormControl fullWidth sx={{ mt: 1, mb: 3 }}>
                <InputLabel>{t.select_prescription}</InputLabel>
                <Select
                  value={selectedRx}
                  label={t.select_prescription}
                  onChange={(e) => setSelectedRx(e.target.value)}
                >
                  {activePrescriptions.map((rx) => (
                    <MenuItem key={rx._id} value={rx._id}>
                      {rx.title} ({new Date(rx.date || rx.createdAt).toLocaleDateString()})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Typography sx={{ fontSize: 14, fontWeight: 600, mb: 1.5 }}>{t.fulfillment_method}</Typography>
              <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
                <Box 
                  onClick={() => setDeliveryType('PICKUP')}
                  sx={{ 
                    flex: 1, p: 2, borderRadius: 2, border: `1px solid ${deliveryType === 'PICKUP' ? colors.primary : colors.line}`, 
                    bgcolor: deliveryType === 'PICKUP' ? colors.primarySoft : '#fff', cursor: 'pointer', textAlign: 'center' 
                  }}
                >
                  <Typography sx={{ fontSize: 24 }}>🏬</Typography>
                  <Typography sx={{ fontSize: 14, fontWeight: 600 }}>{t.store_pickup}</Typography>
                </Box>
                
                {selectedPharmacy?.deliveryAvailable && (
                  <Box 
                    onClick={() => setDeliveryType('HOME')}
                    sx={{ 
                      flex: 1, p: 2, borderRadius: 2, border: `1px solid ${deliveryType === 'HOME' ? colors.primary : colors.line}`, 
                      bgcolor: deliveryType === 'HOME' ? colors.primarySoft : '#fff', cursor: 'pointer', textAlign: 'center' 
                    }}
                  >
                    <Typography sx={{ fontSize: 24 }}>🚚</Typography>
                    <Typography sx={{ fontSize: 14, fontWeight: 600 }}>{t.home_delivery}</Typography>
                  </Box>
                )}
              </Stack>

              {deliveryType === 'HOME' ? (
                <TextField
                  fullWidth
                  label={t.delivery_address}
                  multiline
                  rows={3}
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder={t.delivery_address_placeholder}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          title={t.snack_location_use}
                          onClick={() => {
                            if (navigator.geolocation) {
                              navigator.geolocation.getCurrentPosition(async (pos) => {
                                const { latitude, longitude } = pos.coords;
                                const addrText = await reverseGeocode(latitude, longitude);
                                setDeliveryAddress(addrText);
                              });
                            }
                          }}
                        >
                          <LocationIcon sx={{ color: colors.primary }} />
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                  sx={{ mb: 2 }}
                />
              ) : (
                <Box sx={{ p: 2, bgcolor: colors.soft, borderRadius: 2, mb: 2 }}>
                  <Typography sx={{ fontSize: 13, color: colors.muted }}>
                    <strong>{t.pharmacy_address_label}</strong><br />
                    {selectedPharmacy?.address || t.address_not_listed}
                  </Typography>
                  <Typography sx={{ fontSize: 12, color: colors.muted, mt: 1 }}>
                    {t.bring_rx_id}
                  </Typography>
                </Box>
              )}
            </>
          ) : (
             <Alert severity="warning">{t.no_rx_warning}</Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setSendOpen(false)} sx={{ color: colors.muted }}>{t.cancel}</Button>
          <Button variant="contained" onClick={handleSendToPharmacy} disabled={sending || activePrescriptions.length === 0 || (deliveryType === 'HOME' && !deliveryAddress.trim())} sx={{ bgcolor: colors.primary, color: '#fff', px: 3, borderRadius: 1.5 }}>
            {sending ? t.sending : t.confirm_order}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar(p => ({ ...p, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={snackbar.severity} variant="filled" sx={{ borderRadius: 1.5 }}>{snackbar.message}</Alert>
      </Snackbar>
    </PatientShell>
  );
}
// Helper component to update map view
function MapUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

// Helper component to handle map clicks
function LocationPicker({ onLocationSelect }) {
  const map = useMapEvents({
    click: (e) => {
      onLocationSelect(e);
    }
  });
  return null;
}

