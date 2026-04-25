import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Stack,
  Card,
  Chip,
  Stepper,
  Step,
  StepLabel,
  StepConnector,
  stepConnectorClasses,
  styled,
  CircularProgress,
  Grid,
  Button,
  Divider,
  Avatar
} from '@mui/material';
import {
  LocalShippingRounded as ShippingIcon,
  ShoppingBagRounded as OrderIcon,
  CheckCircleRounded as CheckIcon,
  StorefrontRounded as PharmacyIcon,
  AssignmentTurnedInRounded as AcceptedIcon,
  Inventory2Rounded as ReadyIcon,
  HomeRounded as DeliveredIcon,
  ArrowBackRounded as BackIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { ORDER_TRACKING_TRANSLATIONS } from '../../utils/translations/patient';
import PatientShell from '../../components/patient/PatientShell';
import { fetchMyOrders, cancelMyOrder } from '../../api/patientApi';

const colors = {
  bg: '#f8f9fa',
  paper: '#ffffff',
  line: '#e0e0e0',
  text: '#202124',
  muted: '#5f6368',
  primary: '#1a73e8',
  primarySoft: '#e8f0fe',
  success: '#1e8e3e',
  successSoft: '#e6f4ea',
  warning: '#f9ab00',
  warningSoft: '#fef7e0',
  danger: '#d93025',
  dangerSoft: '#fce8e6'
};

const ColorlibConnector = styled(StepConnector)(({ theme }) => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: {
    top: 22,
  },
  [`&.${stepConnectorClasses.active}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      backgroundColor: colors.primary,
    },
  },
  [`&.${stepConnectorClasses.completed}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      backgroundColor: colors.success,
    },
  },
  [`& .${stepConnectorClasses.line}`]: {
    height: 3,
    border: 0,
    backgroundColor: '#eaeaf0',
    borderRadius: 1,
  },
}));

const ColorlibStepIconRoot = styled('div')(({ theme, ownerState }) => ({
  backgroundColor: '#ccc',
  zIndex: 1,
  color: '#fff',
  width: 50,
  height: 50,
  display: 'flex',
  borderRadius: '50%',
  justifyContent: 'center',
  alignItems: 'center',
  ...(ownerState.active && {
    backgroundColor: colors.primary,
    boxShadow: '0 4px 10px 0 rgba(0,0,0,0.25)',
  }),
  ...(ownerState.completed && {
    backgroundColor: colors.success,
  }),
}));

function ColorlibStepIcon(props) {
  const { active, completed, className } = props;

  const icons = {
    1: <OrderIcon />,
    2: <AcceptedIcon />,
    3: <ReadyIcon />,
    4: <ShippingIcon />,
    5: <DeliveredIcon />,
  };

  return (
    <ColorlibStepIconRoot ownerState={{ completed, active }} className={className}>
      {icons[String(props.icon)]}
    </ColorlibStepIconRoot>
  );
}

const steps = ['Placed', 'Accepted', 'Packed', 'Shipped', 'Delivered'];

const getActiveStep = (status) => {
  const s = status.toLowerCase();
  if (s.includes('pending') || s.includes('placed')) return 0;
  if (s.includes('accepted')) return 1;
  if (s.includes('packed')) return 2;
  if (s.includes('shipped') || s.includes('delivery') || s.includes('pickup') || s.includes('ready')) return 3;
  if (s.includes('delivered')) return 4;
  return -1;
};

