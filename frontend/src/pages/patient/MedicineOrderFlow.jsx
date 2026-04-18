import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Stepper, Step, StepLabel, Button, Card, 
  CardContent, Grid, TextField, IconButton, Stack, Chip,
  CircularProgress, Divider, List, ListItem, ListItemText,
  ListItemIcon, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Alert, RadioGroup, FormControlLabel, Radio
} from '@mui/material';
import { 
  CloudUpload as UploadIcon, 
  DeleteOutline as DeleteIcon,
  Add as AddIcon,
  Edit as EditIcon,
  LocationOn as LocationIcon,
  Payments as PaymentIcon,
  LocalPharmacy as PharmacyIcon,
  CheckCircle as CheckIcon,
  ArrowBack as BackIcon,
  ArrowForward as NextIcon,
  ShoppingCart as CartIcon,
  Description as RxIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { MEDICINE_ORDER_FLOW_TRANSLATIONS } from '../../utils/translations/patient';
import PatientShell from '../../components/patient/PatientShell';
import { 
  fetchMyRecords, 
  fetchPharmacies, 
  extractPrescriptionMedicines, 
  createAdvancedPrescriptionOrder,
  createRazorpayOrder,
  verifyRazorpayPayment,
  checkPharmacyStock
} from '../../api/patientApi';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

const colors = {
  primary: '#1a73e8',
  primarySoft: '#e8f0fe',
  success: '#1e8e3e',
  warning: '#f9ab00',
  danger: '#d93025',
  text: '#202124',
  muted: '#5f6368',
  bg: '#f8f9fa'
};

export default function MedicineOrderFlow() {
  const { language } = useLanguage();
  const t = MEDICINE_ORDER_FLOW_TRANSLATIONS[language] || MEDICINE_ORDER_FLOW_TRANSLATIONS['en'];
  const navigate = useNavigate();

  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState([]);
  const [pharmacies, setPharmacies] = useState([]);
  
  // Form State
  const [selectedRx, setSelectedRx] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [deliveryType, setDeliveryType] = useState('PICKUP');
  const [selectedPharmacy, setSelectedPharmacy] = useState(null);
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [paying, setPaying] = useState(false);
  const [paymentDone, setPaymentDone] = useState(false);
  const [stockInfo, setStockInfo] = useState([]);
  const [checkingStock, setCheckingStock] = useState(false);

  const steps = [t.step_rx, t.step_cart, t.step_pharmacy, t.step_checkout];

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [recRes, pharRes] = await Promise.all([
        fetchMyRecords(),
        fetchPharmacies()
      ]);
      if (recRes.success) setRecords(recRes.records.filter(r => r.type === 'prescription'));
      if (pharRes.success) setPharmacies(pharRes.pharmacies);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      setUploadedFile(file);
      setLoading(true);
      try {
        const res = await extractPrescriptionMedicines(file);
        if (res.success) {
          setCartItems(res.medicines);
          setActiveStep(1);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSelectRx = (rx) => {
    setSelectedRx(rx);
    const meds = rx.prescription?.medications || rx.prescriptionDetails || [];
    setCartItems(meds.map(m => ({
      name: m.name,
      dosage: m.dosage,
      quantity: 10,
      frequency: m.frequency,
      instructions: m.instructions
    })));
    setActiveStep(1);
  };

  const updateCartItem = (index, field, value) => {
    const newItems = [...cartItems];
    newItems[index][field] = value;
    setCartItems(newItems);
  };

  const removeCartItem = (index) => {
    setCartItems(cartItems.filter((_, i) => i !== index));
  };

  const addEmptyItem = () => {
    setCartItems([...cartItems, { name: '', dosage: '', quantity: 1, frequency: '', instructions: '' }]);
  };

  useEffect(() => {
    if (selectedPharmacy && cartItems.length > 0 && activeStep === 3) {
      handleCheckStock();
    }
  }, [selectedPharmacy, activeStep]);

  const handleCheckStock = async () => {
    setCheckingStock(true);
    try {
      const res = await checkPharmacyStock({
        pharmacyId: selectedPharmacy._id,
        items: cartItems.map(i => ({ name: i.name, quantity: i.quantity }))
      });
      if (res.success) {
        setStockInfo(res.results);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCheckingStock(false);
    }
  };

  const calculateTotal = () => {
    if (stockInfo.length > 0) {
      return stockInfo.reduce((sum, item) => {
        const cartItem = cartItems.find(c => c.name.toLowerCase() === item.name.toLowerCase());
        const qty = cartItem ? cartItem.quantity : 1;
        return sum + (item.price * qty);
      }, 0) + (deliveryType === 'HOME' ? 40 : 0);
    }
    return cartItems.reduce((sum, item) => sum + (150 * (item.quantity || 1)), 0) + (deliveryType === 'HOME' ? 40 : 0);
  };

  const handleSubmitOrder = async (finalPaymentStatus = 'Pending', referenceDetails = null) => {
    setLoading(true);
    try {
      const totalAmount = calculateTotal();
      const orderData = {
        prescriptionId: selectedRx?._id || selectedRx?.prescription?._id,
        pharmacyId: selectedPharmacy._id,
        items: cartItems.map((item, idx) => ({
          ...item,
          price: stockInfo.find(s => s.name === item.name)?.price || 150
        })),
        deliveryType,
        deliveryAddress: address,
        paymentMethod,
        paymentStatus: finalPaymentStatus,
        totalAmount,
        deliveryFee: deliveryType === 'HOME' ? 40 : 0,
        notes: "Placed via Advanced Order Flow"
      };
      
      const res = await createAdvancedPrescriptionOrder(orderData);
      if (res.success) {
        if (!referenceDetails) {
          setActiveStep(4);
        }
        return res;
      }
    } catch (err) {
      console.error(err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleRazorpayPayment = async () => {
    const totalAmount = calculateTotal();
    setPaying(true);
    
    try {
      // 1. Create order first in Pending state
      const orderResData = await handleSubmitOrder('Pending', { isPaymentFlow: true });
      if (!orderResData || !orderResData.orderId) {
        throw new Error("Could not create initial order");
      }

      // 2. Create Razorpay Order with reference
      const orderRes = await createRazorpayOrder({ 
        amount: totalAmount,
        referenceId: orderResData.orderId,
        referenceType: 'medicine_order'
      });

      if (!orderRes.success) throw new Error("Payment server busy");

      const options = {
        key: orderRes.keyId || import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_placeholder",
        amount: orderRes.amount,
        currency: orderRes.currency,
        name: "Seva Telehealth",
        description: "Payment for Medicines",
        order_id: orderRes.orderId,
        handler: async (response) => {
          setPaying(true);
          try {
            const verifyRes = await verifyRazorpayPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });

            if (verifyRes.success) {
              setPaymentDone(true);
              setActiveStep(4);
            } else {
              alert("Payment verification failed");
            }
          } catch (err) {
            alert("Verification error: " + err.message);
          } finally {
            setPaying(false);
          }
        },
        prefill: {
          name: JSON.parse(localStorage.getItem('user') || '{}').full_name || '',
          email: JSON.parse(localStorage.getItem('user') || '{}').email || ''
        },
        theme: { color: colors.primary }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (resp) => {
        alert("Payment Failed: " + resp.error.description);
      });
      rzp.open();
    } catch (err) {
      console.error(err);
      alert("Payment error: " + err.message);
    } finally {
      setPaying(false);
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>{t.select_rx}</Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card 
                  onClick={() => document.getElementById('rx-upload').click()}
                  sx={{ 
                    height: '100%', cursor: 'pointer', border: '2px dashed #ccc', 
                    '&:hover': { borderColor: colors.primary, bgcolor: colors.primarySoft } 
                  }}
                >
                  <CardContent sx={{ textAlign: 'center', py: 5 }}>
                    <UploadIcon sx={{ fontSize: 48, color: colors.muted, mb: 2 }} />
                    <Typography variant="h6">{t.upload_rx}</Typography>
                    <Typography color="textSecondary">{t.upload_desc}</Typography>
                    <input type="file" id="rx-upload" hidden onChange={handleFileUpload} accept="image/*,.pdf" />
                  </CardContent>
                </Card>
              </Grid>
              {records.map((rx) => (
                <Grid item xs={12} md={6} key={rx._id}>
                  <Card 
                    onClick={() => handleSelectRx(rx)}
                    sx={{ 
                      cursor: 'pointer', border: '1px solid #eee',
                      '&:hover': { borderColor: colors.primary, boxShadow: 3 }
                    }}
                  >
                    <CardContent>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: colors.primarySoft, color: colors.primary }}>
                          <RxIcon />
                        </Box>
                        <Box>
                          <Typography fontWeight={600}>{rx.title}</Typography>
                          <Typography variant="body2" color="textSecondary">
                            {new Date(rx.date).toLocaleDateString()} • {rx.doctorInfo?.name || 'Dr. Seva'}
                          </Typography>
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        );

      case 1:
        return (
          <Box>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>{t.extracted_items}</Typography>
            {loading ? (
               <Box sx={{ py: 5, textAlign: 'center' }}>
                 <CircularProgress sx={{ mb: 2 }} />
                 <Typography>{t.extracting}</Typography>
               </Box>
            ) : (
              <Box>
                <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #eee', mb: 3 }}>
                  <Table>
                    <TableHead sx={{ bgcolor: '#fafafa' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>{t.med_name}</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>{t.dosage}</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>{t.quantity}</TableCell>
                        <TableCell sx={{ width: 50 }}></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {cartItems.map((item, idx) => (
                        <TableRow key={idx}>
                          <TableCell>
                            <TextField 
                              fullWidth size="small" variant="standard" value={item.name} 
                              onChange={(e) => updateCartItem(idx, 'name', e.target.value)} 
                            />
                          </TableCell>
                          <TableCell>
                            <TextField 
                              size="small" variant="standard" value={item.dosage} 
                              onChange={(e) => updateCartItem(idx, 'dosage', e.target.value)} 
                            />
                          </TableCell>
                          <TableCell>
                            <TextField 
                              type="number" size="small" variant="standard" value={item.quantity} 
                              onChange={(e) => updateCartItem(idx, 'quantity', e.target.value)} 
                              sx={{ width: 60 }}
                            />
                          </TableCell>
                          <TableCell>
                            <IconButton color="error" onClick={() => removeCartItem(idx)}>
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                <Button startIcon={<AddIcon />} onClick={addEmptyItem} variant="outlined" sx={{ mb: 4 }}>
                  {t.add_medicine}
                </Button>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Button startIcon={<BackIcon />} onClick={() => setActiveStep(0)}>{t.back}</Button>
                  <Button variant="contained" endIcon={<NextIcon />} onClick={() => setActiveStep(2)}>{t.next}</Button>
                </Box>
              </Box>
            )}
          </Box>
        );

      case 2:
        return (
          <Box>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>{t.select_delivery}</Typography>
            <Stack direction="row" spacing={3} sx={{ mb: 5 }}>
              <Card 
                onClick={() => setDeliveryType('PICKUP')}
                sx={{ 
                  flex: 1, cursor: 'pointer', border: `2px solid ${deliveryType === 'PICKUP' ? colors.primary : '#eee'}`,
                  bgcolor: deliveryType === 'PICKUP' ? colors.primarySoft : '#fff'
                }}
              >
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h1" sx={{ mb: 1 }}>🏪</Typography>
                  <Typography fontWeight={600}>{t.pickup}</Typography>
                </CardContent>
              </Card>
              <Card 
                onClick={() => setDeliveryType('HOME')}
                sx={{ 
                  flex: 1, cursor: 'pointer', border: `2px solid ${deliveryType === 'HOME' ? colors.primary : '#eee'}`,
                  bgcolor: deliveryType === 'HOME' ? colors.primarySoft : '#fff'
                }}
              >
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h1" sx={{ mb: 1 }}>🚚</Typography>
                  <Typography fontWeight={600}>{t.delivery}</Typography>
                </CardContent>
              </Card>
            </Stack>

            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>{t.nearby_pharmacies}</Typography>
            <Grid container spacing={2} sx={{ mb: 4 }}>
              {pharmacies.map(p => (
                <Grid item xs={12} key={p._id}>
                  <Card 
                    onClick={() => setSelectedPharmacy(p)}
                    sx={{ 
                      cursor: 'pointer', border: `1px solid ${selectedPharmacy?._id === p._id ? colors.primary : '#eee'}`,
                      bgcolor: selectedPharmacy?._id === p._id ? colors.primarySoft : '#fff'
                    }}
                  >
                    <CardContent sx={{ py: 1.5 }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Stack direction="row" spacing={2} alignItems="center">
                          <PharmacyIcon color={selectedPharmacy?._id === p._id ? 'primary' : 'disabled'} />
                          <Box>
                            <Typography fontWeight={600}>{p.pharmacyName}</Typography>
                            <Typography variant="body2" color="textSecondary">{p.address}</Typography>
                          </Box>
                        </Stack>
                        {selectedPharmacy?._id === p._id && <CheckIcon color="primary" />}
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button startIcon={<BackIcon />} onClick={() => setActiveStep(1)}>{t.back}</Button>
              <Button 
                variant="contained" 
                endIcon={<NextIcon />} 
                onClick={() => setActiveStep(3)}
                disabled={!selectedPharmacy}
              >
                {t.next}
              </Button>
            </Box>
          </Box>
        );

      case 3:
        return (
          <Box>
            <Grid container spacing={4}>
              <Grid item xs={12} md={7}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>{t.delivery_details}</Typography>
                {deliveryType === 'HOME' && (
                  <TextField 
                    fullWidth multiline rows={4} label={t.delivery_details} placeholder={t.address_placeholder}
                    value={address} onChange={(e) => setAddress(e.target.value)} sx={{ mb: 3 }}
                  />
                )}
                
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>{t.payment_method}</Typography>
                <RadioGroup value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                  {deliveryType === 'HOME' && (
                    <Box sx={{ p: 2, mb: 1, borderRadius: 2, border: '1px solid #eee', bgcolor: paymentMethod === 'COD' ? colors.primarySoft : '#fff' }}>
                      <FormControlLabel value="COD" control={<Radio />} label={
                        <Box>
                          <Typography fontWeight={700}>{t.cod}</Typography>
                          <Typography variant="caption" color="textSecondary">Pay when you receive the medicine</Typography>
                        </Box>
                      } />
                    </Box>
                  )}
                  <Box sx={{ p: 2, mb: 1, borderRadius: 2, border: '1px solid #eee', bgcolor: paymentMethod === 'UPI' ? colors.primarySoft : '#fff' }}>
                    <FormControlLabel value="UPI" control={<Radio />} label={
                      <Box>
                        <Typography fontWeight={700}>Pay Online (UPI/Card)</Typography>
                        <Typography variant="caption" color="textSecondary">Secure online payment with instant confirmation</Typography>
                      </Box>
                    } />
                  </Box>
                  {deliveryType === 'PICKUP' && (
                    <Box sx={{ p: 2, mb: 1, borderRadius: 2, border: '1px solid #eee', bgcolor: paymentMethod === 'OFFLINE' ? colors.primarySoft : '#fff' }}>
                      <FormControlLabel value="OFFLINE" control={<Radio />} label={
                        <Box>
                          <Typography fontWeight={700}>Pay at Store</Typography>
                          <Typography variant="caption" color="textSecondary">Pay offline when visiting the pharmacy</Typography>
                        </Box>
                      } />
                    </Box>
                  )}
                </RadioGroup>
              </Grid>

              <Grid item xs={12} md={5}>
                <Card sx={{ bgcolor: '#fff', border: `1px solid ${colors.line}`, borderRadius: 3, boxShadow: '0 10px 30px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
                  <Box sx={{ p: 2.5, bgcolor: colors.primary, color: '#fff' }}>
                    <Typography variant="subtitle1" fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CartIcon fontSize="small" /> {t.order_summary}
                    </Typography>
                  </Box>
                  <CardContent sx={{ p: 3 }}>
                    <Stack spacing={2} sx={{ mb: 3 }}>
                      {checkingStock ? (
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4, gap: 2 }}>
                          <CircularProgress size={24} thickness={5} sx={{ color: colors.primary }} />
                          <Typography variant="body2" sx={{ color: colors.muted, fontWeight: 500 }}>Verifying items with pharmacy inventory...</Typography>
                        </Box>
                      ) : (
                        cartItems.map((item, i) => {
                          const info = stockInfo.find(s => s.name.toLowerCase() === item.name.toLowerCase());
                          const isOutOfStock = info && info.available === 0;
                          return (
                            <Box key={i} sx={{ p: 2, borderRadius: 2, bgcolor: '#fcfcfc', border: `1px solid ${isOutOfStock ? colors.danger + '40' : colors.line}`, position: 'relative' }}>
                              <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                                <Box sx={{ flex: 1 }}>
                                  <Typography variant="body1" fontWeight={700} color={isOutOfStock ? colors.danger : colors.text}>{item.name}</Typography>
                                  <Typography variant="caption" sx={{ color: colors.muted, display: 'block', mt: 0.5 }}>
                                    {item.dosage || 'Standard'}
                                  </Typography>
                                  
                                  {/* Editable Quantity Controls */}
                                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 1.5 }}>
                                    <IconButton 
                                      size="small" 
                                      sx={{ border: `1px solid ${colors.line}`, p: 0.5 }} 
                                      onClick={() => updateCartItem(i, 'quantity', Math.max(1, (item.quantity || 1) - 1))}
                                    >
                                      <DeleteIcon sx={{ fontSize: 14 }} />
                                    </IconButton>
                                    <Typography variant="body2" fontWeight={700} sx={{ minWidth: 20, textAlign: 'center' }}>
                                      {item.quantity || 1}
                                    </Typography>
                                    <IconButton 
                                      size="small" 
                                      sx={{ border: `1px solid ${colors.line}`, p: 0.5 }} 
                                      onClick={() => updateCartItem(i, 'quantity', (item.quantity || 1) + 1)}
                                    >
                                      <AddIcon sx={{ fontSize: 14 }} />
                                    </IconButton>
                                  </Stack>
                                </Box>
                                <Box sx={{ textAlign: 'right' }}>
                                  <Typography variant="h6" fontWeight={800} color={colors.primary}>₹{(info ? info.price : 150) * (item.quantity || 1)}</Typography>
                                  <Typography variant="caption" sx={{ color: colors.muted }}>₹{info ? info.price : 150} / unit</Typography>
                                </Box>
                              </Stack>
                              
                              <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
                                {info ? (
                                  <Chip 
                                    label={info.inStock ? 'In Stock' : (info.available > 0 ? `Stock: ${info.available}` : 'Out of Stock')} 
                                    size="small" 
                                    icon={info.inStock ? <CheckIcon sx={{ fontSize: '14px !important' }} /> : <WarningIcon sx={{ fontSize: '14px !important' }} />}
                                    sx={{ 
                                      height: 24, fontSize: 11, fontWeight: 700, 
                                      bgcolor: info.inStock ? '#e6f4ea' : info.available > 0 ? '#fef7e0' : '#fce8e6',
                                      color: info.inStock ? colors.success : info.available > 0 ? colors.warning : colors.danger,
                                      border: 'none'
                                    }}
                                  />
                                ) : (
                                  <Chip label="Verifying..." size="small" sx={{ height: 24, fontSize: 11 }} />
                                )}
                              </Stack>
                            </Box>
                          );
                        })
                      )}
                    </Stack>

                    <Box sx={{ borderTop: `2px dashed ${colors.line}`, pt: 3, px: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                        <Typography variant="body2" color="textSecondary">Subtotal (Items)</Typography>
                        <Typography variant="body2" fontWeight={600}>₹{calculateTotal() - (deliveryType === 'HOME' ? 40 : 0)}</Typography>
                      </Box>
                      {deliveryType === 'HOME' && (
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                          <Typography variant="body2" color="textSecondary">Delivery & Handling Fee</Typography>
                          <Typography variant="body2" fontWeight={600}>₹40</Typography>
                        </Box>
                      )}
                      
                      <Box sx={{ 
                        mt: 3, p: 2.5, borderRadius: 2.5, 
                        background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark || '#1557b0'} 100%)`, 
                        color: '#fff', boxShadow: '0 4px 15px rgba(26,115,232,0.2)' 
                      }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Box>
                            <Typography variant="caption" sx={{ opacity: 0.8, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700 }}>Total Outstanding Bill</Typography>
                            <Typography variant="h4" fontWeight={900}>₹{calculateTotal()}</Typography>
                          </Box>
                          <PaymentIcon sx={{ fontSize: 40, opacity: 0.3 }} />
                        </Stack>
                      </Box>
                    </Box>

                    <Button 
                      fullWidth 
                      variant="contained" 
                      size="large" 
                      sx={{ 
                        mt: 4, height: 56, borderRadius: 3, fontSize: 18, fontWeight: 800, 
                        bgcolor: colors.primary, boxShadow: '0 8px 16px rgba(26,115,232,0.24)',
                        textTransform: 'none',
                        '&:hover': { bgcolor: colors.primaryDark || '#1557b0', boxShadow: '0 12px 20px rgba(26,115,232,0.3)' }
                      }} 
                      onClick={() => {
                        if (paymentMethod === 'UPI') handleRazorpayPayment();
                        else handleSubmitOrder();
                      }} 
                      disabled={loading || paying || checkingStock}
                    >
                      {paying ? <CircularProgress size={26} sx={{ color: '#fff' }} /> : 
                       paymentDone ? <CheckIcon sx={{ fontSize: 30 }} /> : 
                       paymentMethod === 'UPI' ? 'Pay Securely' : t.place_order}
                    </Button>
                    
                    {paymentMethod === 'UPI' && (
                        <Box sx={{ mt: 2.5, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                            <Box sx={{ width: 14, height: 14, borderRadius: '50%', bgcolor: colors.success, animation: 'pulse 1.5s infinite ease-in-out' }} />
                            <Typography variant="caption" sx={{ color: colors.muted, fontWeight: 700 }}>
                                SECURE 256-BIT ENCRYPTED PAYMENT
                            </Typography>
                        </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
            <Button startIcon={<BackIcon />} onClick={() => setActiveStep(2)} sx={{ mt: 3 }}>{t.back}</Button>
          </Box>
        );

      case 4:
        return (
          <Box sx={{ textAlign: 'center', py: 10 }}>
            <CheckIcon sx={{ fontSize: 80, color: colors.success, mb: 3 }} />
            <Typography variant="h4" fontWeight={700} gutterBottom>{t.order_success}</Typography>
            <Typography color="textSecondary" sx={{ mb: 4 }}>Your medicine order has been sent to the pharmacy for verification.</Typography>
            <Button variant="contained" size="large" onClick={() => navigate('/patient/orders')}>
              {t.view_status}
            </Button>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <PatientShell activeItem="pharmacies">
      <Box sx={{ px: { xs: 2, md: 5, xl: 6 }, py: 5, bgcolor: colors.bg, minHeight: '100vh' }}>
        <Box sx={{ maxWidth: 1000, mx: 'auto' }}>
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 4 }}>
            <Box sx={{ p: 1, borderRadius: 2, bgcolor: colors.primary, color: '#fff' }}>
              <CartIcon />
            </Box>
            <Typography variant="h4" fontWeight={700}>{t.title}</Typography>
          </Stack>

          {activeStep < 4 && (
            <Stepper activeStep={activeStep} sx={{ mb: 5 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          )}

          <Card sx={{ p: { xs: 2, md: 4, xl: 6 }, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
            {renderStepContent()}
          </Card>
        </Box>
      </Box>
    </PatientShell>
  );
}
