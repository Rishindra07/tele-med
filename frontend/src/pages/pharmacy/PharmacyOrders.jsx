import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Stack,
  Card,
  Chip,
  Button,
  Grid,
  CircularProgress,
  Avatar,
  Divider,
  MenuItem,
  TextField,
  IconButton,
  Snackbar,
  Alert
} from '@mui/material';
import {
  LocalShippingRounded as ShippingIcon,
  ShoppingBagRounded as OrderIcon,
  CheckCircleRounded as CheckIcon,
  PersonOutlineRounded as PatientIcon,
  EditRounded as EditIcon,
  MoreVertRounded as MoreIcon,
  DescriptionOutlined as PrescriptionIcon,
  RefreshRounded as RefreshIcon
} from '@mui/icons-material';
import PharmacyLayout from '../../components/PharmacyLayout';
import { fetchIncomingOrders, updateOrderStatus } from '../../api/pharmacyApi';
import { useLanguage } from '../../context/LanguageContext';
import { PHARMACY_ORDERS_TRANSLATIONS } from '../../utils/translations/pharmacy';

const colors = {
  bg: '#f8f9fa',
  paper: '#ffffff',
  line: '#e1e3e1',
  soft: '#f1f3f4',
  text: '#202124',
  muted: '#5f6368',
  primary: '#1a73e8',
  primarySoft: '#e8f0fe',
  primaryDark: '#174ea6',
  success: '#1e8e3e',
  successSoft: '#e6f4ea',
  warning: '#f9ab00',
  red: '#d93025',
  redSoft: '#fce8e6'
};

const statuses = ["Order Placed", "Pharmacy Accepted", "Packed", "Out for Delivery", "Delivered", "Cancelled", "Rejected", "Ready for Pickup"];