export default function OrderTracking() {
  const { language } = useLanguage();
  const t = ORDER_TRACKING_TRANSLATIONS[language] || ORDER_TRACKING_TRANSLATIONS['en'];
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();

  const loadOrders = async () => {
    try {
      setLoading(true);
      const res = await fetchMyOrders();
      if (res.success) {
        setOrders(res.orders || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm(t.cancel_order + '?')) return;
    try {
      const res = await cancelMyOrder(orderId);
      if (res.success) {
        setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: 'Cancelled' } : o));
      }
    } catch (err) {
        console.error(err);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    const s = order.status.toLowerCase();
    if (filter === 'accepted') return s.includes('accepted');
    if (filter === 'packed') return s.includes('packed');
    if (filter === 'shipped') return s.includes('delivery') || s.includes('shipped') || s.includes('pickup') || s.includes('ready');
    if (filter === 'delivered') return s.includes('delivered');
    return true;
  });

  const getStatusCount = (targetFilter) => {
     if (targetFilter === 'all') return orders.length;
     return orders.filter(o => {
        const s = o.status.toLowerCase();
        if (targetFilter === 'accepted') return s.includes('accepted');
        if (targetFilter === 'packed') return s.includes('packed');
        if (targetFilter === 'shipped') return s.includes('delivery') || s.includes('shipped') || s.includes('pickup') || s.includes('ready');
        if (targetFilter === 'delivered') return s.includes('delivered');
        return false;
     }).length;
  };

  return (
    <PatientShell activeItem="orders">
      <Box sx={{ px: { xs: 2, md: 4, xl: 6 }, py: { xs: 3, md: 4 }, bgcolor: colors.bg, minHeight: '100vh' }}>
        
        {/* Header */}
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 4 }}>
          <Button 
            onClick={() => navigate('/patient')}
            sx={{ minWidth: 40, width: 40, height: 40, borderRadius: '50%', bgcolor: '#fff', color: colors.text, border: `1px solid ${colors.line}` }}
          >
            <BackIcon fontSize="small" />
          </Button>
          <Box>
            <Typography sx={{ fontSize: { xs: 24, md: 32 }, fontWeight: 700, color: colors.text }}>
              {t.title}
            </Typography>
            <Typography sx={{ color: colors.muted, fontSize: 16 }}>
              {t.subtitle}
            </Typography>
          </Box>
        </Stack>

        {/* Filter Tabs */}
        {!loading && orders.length > 0 && (
          <Box sx={{ mb: 4, overflowX: 'auto', pb: 1 }}>
            <Stack direction="row" spacing={1.5} sx={{ minWidth: 'max-content' }}>
              {[
                { id: 'all', label: 'All Orders' },
                { id: 'accepted', label: 'Accepted' },
                { id: 'packed', label: 'Packed' },
                { id: 'shipped', label: 'Shipped' },
                { id: 'delivered', label: 'Delivered' }
              ].map((item) => {
                const count = getStatusCount(item.id);
                const isActive = filter === item.id;
                
                return (
                  <Chip
                    key={item.id}
                    label={`${item.label} (${count})`}
                    onClick={() => setFilter(item.id)}
                    sx={{
                      px: 2,
                      py: 2.2,
                      borderRadius: 2,
                      border: `1px solid ${isActive ? colors.primary : colors.line}`,
                      bgcolor: isActive ? colors.primary : '#fff',
                      color: isActive ? '#fff' : colors.text,
                      fontWeight: 600,
                      fontSize: 14,
                      transition: 'all 0.2s',
                      boxShadow: isActive ? '0 4px 12px rgba(26,115,232,0.2)' : 'none',
                      '&:hover': { bgcolor: isActive ? colors.primary : colors.primarySoft }
                    }}
                  />
                );
              })}
            </Stack>
          </Box>
        )}

        {loading ? (
          <Box sx={{ py: 10, textAlign: 'center' }}>
            <CircularProgress size={40} />
            <Typography sx={{ mt: 2, color: colors.muted }}>{t.loading}</Typography>
          </Box>
        ) : orders.length === 0 ? (
          <Card sx={{ p: 6, textAlign: 'center', borderRadius: 4, border: `1px dashed ${colors.line}`, bgcolor: 'transparent', boxShadow: 'none' }}>
            <Box sx={{ width: 80, height: 80, borderRadius: '50%', bgcolor: colors.primarySoft, color: colors.primary, display: 'grid', placeItems: 'center', mx: 'auto', mb: 3 }}>
              <ShippingIcon sx={{ fontSize: 40 }} />
            </Box>
            <Typography sx={{ fontSize: 20, fontWeight: 700, mb: 1 }}>{t.no_orders}</Typography>
            <Typography sx={{ color: colors.muted, mb: 3, maxWidth: 400, mx: 'auto' }}>
              {t.no_orders_desc}
            </Typography>
            <Button 
              variant="contained" 
              onClick={() => navigate('/patient/records')}
              sx={{ borderRadius: 2, px: 4, py: 1, bgcolor: colors.primary, textTransform: 'none', fontWeight: 600 }}
            >
              {t.go_prescriptions}
            </Button>
          </Card>
        ) : filteredOrders.length === 0 ? (
          <Box sx={{ py: 8, textAlign: 'center' }}>
             <Typography sx={{ color: colors.muted, fontSize: 16 }}>
               No orders found for the selected status.
             </Typography>
             <Button variant="text" onClick={() => setFilter('all')} sx={{ mt: 1, textTransform: 'none' }}>Show all</Button>
          </Box>
        ) : (
          <Stack spacing={4}>
            {filteredOrders.map((order) => {
              const activeStep = getActiveStep(order.status);
              const isFailed = order.status === 'Rejected' || order.status === 'Cancelled';
              
              return (
                <Card key={order._id} sx={{ p: 0, borderRadius: 4, border: `1px solid ${colors.line}`, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                  {/* Order Top Info */}
                  <Box sx={{ p: 3, bgcolor: '#fff', borderBottom: `1px solid ${colors.line}` }}>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} md={6}>
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Avatar sx={{ bgcolor: colors.primarySoft, color: colors.primary }}>
                            <PharmacyIcon />
                          </Avatar>
                          <Box>
                            <Typography sx={{ fontSize: 18, fontWeight: 700 }}>{order.pharmacy?.pharmacyName || 'Pharmacy'}</Typography>
                            <Typography sx={{ fontSize: 13, color: colors.muted }}>
                              ID: #{order._id.slice(-8).toUpperCase()} • {new Date(order.createdAt).toLocaleString()}
                            </Typography>
                          </Box>
                        </Stack>
                      </Grid>
                      <Grid item xs={12} md={6} sx={{ textAlign: { md: 'right' } }}>
                        <Stack direction="row" spacing={1} justifyContent={{ md: 'flex-end' }} alignItems="center">
                           {(order.status === 'Pending' || order.status === 'Order Placed') && (
                             <Button 
                               size="small" 
                               variant="outlined" 
                               color="error"
                               onClick={() => handleCancelOrder(order._id)}
                               sx={{ borderRadius: 1.5, textTransform: 'none', height: 26, fontSize: 11, fontWeight: 700 }}
                             >
                               {t.cancel_order}
                             </Button>
                           )}
                           <Chip 
                            label={order.deliveryType} 
                            size="small" 
                            variant="outlined"
                            sx={{ fontWeight: 600, fontSize: 11 }}
                           />
                            <Chip 
                             label={order.status.toUpperCase()} 
                             color={isFailed ? 'error' : order.status === 'Delivered' ? 'success' : 'primary'}
                             size="small"
                             sx={{ fontWeight: 700, fontSize: 11 }}
                            />
                            <Chip 
                             label={order.paymentStatus === 'Paid' ? 'PAID' : (order.paymentMethod === 'COD' ? 'COD - UNPAID' : 'PAYMENT PENDING')} 
                             variant="filled"
                             color={order.paymentStatus === 'Paid' ? 'success' : 'warning'}
                             size="small"
                             sx={{ fontWeight: 800, fontSize: 10, bgcolor: order.paymentStatus === 'Paid' ? colors.success : colors.warning, color: '#fff' }}
                            />
                        </Stack>
                      </Grid>
                    </Grid>
                  </Box>

                  {/* Stepper Logic */}
                  <Box sx={{ p: 4, bgcolor: '#fafafa' }}>
                    {isFailed ? (
                       <Box sx={{ py: 2, px: 4, bgcolor: colors.dangerSoft, borderRadius: 3, border: `1px solid ${colors.danger}40`, textAlign: 'center' }}>
                         <Typography sx={{ color: colors.danger, fontWeight: 700, fontSize: 16 }}>
                           Order {order.status}
                         </Typography>
                         <Typography sx={{ color: colors.danger, fontSize: 14 }}>
                           Please contact the pharmacy or try another one.
                         </Typography>
                       </Box>
                    ) : (
                      <Stepper alternativeLabel activeStep={activeStep} connector={<ColorlibConnector />}>
                        {steps.map((label, index) => (
                          <Step key={label}>
                            <StepLabel StepIconComponent={ColorlibStepIcon}>
                              <Box sx={{ 
                                mt: 1, 
                                fontSize: 14, 
                                fontWeight: activeStep === index ? 700 : 500,
                                color: activeStep >= index ? colors.text : colors.muted
                              }}>
                                {t.steps[label] || label}
                                {activeStep === index && order.status !== 'Delivered' && (
                                  <Box component="span" sx={{ display: 'block', fontSize: 10, color: colors.primary, mt: 0.5 }}>{t.current_status}</Box>
                                )}
                              </Box>
                            </StepLabel>
                          </Step>
                        ))}
                      </Stepper>
                    )}
                  </Box>

                  {/* Order Details Footer */}
                  <Box sx={{ p: 2, bgcolor: '#fff', borderTop: `1px solid ${colors.line}`, px: 4 }}>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} justifyContent="space-between" alignItems="center">
                       <Stack direction="row" spacing={1} alignItems="center">
                          <CheckIcon sx={{ color: colors.success, fontSize: 18 }} />
                          <Typography sx={{ fontSize: 13, color: colors.muted }}>
                            {t.order_contains} {order.prescription?.medications?.length || 0} {t.medications_from} 
                            <b> Dr. {(order.prescription?.doctor?.full_name || 'Medical Specialist').replace(/^(Dr\.|Dr)\s+/i, '')}</b>
                          </Typography>
                       </Stack>
                       <Button 
                        size="small" 
                        variant="text" 
                        sx={{ textTransform: 'none', fontWeight: 600, color: colors.primary }}
                        onClick={() => navigate('/patient/records')}
                       >
                         {t.view_details}
                       </Button>
                    </Stack>
                  </Box>
                </Card>
              );
            })}
          </Stack>
        )}

      </Box>
    </PatientShell>
  );
}
