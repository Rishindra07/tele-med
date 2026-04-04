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
    4: <DeliveredIcon />,
  };

  return (
    <ColorlibStepIconRoot ownerState={{ completed, active }} className={className}>
      {icons[String(props.icon)]}
    </ColorlibStepIconRoot>
  );
}

const steps = ['Pending', 'Accepted', 'Ready/Shipped', 'Delivered'];

const getActiveStep = (status) => {
  switch (status) {
    case 'Pending': return 0;
    case 'Accepted': return 1;
    case 'Ready': return 2;
    case 'Delivered': return 3;
    case 'Rejected': return -1;
    case 'Cancelled': return -1;
    default: return 0;
  }
};

export default function OrderTracking() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
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
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
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
              Track Your Orders
            </Typography>
            <Typography sx={{ color: colors.muted, fontSize: 16 }}>
              Follow the progress of your medicine fulfillment.
            </Typography>
          </Box>
        </Stack>

        {loading ? (
          <Box sx={{ py: 10, textAlign: 'center' }}>
            <CircularProgress size={40} />
            <Typography sx={{ mt: 2, color: colors.muted }}>Loading your orders...</Typography>
          </Box>
        ) : orders.length === 0 ? (
          <Card sx={{ p: 6, textAlign: 'center', borderRadius: 4, border: `1px dashed ${colors.line}`, bgcolor: 'transparent', boxShadow: 'none' }}>
            <Box sx={{ width: 80, height: 80, borderRadius: '50%', bgcolor: colors.primarySoft, color: colors.primary, display: 'grid', placeItems: 'center', mx: 'auto', mb: 3 }}>
              <ShippingIcon sx={{ fontSize: 40 }} />
            </Box>
            <Typography sx={{ fontSize: 20, fontWeight: 700, mb: 1 }}>No Orders Found</Typography>
            <Typography sx={{ color: colors.muted, mb: 3, maxWidth: 400, mx: 'auto' }}>
              You haven't placed any medicine orders yet. Assign a prescription to a pharmacy to see it here.
            </Typography>
            <Button 
              variant="contained" 
              onClick={() => navigate('/patient/records')}
              sx={{ borderRadius: 2, px: 4, py: 1, bgcolor: colors.primary, textTransform: 'none', fontWeight: 600 }}
            >
              Go to Prescriptions
            </Button>
          </Card>
        ) : (
          <Stack spacing={4}>
            {orders.map((order) => {
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
                           {order.status === 'Pending' && (
                             <Button 
                               size="small" 
                               variant="outlined" 
                               color="error"
                               onClick={() => handleCancelOrder(order._id)}
                               sx={{ borderRadius: 1.5, textTransform: 'none', height: 26, fontSize: 11, fontWeight: 700 }}
                             >
                               Cancel Order
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
                              <Typography sx={{ 
                                mt: 1, 
                                fontSize: 14, 
                                fontWeight: activeStep === index ? 700 : 500,
                                color: activeStep >= index ? colors.text : colors.muted
                              }}>
                                {label}
                                {activeStep === index && order.status !== 'Delivered' && (
                                  <Box component="span" sx={{ display: 'block', fontSize: 10, color: colors.primary, mt: 0.5 }}>Current Status</Box>
                                )}
                              </Typography>
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
                            Order contains {order.prescription?.medications?.length || 0} medications from 
                            <b> Dr. {order.prescription?.doctor?.full_name || 'Medical Specialist'}</b>
                          </Typography>
                       </Stack>
                       <Button 
                        size="small" 
                        variant="text" 
                        sx={{ textTransform: 'none', fontWeight: 600, color: colors.primary }}
                        onClick={() => navigate('/patient/records')}
                       >
                         View Prescription Details
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