export default function PharmacyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  const { language } = useLanguage();
  const t = PHARMACY_ORDERS_TRANSLATIONS[language] || PHARMACY_ORDERS_TRANSLATIONS['en'];

  const loadOrders = async () => {
    try {
      setLoading(true);
      const res = await fetchIncomingOrders();
      if (res.success) {
        setOrders(res.orders || []);
      }
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: 'Failed to load orders', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      setUpdating(orderId);
      const res = await updateOrderStatus({ orderId, status: newStatus });
      if (res.success) {
        setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
        setSnackbar({ open: true, message: `Order status updated to ${newStatus}`, severity: 'success' });
      }
    } catch (err) {
        setSnackbar({ open: true, message: 'Failed to update status', severity: 'error' });
    } finally {
      setUpdating(null);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const filteredOrders = orders.filter(order => {
    const matchesStatus = statusFilter === 'All' || order.status === statusFilter;
    const matchesSearch = 
      (order.patient?.full_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      order._id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered': return colors.success;
      case 'Accepted':
      case 'Pharmacy Accepted': return colors.primary;
      case 'Ready':
      case 'Ready for Pickup': return colors.primaryDark;
      case 'Order Placed':
      case 'Pending': return colors.warning;
      case 'Rejected':
      case 'Cancelled': return colors.red;
      default: return colors.muted;
    }
  };

  const getStatusSoft = (status) => {
    switch (status) {
      case 'Delivered': return colors.successSoft;
      case 'Accepted':
      case 'Pharmacy Accepted': return colors.primarySoft;
      case 'Ready':
      case 'Ready for Pickup': return colors.primarySoft;
      case 'Order Placed':
      case 'Pending': return '#fff7e6';
      case 'Rejected':
      case 'Cancelled': return colors.redSoft;
      default: return '#f5f5f5';
    }
  };

  return (
    <PharmacyLayout>
      <Box sx={{ p: { xs: 2.5, md: 4 }, minHeight: '100vh' }}>
        
        {/* Header */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
          <Box>
            <Typography sx={{ fontSize: { xs: 32, md: 36 }, fontWeight: 700, color: colors.text, fontFamily: 'Inter, sans-serif', letterSpacing: '-0.5px' }}>
              {t.title}
            </Typography>
            <Typography sx={{ mt: 1, color: colors.muted, fontSize: 16 }}>
              {t.subtitle}
            </Typography>
          </Box>
          <Button 
            startIcon={<RefreshIcon />} 
            onClick={loadOrders}
            sx={{ color: colors.primary, fontWeight: 700, textTransform: 'none', px: 3, py: 1.25, borderRadius: 2.5, bgcolor: '#fff', border: `1px solid ${colors.line}`, '&:hover': { bgcolor: colors.primarySoft } }}
          >
            {t.refresh}
          </Button>
        </Stack>

        {/* Filter Bar */}
        <Box sx={{ mb: 4, p: 2, bgcolor: '#fff', borderRadius: 3, border: `1px solid ${colors.line}`, display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
            <TextField
                select
                size="small"
                label={t.status_filter}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                sx={{ minWidth: 150, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            >
                <MenuItem value="All">{t.all_statuses}</MenuItem>
                {statuses.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
            </TextField>
            <TextField
                size="small"
                placeholder={t.search_placeholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{ minWidth: 250, flex: 1, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
            <Typography sx={{ color: colors.muted, fontSize: 13, ml: 'auto' }}>
                {t.found} {filteredOrders.length} {t.orders_lc}
            </Typography>
        </Box>

        {loading ? (
             <Box sx={{ py: 10, textAlign: 'center' }}>
                <CircularProgress sx={{ color: colors.primary }} />
                <Typography sx={{ mt: 2, color: colors.muted, fontWeight: 600 }}>{t.fetching}</Typography>
             </Box>
        ) : filteredOrders.length === 0 ? (
            <Card sx={{ p: 6, textAlign: 'center', borderRadius: 4, border: `1px dashed ${colors.line}`, bgcolor: 'transparent', boxShadow: 'none' }}>
                <OrderIcon sx={{ fontSize: 48, color: colors.line, mb: 2 }} />
                <Typography sx={{ fontSize: 18, fontWeight: 600, color: colors.muted }}>{t.no_orders}</Typography>
                <Typography sx={{ fontSize: 14, color: colors.muted }}>{t.adjust_filters}</Typography>
            </Card>
        ) : (
            <Stack spacing={3}>
                {filteredOrders.map((order) => (
                    <Card key={order._id} sx={{ p: 0, borderRadius: 3, border: `1px solid ${colors.line}`, boxShadow: '0 2px 8px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
                        <Box sx={{ p: 3, bgcolor: '#fff', borderBottom: `1px solid ${colors.line}` }}>
                            <Grid container spacing={3} alignItems="center">
                                <Grid size={{ xs: 12, md: 4 }}>
                                    <Stack direction="row" spacing={2} alignItems="center">
                                        <Avatar sx={{ bgcolor: colors.primarySoft, color: colors.primaryDark, fontWeight: 700 }}>
                                            <PatientIcon />
                                        </Avatar>
                                        <Box>
                                            <Typography sx={{ fontSize: 16, fontWeight: 700, color: colors.text }}>{order.patient?.full_name || t.patient}</Typography>
                                            <Typography sx={{ fontSize: 13, color: colors.muted }}>{order.patient?.phone || order.patient?.email}</Typography>
                                        </Box>
                                    </Stack>
                                </Grid>
                                <Grid size={{ xs: 12, md: 4 }}>
                                    <Stack spacing={0.5}>
                                        <Typography sx={{ fontSize: 13, fontWeight: 600, color: colors.muted, display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <OrderIcon fontSize="small" /> ID: #{order._id.slice(-8).toUpperCase()}
                                        </Typography>
                                        <Typography sx={{ fontSize: 13, fontWeight: 600, color: colors.muted, display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <ShippingIcon fontSize="small" /> {order.deliveryType} • {order.deliveryAddress || t.pickup}
                                        </Typography>
                                    </Stack>
                                </Grid>
                                <Grid size={{ xs: 12, md: 4 }} sx={{ textAlign: { md: 'right' } }}>
                                    <Chip 
                                        label={order.status.toUpperCase()} 
                                        sx={{ 
                                            bgcolor: getStatusSoft(order.status), 
                                            color: getStatusColor(order.status),
                                            fontWeight: 700,
                                            fontSize: 12,
                                            borderRadius: 1.5,
                                            px: 1
                                        }} 
                                    />
                                    <Typography sx={{ mt: 1, fontSize: 12, color: colors.muted }}>
                                        {t.received} {new Date(order.createdAt).toLocaleString()}
                                    </Typography>
                                </Grid>
                            </Grid>
                        </Box>

                        <Box sx={{ p: 3, bgcolor: '#fcfcfc' }}>
                            <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ md: 'center' }} spacing={2}>
                                <Stack direction="row" spacing={4}>
                                    <Box>
                                        <Typography sx={{ fontSize: 12, color: colors.muted, textTransform: 'uppercase', letterSpacing: 1.2, fontWeight: 700, mb: 1 }}>{t.prescription_details}</Typography>
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <PrescriptionIcon sx={{ color: colors.primary, fontSize: 18 }} />
                                            <Typography sx={{ fontSize: 14, fontWeight: 600 }}>
                                               {order.prescription?.medications?.length || 0} {t.items_prescribed}
                                            </Typography>
                                        </Stack>
                                    </Box>
                                    {order.deliveryType === 'HOME' && (
                                         <Box>
                                            <Typography sx={{ fontSize: 12, color: colors.muted, textTransform: 'uppercase', letterSpacing: 1, mb: 1 }}>{t.delivery_details}</Typography>
                                            <Typography sx={{ fontSize: 14 }}>{order.deliveryAddress}</Typography>
                                         </Box>
                                    )}
                                </Stack>

                                <Box sx={{ minWidth: 200 }}>
                                    <Typography sx={{ fontSize: 12, color: colors.muted, mb: 1 }}>{t.update_status}</Typography>
                                    <Stack direction="row" spacing={1}>
                                        <TextField
                                            select
                                            size="small"
                                            value={order.status}
                                            onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                                            fullWidth
                                            disabled={updating === order._id || order.status === 'Delivered' || order.status === 'Cancelled'}
                                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: '#fff', fontSize: 14, fontWeight: 500 } }}
                                        >
                                            {statuses.map((status) => (
                                                <MenuItem key={status} value={status}>{status}</MenuItem>
                                            ))}
                                        </TextField>
                                        {updating === order._id && <CircularProgress size={24} sx={{ ml: 1, mt: 1 }} />}
                                    </Stack>
                                </Box>
                            </Stack>
                        </Box>

                        <Divider />
                        <Box sx={{ p: 2, px: 3, bgcolor: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                             <Button 
                                size="small" 
                                startIcon={<PrescriptionIcon />}
                                onClick={() => {
                                  const pid = order.prescription?.prescriptionId || order.prescription?._id || order.prescription;
                                  window.open(`/view-prescription/${pid}`, '_blank');
                                }}
                                sx={{ color: colors.primary, fontWeight: 700, textTransform: 'none', px: 2, borderRadius: 2, '&:hover': { bgcolor: colors.primarySoft } }}
                             >
                                 {t.view_prescription || 'View Prescription'}
                             </Button>
                             <Button 
                                size="small" 
                                variant="contained"
                                sx={{ bgcolor: colors.primary, color: '#fff', fontWeight: 700, textTransform: 'none', px: 3, py: 1, borderRadius: 2, '&:hover': { bgcolor: colors.primaryDark }, boxShadow: `0 4px 12px ${colors.primary}30` }}
                                startIcon={<CheckIcon />}
                                disabled={order.status === 'Delivered' || order.status === 'Cancelled' || order.status === 'Rejected'}
                                onClick={() => {
                                  let nextStatus = 'Pharmacy Accepted';
                                  if (order.status === 'Pharmacy Accepted' || order.status === 'Accepted') {
                                    nextStatus = 'Packed';
                                  } else if (order.status === 'Packed') {
                                    nextStatus = order.deliveryType === 'HOME' ? 'Out for Delivery' : 'Ready for Pickup';
                                  } else if (order.status === 'Out for Delivery' || order.status === 'Ready for Pickup' || order.status === 'Ready') {
                                    nextStatus = 'Delivered';
                                  }
                                  handleStatusUpdate(order._id, nextStatus);
                                }}
                             >
                                {t.quick} {
                                  (order.status === 'Pending' || order.status === 'Order Placed') ? t.accept_order : 
                                  (order.status.includes('Accepted')) ? t.mark_ready : 
                                  (order.status === 'Packed') ? (order.deliveryType === 'HOME' ? 'Ship Order' : 'Mark Ready') : 
                                  t.mark_delivered
                                }
                             </Button>
                        </Box>
                    </Card>
                ))}
            </Stack>
        )}

      </Box>

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={4000} 
        onClose={() => setSnackbar(p => ({ ...p, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity} sx={{ borderRadius: 2 }}>{snackbar.message}</Alert>
      </Snackbar>

    </PharmacyLayout>
  );
}
