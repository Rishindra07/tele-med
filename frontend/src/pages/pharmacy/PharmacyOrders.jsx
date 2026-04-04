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
  ReceiptLongRounded as PrescriptionIcon,
  EditRounded as EditIcon,
  MoreVertRounded as MoreIcon,
  RefreshRounded as RefreshIcon
} from '@mui/icons-material';
import PharmacyLayout from '../../components/PharmacyLayout';
import { fetchIncomingOrders, updateOrderStatus } from '../../api/pharmacyApi';

const colors = {
  bg: '#f5f1e8',
  sidebarBg: '#fcfbf7',
  line: '#d8d0c4',
  muted: '#6f6a62',
  text: '#252525',
  green: '#26a37c',
  greenSoft: '#dff3eb',
  greenDark: '#176d57',
  warning: '#f9ab00',
  warningSoft: '#fef7e0',
  danger: '#d93025',
  dangerSoft: '#fce8e6'
};

const statuses = ["Pending", "Accepted", "Ready", "Delivered", "Rejected", "Cancelled"];

export default function PharmacyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

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
      case 'Delivered': return colors.green;
      case 'Accepted': return colors.greenDark;
      case 'Ready': return '#1a73e8';
      case 'Pending': return colors.warning;
      case 'Rejected':
      case 'Cancelled': return colors.danger;
      default: return colors.muted;
    }
  };

  const getStatusSoft = (status) => {
    switch (status) {
      case 'Delivered': return colors.greenSoft;
      case 'Accepted': return '#e8f5e9';
      case 'Ready': return '#e8f0fe';
      case 'Pending': return colors.warningSoft;
      case 'Rejected':
      case 'Cancelled': return colors.dangerSoft;
      default: return '#f0f0f0';
    }
  };

  return (
    <PharmacyLayout>
      <Box sx={{ p: { xs: 2.5, md: 4 }, minHeight: '100vh' }}>
        
        {/* Header */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
          <Box>
            <Typography sx={{ fontSize: 32, fontWeight: 700, color: colors.text, fontFamily: 'Georgia, serif' }}>
              Incoming Orders
            </Typography>
            <Typography sx={{ color: colors.muted, fontSize: 16 }}>
              Review and update prescription fulfillment requests.
            </Typography>
          </Box>
          <Button 
            startIcon={<RefreshIcon />} 
            onClick={loadOrders}
            sx={{ color: colors.greenDark, fontWeight: 600, textTransform: 'none' }}
          >
            Refresh
          </Button>
        </Stack>

        {/* Filter Bar */}
        <Box sx={{ mb: 4, p: 2, bgcolor: '#fff', borderRadius: 3, border: `1px solid ${colors.line}`, display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
            <TextField
                select
                size="small"
                label="Status Filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                sx={{ minWidth: 150, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            >
                <MenuItem value="All">All Statuses</MenuItem>
                {statuses.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
            </TextField>
            <TextField
                size="small"
                placeholder="Search patient or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{ minWidth: 250, flex: 1, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
            <Typography sx={{ color: colors.muted, fontSize: 13, ml: 'auto' }}>
                Found {filteredOrders.length} orders
            </Typography>
        </Box>

        {loading ? (
             <Box sx={{ py: 10, textAlign: 'center' }}>
                <CircularProgress sx={{ color: colors.green }} />
                <Typography sx={{ mt: 2, color: colors.muted }}>Fetching new orders...</Typography>
             </Box>
        ) : filteredOrders.length === 0 ? (
            <Card sx={{ p: 6, textAlign: 'center', borderRadius: 4, border: `1px dashed ${colors.line}`, bgcolor: 'transparent', boxShadow: 'none' }}>
                <OrderIcon sx={{ fontSize: 48, color: colors.line, mb: 2 }} />
                <Typography sx={{ fontSize: 18, fontWeight: 600, color: colors.muted }}>No orders found.</Typography>
                <Typography sx={{ fontSize: 14, color: colors.muted }}>Adjust your filters or wait for new assignments.</Typography>
            </Card>
        ) : (
            <Stack spacing={3}>
                {filteredOrders.map((order) => (
                    <Card key={order._id} sx={{ p: 0, borderRadius: 3, border: `1px solid ${colors.line}`, boxShadow: '0 2px 8px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
                        <Box sx={{ p: 3, bgcolor: '#fff', borderBottom: `1px solid ${colors.line}` }}>
                            <Grid container spacing={3} alignItems="center">
                                <Grid item xs={12} md={4}>
                                    <Stack direction="row" spacing={2} alignItems="center">
                                        <Avatar sx={{ bgcolor: colors.greenSoft, color: colors.greenDark }}>
                                            <PatientIcon />
                                        </Avatar>
                                        <Box>
                                            <Typography sx={{ fontSize: 16, fontWeight: 700 }}>{order.patient?.full_name || 'Patient'}</Typography>
                                            <Typography sx={{ fontSize: 12, color: colors.muted }}>{order.patient?.phone || order.patient?.email}</Typography>
                                        </Box>
                                    </Stack>
                                </Grid>
                                <Grid item xs={12} md={4}>
                                    <Stack spacing={0.5}>
                                        <Typography sx={{ fontSize: 13, fontWeight: 600, color: colors.muted, display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <OrderIcon fontSize="small" /> ID: #{order._id.slice(-8).toUpperCase()}
                                        </Typography>
                                        <Typography sx={{ fontSize: 13, fontWeight: 600, color: colors.muted, display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <ShippingIcon fontSize="small" /> {order.deliveryType} • {order.deliveryAddress || 'Pickup'}
                                        </Typography>
                                    </Stack>
                                </Grid>
                                <Grid item xs={12} md={4} sx={{ textAlign: { md: 'right' } }}>
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
                                        Received: {new Date(order.createdAt).toLocaleString()}
                                    </Typography>
                                </Grid>
                            </Grid>
                        </Box>

                        <Box sx={{ p: 3, bgcolor: '#fcfbf7' }}>
                            <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ md: 'center' }} spacing={2}>
                                <Stack direction="row" spacing={4}>
                                    <Box>
                                        <Typography sx={{ fontSize: 12, color: colors.muted, textTransform: 'uppercase', letterSpacing: 1, mb: 1 }}>Prescription Details</Typography>
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <PrescriptionIcon sx={{ color: colors.green, fontSize: 18 }} />
                                            <Typography sx={{ fontSize: 14 }}>
                                               {order.prescription?.medications?.length || 0} items prescribed
                                            </Typography>
                                        </Stack>
                                    </Box>
                                    {order.deliveryType === 'HOME' && (
                                         <Box>
                                            <Typography sx={{ fontSize: 12, color: colors.muted, textTransform: 'uppercase', letterSpacing: 1, mb: 1 }}>Delivery Details</Typography>
                                            <Typography sx={{ fontSize: 14 }}>{order.deliveryAddress}</Typography>
                                         </Box>
                                    )}
                                </Stack>

                                <Box sx={{ minWidth: 200 }}>
                                    <Typography sx={{ fontSize: 12, color: colors.muted, mb: 1 }}>Update Order Status</Typography>
                                    <Stack direction="row" spacing={1}>
                                        <TextField
                                            select
                                            size="small"
                                            value={order.status}
                                            onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                                            fullWidth
                                            disabled={updating === order._id || order.status === 'Delivered' || order.status === 'Cancelled'}
                                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: '#fff' } }}
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
                        <Box sx={{ p: 2, px: 3, bgcolor: '#fff', display: 'flex', justifyContent: 'flex-end' }}>
                             <Button 
                                size="small" 
                                sx={{ color: colors.greenDark, fontWeight: 600, textTransform: 'none' }}
                                startIcon={<CheckIcon />}
                                disabled={order.status === 'Delivered' || order.status === 'Cancelled' || order.status === 'Rejected'}
                                onClick={() => {
                                  let nextStatus = 'Accepted';
                                  if (order.status === 'Accepted') nextStatus = 'Ready';
                                  if (order.status === 'Ready') nextStatus = 'Delivered';
                                  handleStatusUpdate(order._id, nextStatus);
                                }}
                             >
                                Quick {order.status === 'Pending' ? 'Accept Order' : order.status === 'Accepted' ? 'Mark Ready' : 'Mark Delivered'}
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
