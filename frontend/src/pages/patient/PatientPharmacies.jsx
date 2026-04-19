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
  ListItemIcon,
  Radio
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
  PhoneRounded as CallIcon,
  AddCircleOutlineRounded as AddIcon,
  RemoveCircleOutlineRounded as RemoveIcon,
  CloudUploadRounded as UploadIcon,
  AddRounded as AddBtnIcon
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
import { 
  fetchPharmacies, 
  fetchMyRecords, 
  assignPrescriptionToPharmacy, 
  fetchPharmacyStock, 
  fetchPatientProfile, 
  checkPharmacyStock,
  extractPrescriptionMedicines,
  createAdvancedPrescriptionOrder
} from '../../api/patientApi';

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
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [isPaying, setIsPaying] = useState(false);
  
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
  const [viewMode, setViewMode] = useState('map'); // Default to map for 'wow' factor
  const [userLocation, setUserLocation] = useState([31.2240, 75.7712]); // Default: Phagwara, Punjab
  const [mapCenter, setMapCenter] = useState([31.2240, 75.7712]);
  const [orderStockInfo, setOrderStockInfo] = useState([]);
  const [isCheckingOrderStock, setIsCheckingOrderStock] = useState(false);
  const [orderItems, setOrderItems] = useState([]);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [newMedName, setNewMedName] = useState('');

  const loadData = async (coords = null) => {
    setLoading(true);
    try {
      let lat = coords ? coords[0] : userLocation[0];
      let lng = coords ? coords[1] : userLocation[1];

      // Get user's actual location if not provided and first time
      if (!coords && navigator.geolocation) {
        // We use a promise wrapper to ensure we get the location before fetching if possible, 
        // but we don't want to block the UI indefinitely if it fails.
        try {
          const pos = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 3000 });
          });
          lat = pos.coords.latitude;
          lng = pos.coords.longitude;
          setUserLocation([lat, lng]);
          setMapCenter([lat, lng]);
        } catch (e) {
          console.warn("Geolocation failed or denied, using defaults.");
        }
      }

      const [pharRes, recRes, profRes] = await Promise.all([
        fetchPharmacies({ lat, lng }),
        fetchMyRecords(),
        fetchPatientProfile()
      ]);

      if (pharRes.success) setPharmacies(pharRes.pharmacies || []);
      if (recRes.success) setRecords(recRes.records || []);
      if (profRes.success) {
        setPatientProfile(profRes.profile);
        setDeliveryAddress(profRes.profile?.address || '');
      }
    } catch (err) {
      console.error("Error loading pharmacies data:", err);
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
    
    // Filter logic
    const openMatch = filter === 'open' ? isPharmacyOpen(p) : true;
    const janMatch = filter === 'jan' ? p.isJanAushadhi : true;
    const h24Match = filter === '24h' ? (p.openTime === '00:00 AM' && p.closeTime === '11:59 PM') || p.is24h : true;
    const nearbyMatch = filter === 'nearby' ? (p.distanceKm <= 10) : true;
    
    return nameMatch && openMatch && janMatch && h24Match && nearbyMatch;
  }).sort((a, b) => {
    if (sort === 'nearest') {
      return (a.distanceKm || 999) - (b.distanceKm || 999);
    }
    if (sort === 'open') {
      const aOpen = isPharmacyOpen(a);
      const bOpen = isPharmacyOpen(b);
      if (aOpen === bOpen) return (a.distanceKm || 999) - (b.distanceKm || 999);
      return aOpen ? -1 : 1;
    }
    return 0;
  });

  const handleOpenSend = (pharmacy) => {
    setSelectedPharmacy(pharmacy);
    setOrderItems([]);
    setUploadedFile(null);
    setSelectedRx('');
    
    if (activePrescriptions.length > 0) {
      const rx = activePrescriptions[0];
      setSelectedRx(rx._id);
      const meds = rx.prescription?.medications || [];
      setOrderItems(meds.map(m => ({ name: m.name, quantity: 1, dosage: m.dosage })));
    }
    setDeliveryType('PICKUP');
    setPaymentMethod('OFFLINE');
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

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    setUploadedFile(file);
    setIsExtracting(true);
    try {
      const res = await extractPrescriptionMedicines(file);
      if (res.success) {
        setSnackbar({ open: true, message: t.extract_success, severity: 'success' });
        const extractedMeds = res.medicines.map(m => ({
          name: m.name,
          quantity: m.quantity || 10,
          dosage: m.dosage || ''
        }));
        setOrderItems(prev => [...prev, ...extractedMeds]);
      } else {
        setSnackbar({ open: true, message: t.extract_error, severity: 'error' });
      }
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: t.extract_error, severity: 'error' });
    } finally {
      setIsExtracting(false);
    }
  };

  const handleAddManualItem = () => {
    if (!newMedName.trim()) return;
    const newItem = { name: newMedName.trim(), quantity: 1, dosage: '' };
    setOrderItems(prev => [...prev, newItem]);
    setNewMedName('');
  };

  const handleSendToPharmacy = async (finalPaymentStatus = 'Pending', isPaymentFlow = false) => {
    // We'll use either assignPrescriptionToPharmacy or createAdvancedPrescriptionOrder
    // Since we now allow manual items, createAdvancedPrescriptionOrder is more robust
    try {
      if (!isPaymentFlow) setSending(true);
      
      const totalAmount = calculateOrderTotal();
      const orderData = {
        prescriptionId: records.find(r => r._id === selectedRx)?.prescription?._id || (isValidObjectId(selectedRx) ? selectedRx : null),
        pharmacyId: selectedPharmacy._id,
        items: orderItems.map(item => ({
          ...item,
          price: orderStockInfo.find(s => s.name.toLowerCase() === item.name.toLowerCase())?.price || 150
        })),
        deliveryType,
        deliveryAddress: deliveryType === 'HOME' ? deliveryAddress : null,
        paymentMethod,
        paymentStatus: finalPaymentStatus,
        totalAmount,
        deliveryFee: deliveryType === 'HOME' ? 40 : 0
      };

      const res = await createAdvancedPrescriptionOrder(orderData);
      
      if (res.success) {
        if (!isPaymentFlow) {
          setSnackbar({ open: true, message: t.snack_sent, severity: 'success' });
          setSendOpen(false);
        }
        return res;
      } else {
        if (!isPaymentFlow) setSnackbar({ open: true, message: res.message || t.snack_error, severity: 'error' });
        return null;
      }
    } catch (err) {
      console.error(err);
      if (!isPaymentFlow) setSnackbar({ open: true, message: t.snack_error, severity: 'error' });
      return null;
    } finally {
      if (!isPaymentFlow) setSending(false);
    }
  };

  const removeOrderItem = (name) => {
    setOrderItems(prev => prev.filter(item => item.name !== name));
  };

  const isValidObjectId = (id) => {
    if (!id) return false;
    return id.match(/^[0-9a-fA-F]{24}$/);
  };

  const startRazorpayPayment = async () => {
    const totalAmount = calculateOrderTotal();
    setIsPaying(true);
    try {
      // 1. Create order first in Pending state
      const orderResData = await handleSendToPharmacy('Pending', true);
      if (!orderResData || !orderResData.orderId) {
        throw new Error("Could not initialize order");
      }

      const { createRazorpayOrder, verifyRazorpayPayment } = await import('../../api/patientApi');
      
      // 2. Create Razorpay Order
      const orderRes = await createRazorpayOrder({ 
        amount: totalAmount,
        referenceId: orderResData.orderId,
        referenceType: 'medicine_order'
      });

      if (!orderRes.success) throw new Error("Payment initialization failed");

      const options = {
        key: orderRes.keyId || import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_placeholder",
        amount: orderRes.amount,
        currency: orderRes.currency,
        name: "Seva Telehealth",
        description: "Payment for Medicines",
        order_id: orderRes.orderId,
        handler: async (response) => {
          setIsPaying(true);
          try {
            const verifyRes = await verifyRazorpayPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });

            if (verifyRes.success) {
              setSnackbar({ open: true, message: 'Payment successful! Order placed.', severity: 'success' });
              setSendOpen(false);
              loadData(); // Refresh to show active orders if needed (though dashboard usually shows them)
            } else {
              setSnackbar({ open: true, message: 'Payment verification failed', severity: 'error' });
            }
          } catch (err) {
            setSnackbar({ open: true, message: 'Verification error: ' + err.message, severity: 'error' });
          } finally {
            setIsPaying(false);
          }
        },
        prefill: {
          name: patientProfile?.full_name || '',
          email: patientProfile?.email || ''
        },
        theme: { color: colors.primary }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: 'Payment error: ' + err.message, severity: 'error' });
    } finally {
      setIsPaying(false);
    }
  };

  useEffect(() => {
    if (sendOpen && selectedRx) {
      const rx = records.find(r => r._id === selectedRx);
      const meds = rx?.prescription?.medications || [];
      
      setOrderItems(prev => {
        // Merge: Add items from RX that aren't already in the list
        const existingNames = new Set(prev.map(i => i.name.toLowerCase()));
        const newMedsFromRx = meds
          .filter(m => !existingNames.has(m.name.toLowerCase()))
          .map(m => ({ name: m.name, quantity: 1, dosage: m.dosage }));
        
        return [...prev, ...newMedsFromRx];
      });
    }
  }, [selectedRx, sendOpen]);

  useEffect(() => {
    if (sendOpen && selectedPharmacy && orderItems.length > 0) {
      handleCheckOrderStock();
    }
  }, [selectedPharmacy, sendOpen, JSON.stringify(orderItems)]);

  const handleCheckOrderStock = async () => {
    if (orderItems.length === 0) return;

    setIsCheckingOrderStock(true);
    try {
      const res = await checkPharmacyStock({
        pharmacyId: selectedPharmacy._id,
        items: orderItems.map(m => ({ name: m.name, quantity: m.quantity }))
      });
      if (res.success) {
        setOrderStockInfo(res.results);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsCheckingOrderStock(false);
    }
  };

  const calculateOrderTotal = () => {
    const base = orderStockInfo.reduce((sum, item) => {
       const oItem = orderItems.find(oi => oi.name.toLowerCase() === item.name.toLowerCase());
       return sum + ((item.price || 150) * (oItem?.quantity || 1));
    }, 0);
    const delivery = deliveryType === 'HOME' ? 40 : 0;
    return base + delivery;
  };

  const updateOrderItemQuantity = (name, delta) => {
    setOrderItems(prev => prev.map(item => 
      item.name === name ? { ...item, quantity: Math.max(1, (item.quantity || 1) + delta) } : item
    ));
  };

  const handleMapClick = (e) => {
    const { lat, lng } = e.latlng;
    setUserLocation([lat, lng]);
    loadData([lat, lng]); // Re-fetch pharmacies for this new location
    setSnackbar({ open: true, message: t.snack_location, severity: 'success' });
  };

  // Summary logic
  const matchSummary = activePrescriptions.length > 0 ? 'Evaluating...' : 'No prescription';

  return (
    <PatientShell activeItem="pharmacies">
      <Box sx={{ px: { xs: 2, md: 4, xl: 6 }, py: { xs: 3, md: 4 }, bgcolor: colors.bg, minHeight: '100vh' }}>
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
                ['nearby', t.filter_nearby],
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

            <Box sx={{ mb: 3 }}>
              <Typography sx={{ fontSize: 13, fontWeight: 700, color: colors.primary, mb: 1, textTransform: 'uppercase', letterSpacing: 1 }}>
                {t.emergency_helpline || "Emergency Support"}
              </Typography>
              <Button 
                fullWidth 
                variant="outlined" 
                color="error" 
                startIcon={<CallIcon />}
                sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700, borderStyle: 'dashed' }}
              >
                108 - Medical Emergency
              </Button>
            </Box>

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
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, height: { xs: 800, lg: 650 }, borderRadius: 3, overflow: 'hidden', border: `1px solid ${colors.line}`, bgcolor: '#fff', boxShadow: '0 12px 40px rgba(0,0,0,0.08)' }}>
                {/* Nearby Sidebar for Map */}
                <Box sx={{ width: { xs: '100%', lg: 320 }, borderRight: `1px solid ${colors.line}`, display: 'flex', flexDirection: 'column', bgcolor: '#fff' }}>
                  <Box sx={{ p: 2, borderBottom: `1px solid ${colors.line}`, bgcolor: colors.bg }}>
                    <Typography sx={{ fontWeight: 800, fontSize: 14, color: colors.text, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LocationIcon color="primary" sx={{ fontSize: 18 }} /> {t.nearby_pharmacies || "NEARBY PHARMACIES"}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {filteredPharmacies.length} {t.found_in_area || "pharmacies found in your area"}
                    </Typography>
                  </Box>
                  <Box sx={{ flex: 1, overflowY: 'auto', p: 1.5 }}>
                    <Stack spacing={1.5}>
                      {filteredPharmacies.map(p => (
                        <Box 
                          key={p._id} 
                          onClick={() => setMapCenter([p.location?.lat || 26.8467, p.location?.lng || 80.9462])}
                          sx={{ 
                            p: 2, borderRadius: 2, cursor: 'pointer', border: `1px solid ${selectedPharmacy?._id === p._id ? colors.primary : 'transparent'}`,
                            bgcolor: selectedPharmacy?._id === p._id ? colors.primarySoft : '#fcfcfc',
                            transition: 'all 0.2s',
                            '&:hover': { bgcolor: colors.soft }
                          }}
                        >
                          <Typography sx={{ fontWeight: 700, fontSize: 14 }}>{p.pharmacyName}</Typography>
                          <Typography variant="caption" sx={{ color: colors.muted, display: 'block', mb: 1 }}>{p.address}</Typography>
                          <Stack direction="row" spacing={1}>
                            <Button 
                              size="small" 
                              variant="contained" 
                              onClick={(e) => { e.stopPropagation(); handleOpenSend(p); }}
                              sx={{ fontSize: 10, px: 2, py: 0.5, borderRadius: 1.5, bgcolor: colors.primary, textTransform: 'none' }}
                            >
                              {t.order_now || "Order Now"}
                            </Button>
                            <Button 
                              size="small" 
                              variant="outlined" 
                              onClick={(e) => { e.stopPropagation(); handleViewStock(p); }}
                              sx={{ fontSize: 10, px: 1, py: 0.5, borderRadius: 1.5, textTransform: 'none' }}
                            >
                              {t.view_stock}
                            </Button>
                          </Stack>
                        </Box>
                      ))}
                    </Stack>
                  </Box>
                </Box>

                {/* Map Interface */}
                <Box sx={{ flex: 1, position: 'relative' }}>
                  <MapContainer center={mapCenter} zoom={13} style={{ height: '100%', width: '100%', zIndex: 1 }}>
                    <TileLayer 
                      url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" 
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>' 
                    />
                    
                    <LocationPicker onLocationSelect={handleMapClick} />

                    {/* User Location Marker */}
                    <Marker position={userLocation} icon={L.divIcon({
                      html: `<div style="background-color: #4285F4; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 15px rgba(66, 133, 244, 0.5); position: relative;">
                               <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border-radius: 50%; background-color: #4285F4; opacity: 0.3; animation: pulse 2s infinite;"></div>
                             </div>`,
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
                        position={[p.location?.lat || 26.8467, p.location?.lng || 80.9462]} 
                        icon={createPharmacyIcon(p.isJanAushadhi ? colors.warning : colors.primary)}
                        eventHandlers={{
                          click: () => setSelectedPharmacy(p)
                        }}
                      >
                        <Popup className="premium-map-popup">
                          <Box sx={{ p: 1, minWidth: 220 }}>
                            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                              <Box sx={{ width: 32, height: 32, borderRadius: 1, bgcolor: colors.primarySoft, display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.primary }}>
                                <PharmacyIcon sx={{ fontSize: 18 }} />
                              </Box>
                              <Typography sx={{ fontWeight: 800, fontSize: 15 }}>{p.pharmacyName}</Typography>
                            </Stack>
                            
                            {p.deliveryAvailable && (
                              <Chip 
                                label={t.delivery_available} 
                                size="small" 
                                color="success" 
                                sx={{ height: 20, fontSize: 10, fontWeight: 700, mb: 1.5, px: 0.5 }} 
                              />
                            )}
                            
                            <Typography sx={{ fontSize: 12, color: colors.muted, mb: 2, lineHeight: 1.4 }}>{p.address}</Typography>
                            
                            <Divider sx={{ mb: 2 }} />
                            
                            <Stack direction="row" spacing={1}>
                              <Button 
                                fullWidth
                                variant="contained" 
                                onClick={() => handleOpenSend(p)} 
                                sx={{ borderRadius: 1.5, py: 0.75, fontSize: 11, fontWeight: 700, bgcolor: colors.primary, color: '#fff', textTransform: 'none' }}
                              >
                                {t.stock_send_rx}
                              </Button>
                            </Stack>
                          </Box>
                        </Popup>
                      </Marker>
                    ))}
                    
                    <MapUpdater center={mapCenter} />
                  </MapContainer>
                  
                  {/* Floating Map Controls */}
                  <Box sx={{ position: 'absolute', top: 20, right: 20, zIndex: 1000, display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <IconButton 
                      onClick={() => setMapCenter(userLocation)}
                      sx={{ bgcolor: '#fff', color: colors.primary, boxShadow: '0 4px 12px rgba(0,0,0,0.15)', '&:hover': { bgcolor: colors.soft } }}
                    >
                      <LocationIcon />
                    </IconButton>
                  </Box>
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
              <Stack direction="row" spacing={1} alignItems="flex-start" sx={{ mt: 1, mb: 3 }}>
                <FormControl fullWidth>
                  <InputLabel>{t.select_prescription}</InputLabel>
                  <Select
                    value={selectedRx}
                    label={t.select_prescription}
                    onChange={(e) => setSelectedRx(e.target.value)}
                    size="small"
                  >
                    <MenuItem value=""><em>None</em></MenuItem>
                    {activePrescriptions.map((rx) => (
                      <MenuItem key={rx._id} value={rx._id}>
                        {rx.title} ({new Date(rx.date || rx.createdAt).toLocaleDateString()})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                <Box>
                  <input
                    type="file"
                    id="prescription-upload"
                    style={{ display: 'none' }}
                    onChange={handleFileUpload}
                    accept="image/*,.pdf"
                  />
                  <IconButton 
                    component="span" 
                    onClick={() => document.getElementById('prescription-upload').click()}
                    sx={{ bgcolor: colors.primarySoft, color: colors.primary, borderRadius: 1.5, '&:hover': { bgcolor: colors.primary } }}
                    title={t.upload_prescription}
                    disabled={isExtracting}
                  >
                    {isExtracting ? <CircularProgress size={24} /> : <UploadIcon />}
                  </IconButton>
                </Box>
              </Stack>

              <Typography sx={{ fontSize: 14, fontWeight: 600, mb: 1.5 }}>{t.fulfillment_method}</Typography>
              <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
                <Box 
                  onClick={() => { setDeliveryType('PICKUP'); setPaymentMethod('OFFLINE'); }}
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
                    onClick={() => { setDeliveryType('HOME'); setPaymentMethod('COD'); }}
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

              <Typography sx={{ fontSize: 14, fontWeight: 600, mb: 1.5 }}>Payment Method</Typography>
              <Stack spacing={1} sx={{ mb: 3 }}>
                {deliveryType === 'HOME' && (
                  <Box 
                    onClick={() => setPaymentMethod('COD')}
                    sx={{ p: 1.5, borderRadius: 2, border: `1px solid ${paymentMethod === 'COD' ? colors.primary : colors.line}`, bgcolor: paymentMethod === 'COD' ? colors.primarySoft : '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 2 }}
                  >
                    <Radio checked={paymentMethod === 'COD'} size="small" />
                    <Box>
                      <Typography sx={{ fontSize: 14, fontWeight: 600 }}>Cash on Delivery</Typography>
                      <Typography sx={{ fontSize: 11, color: colors.muted }}>Pay when item arrives</Typography>
                    </Box>
                  </Box>
                )}
                <Box 
                  onClick={() => setPaymentMethod('UPI')}
                  sx={{ p: 1.5, borderRadius: 2, border: `1px solid ${paymentMethod === 'UPI' ? colors.primary : colors.line}`, bgcolor: paymentMethod === 'UPI' ? colors.primarySoft : '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 2 }}
                >
                  <Radio checked={paymentMethod === 'UPI'} size="small" />
                  <Box>
                    <Typography sx={{ fontSize: 14, fontWeight: 600 }}>Pay Online (UPI)</Typography>
                    <Typography sx={{ fontSize: 11, color: colors.muted }}>Instant secure payment</Typography>
                  </Box>
                </Box>
                {deliveryType === 'PICKUP' && (
                  <Box 
                    onClick={() => setPaymentMethod('OFFLINE')}
                    sx={{ p: 1.5, borderRadius: 2, border: `1px solid ${paymentMethod === 'OFFLINE' ? colors.primary : colors.line}`, bgcolor: paymentMethod === 'OFFLINE' ? colors.primarySoft : '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 2 }}
                  >
                    <Radio checked={paymentMethod === 'OFFLINE'} size="small" />
                    <Box>
                      <Typography sx={{ fontSize: 14, fontWeight: 600 }}>Pay at Pharmacy</Typography>
                      <Typography sx={{ fontSize: 11, color: colors.muted }}>Pay when picking up</Typography>
                    </Box>
                  </Box>
                )}
              </Stack>

              {/* Order Summary Section */}
              <Box sx={{ 
                p: 2.5, mb: 3, borderRadius: 3, 
                border: `1px solid ${colors.line}`, 
                bgcolor: '#fff',
                boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
              }}>
                <Typography sx={{ fontSize: 12, fontWeight: 800, mb: 2, color: colors.muted, letterSpacing: 1 }}>ORDER SUMMARY</Typography>
                <Stack spacing={1.5}>
                  {isCheckingOrderStock ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'center', py: 2 }}>
                      <CircularProgress size={20} thickness={5} />
                      <Typography variant="caption" sx={{ color: colors.muted }}>Syncing with pharmacy...</Typography>
                    </Box>
                  ) : (
                    orderStockInfo.map((item, idx) => {
                      const isOutOfStock = item.available === 0;
                      const oItem = orderItems.find(oi => oi.name.toLowerCase() === item.name.toLowerCase());
                      const currentQty = oItem?.quantity || 1;

                      return (
                        <Box key={idx} sx={{ borderBottom: idx < orderStockInfo.length - 1 || true ? `1px dashed ${colors.line}` : 'none', pb: 1.5 }}>
                          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                             <Box sx={{ flex: 1 }}>
                               <Stack direction="row" alignItems="center" spacing={1}>
                                 <Typography sx={{ fontSize: 14, fontWeight: 700, color: isOutOfStock ? colors.danger : colors.text }}>{item.name}</Typography>
                                 <IconButton size="small" onClick={() => removeOrderItem(item.name)} sx={{ p: 0, color: colors.danger }}>
                                   <ErrorIcon sx={{ fontSize: 14 }} />
                                 </IconButton>
                               </Stack>
                               
                               <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 1 }}>
                                 <IconButton 
                                   size="small" 
                                   onClick={() => updateOrderItemQuantity(item.name, -1)}
                                   sx={{ border: `1px solid ${colors.line}`, p: 0.3 }}
                                 >
                                   <RemoveIcon sx={{ fontSize: 14 }} />
                                 </IconButton>
                                 <Typography sx={{ fontSize: 13, fontWeight: 700, minWidth: 16, textAlign: 'center' }}>{currentQty}</Typography>
                                 <IconButton 
                                   size="small" 
                                   onClick={() => updateOrderItemQuantity(item.name, 1)}
                                   sx={{ border: `1px solid ${colors.line}`, p: 0.3 }}
                                 >
                                    <AddIcon sx={{ fontSize: 14 }} />
                                 </IconButton>
                               </Stack>
                               
                               <Typography sx={{ mt: 0.5, fontSize: 11, color: item.inStock ? colors.success : item.available > 0 ? colors.warning : colors.danger, fontWeight: 700 }}>
                                 {item.inStock ? 'In Stock' : (item.available > 0 ? `Stock: ${item.available}` : 'Out of Stock')}
                               </Typography>
                             </Box>
                             <Box sx={{ textAlign: 'right' }}>
                               <Typography sx={{ fontSize: 14, fontWeight: 800, color: colors.primary }}>₹{(item.price || 150) * currentQty}</Typography>
                               <Typography sx={{ fontSize: 10, color: colors.muted }}>₹{item.price || 150}/unit</Typography>
                             </Box>
                          </Stack>
                        </Box>
                      );
                    })
                  )}
                  
                  {/* Manual Add Medicine Input */}
                  <Box sx={{ pt: 1 }}>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder={t.med_name_placeholder}
                      value={newMedName}
                      onChange={(e) => setNewMedName(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddManualItem()}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <Button 
                              size="small" 
                              onClick={handleAddManualItem}
                              sx={{ minWidth: 0, p: 0.5, borderRadius: 1 }}
                            >
                              <AddBtnIcon />
                            </Button>
                          </InputAdornment>
                        )
                      }}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                    <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5, display: 'block' }}>
                      {t.add_medicine}
                    </Typography>
                  </Box>
                </Stack>
                <Divider sx={{ my: 2, borderStyle: 'dashed' }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography sx={{ fontSize: 13, color: colors.muted }}>Items Subtotal</Typography>
                  <Typography sx={{ fontSize: 13, fontWeight: 600 }}>₹{calculateOrderTotal() - (deliveryType === 'HOME' ? 40 : 0)}</Typography>
                </Box>
                {deliveryType === 'HOME' && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography sx={{ fontSize: 13, color: colors.muted }}>Delivery Charge</Typography>
                    <Typography sx={{ fontSize: 13, fontWeight: 600 }}>₹40</Typography>
                  </Box>
                )}
                <Box sx={{ 
                  p: 2, borderRadius: 2, 
                  bgcolor: colors.primarySoft, 
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  border: `1px solid ${colors.primary}20`
                }}>
                  <Typography sx={{ fontSize: 14, fontWeight: 700, color: colors.primary }}>Total Outstanding</Typography>
                  <Typography sx={{ fontSize: 18, fontWeight: 900, color: colors.primary }}>₹{calculateOrderTotal()}</Typography>
                </Box>
              </Box>

              {/* Out of Stock Restriction */}
              {orderStockInfo.some(i => i.available === 0) && (
                <Alert severity="error" sx={{ mb: 2, borderRadius: 2, '& .MuiAlert-message': { fontSize: 13 } }}>
                  <strong>Cannot Place Order.</strong> Some items are out of stock at this pharmacy. Please try another nearby pharmacy on the map.
                </Alert>
              )}

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
             <Box sx={{ mt: 2 }}>
               <Alert severity="info" sx={{ mb: 2 }}>{t.no_rx_warning} {t.or} {t.upload_prescription}</Alert>
               <Button 
                 variant="outlined" 
                 fullWidth 
                 startIcon={<UploadIcon />}
                 onClick={() => document.getElementById('prescription-upload').click()}
                 sx={{ mb: 2, borderRadius: 2, textTransform: 'none' }}
               >
                 {t.upload_prescription}
               </Button>
               
               {/* Manual Add Medicine Input in empty state */}
               <Box sx={{ p: 2, bgcolor: colors.soft, borderRadius: 2 }}>
                 <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 700 }}>{t.manual_entry}</Typography>
                 <TextField
                   fullWidth
                   size="small"
                   placeholder={t.med_name_placeholder}
                   value={newMedName}
                   onChange={(e) => setNewMedName(e.target.value)}
                   onKeyPress={(e) => e.key === 'Enter' && handleAddManualItem()}
                   InputProps={{
                     endAdornment: (
                       <InputAdornment position="end">
                         <Button size="small" onClick={handleAddManualItem} sx={{ minWidth: 0, p: 0.5 }}>
                           <AddBtnIcon />
                         </Button>
                       </InputAdornment>
                     )
                   }}
                   sx={{ bgcolor: '#fff', '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
                 />
                 <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                   Add names of medicines you want to order without a digital prescription.
                 </Typography>
               </Box>
             </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, bgcolor: '#fcfcfc', borderTop: `1px solid ${colors.line}` }}>
          <Button onClick={() => setSendOpen(false)} sx={{ color: colors.muted, textTransform: 'none', fontWeight: 600 }}>{t.cancel}</Button>
          <Button 
            variant="contained" 
            onClick={() => {
              if (paymentMethod === 'UPI') {
                startRazorpayPayment();
              } else {
                handleSendToPharmacy();
              }
            }} 
            disabled={
              sending || 
              isPaying || 
              activePrescriptions.length === 0 || 
              (deliveryType === 'HOME' && !deliveryAddress.trim()) || 
              isCheckingOrderStock ||
              orderStockInfo.some(i => i.available === 0)
            } 
            sx={{ 
              bgcolor: orderStockInfo.some(i => i.available === 0) ? colors.gray : colors.primary, 
              color: '#fff', px: 4, py: 1.25, borderRadius: 2, 
              textTransform: 'none', fontWeight: 700, fontSize: 15,
              boxShadow: '0 4px 12px rgba(26,115,232,0.2)',
              '&:hover': { bgcolor: colors.primaryDark, boxShadow: '0 6px 16px rgba(26,115,232,0.3)' }
            }}
          >
            {isPaying ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : 
             sending ? t.sending : 
             paymentMethod === 'UPI' ? 'Pay Securely' : 
             orderStockInfo.some(i => i.available === 0) ? 'Out of Stock' : 'Place Order'}
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

