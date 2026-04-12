import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  TextField, Stack, Box, Typography, IconButton, Grid,
  Autocomplete, Divider, Chip, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, InputAdornment,
  CircularProgress
} from '@mui/material';
import {
  CloseRounded as CloseIcon,
  AddRounded as AddIcon,
  DeleteOutlineRounded as DeleteIcon,
  ReceiptLongRounded as BillIcon,
  ShoppingCartOutlined as CartIcon,
  PersonOutlineRounded as UserIcon
} from '@mui/icons-material';
import { searchPatients, createBill, fetchInventory } from '../../api/pharmacyApi';

const colors = {
  paper: '#ffffff',
  bg: '#f8f9fa',
  line: '#e1e3e1',
  soft: '#f1f3f4',
  text: '#202124',
  muted: '#5f6368',
  primary: '#1a73e8',
  primarySoft: '#e8f0fe',
  primaryDark: '#174ea6',
  success: '#1e8e3e',
  warning: '#f9ab00',
  red: '#d93025'
};

export default function NewBillModal({ open, onClose, onSuccess }) {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientSearch, setPatientSearch] = useState('');
  const [loadingPatients, setLoadingPatients] = useState(false);

  const [inventory, setInventory] = useState([]);
  const [selectedMed, setSelectedMed] = useState(null);
  const [loadingInventory, setLoadingInventory] = useState(false);

  const [cart, setCart] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [submitting, setSubmitting] = useState(false);

  // Search Patients
  useEffect(() => {
    if (patientSearch.length < 3) return;
    const delay = setTimeout(async () => {
      setLoadingPatients(true);
      try {
        const res = await searchPatients(patientSearch);
        setPatients(res.data.patients || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingPatients(false);
      }
    }, 500);
    return () => clearTimeout(delay);
  }, [patientSearch]);

  // Load Inventory for dropdown
  useEffect(() => {
    if (open) {
      const loadInv = async () => {
        setLoadingInventory(true);
        try {
          const res = await fetchInventory();
          setInventory(res.data.inventory || []);
        } catch (err) {
          console.error(err);
        } finally {
          setLoadingInventory(false);
        }
      };
      loadInv();
    }
  }, [open]);

  const addToCart = () => {
    if (!selectedMed) return;
    const existing = cart.find(i => i.stockId === selectedMed._id);
    if (existing) {
      setCart(cart.map(i => i.stockId === selectedMed._id ? { ...i, quantity: i.quantity + 1 } : i));
    } else {
      setCart([...cart, {
        stockId: selectedMed._id,
        name: selectedMed.medicineName,
        mrp: selectedMed.mrp,
        quantity: 1,
        isJanAushadhi: selectedMed.category?.toLowerCase().includes('jan aushadhi'),
        maxQty: selectedMed.quantity
      }]);
    }
    setSelectedMed(null);
  };

  const removeFromCart = (id) => setCart(cart.filter(i => i.stockId !== id));

  const updateQty = (id, newQty) => {
    const qty = Math.max(1, parseInt(newQty) || 1);
    setCart(cart.map(i => i.stockId === id ? { ...i, quantity: Math.min(i.maxQty, qty) } : i));
  };

  const calculateTotals = () => {
    let taxable = 0;
    let exempt = 0;
    cart.forEach(item => {
      if (item.isJanAushadhi) exempt += item.mrp * item.quantity;
      else taxable += item.mrp * item.quantity;
    });
    const gst = Math.round(taxable * 0.12 * 100) / 100;
    return { taxable, exempt, gst, total: Math.round(taxable + exempt + gst) };
  };

  const totals = calculateTotals();

  const handleSave = async () => {
    if (!cart.length) return;
    setSubmitting(true);
    try {
      await createBill({
        patientId: selectedPatient?._id,
        items: cart,
        paymentMethod,
        billType: selectedPatient ? 'Prescription' : 'Walk-in'
      });
      onSuccess();
      onClose();
      setCart([]);
      setSelectedPatient(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create bill');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md" PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <BillIcon sx={{ color: colors.primary }} />
          <Typography sx={{ fontSize: 20, fontWeight: 700, fontFamily: 'Inter, sans-serif' }}>Create New Bill</Typography>
        </Stack>
        <IconButton onClick={onClose} size="small"><CloseIcon /></IconButton>
      </DialogTitle>

      <DialogContent sx={{ px: 3, pb: 4 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={5}>
            <Stack spacing={3}>
              <Box>
                <Typography sx={{ fontSize: 13, color: colors.muted, mb: 1, fontWeight: 700, letterSpacing: 0.5 }}>1. CUSTOMER ASSOCIATION</Typography>
                <Autocomplete
                  options={patients}
                  getOptionLabel={(option) => `${option.full_name} (${option.phone})`}
                  onInputChange={(e, val) => setPatientSearch(val)}
                  onChange={(e, val) => setSelectedPatient(val)}
                  loading={loadingPatients}
                  renderInput={(params) => (
                    <TextField 
                      {...params} 
                      placeholder="Search patient by name or phone" 
                      size="small"
                      InputProps={{
                        ...params.InputProps,
                        sx: { borderRadius: 2 },
                        startAdornment: (
                          <InputAdornment position="start">
                            <UserIcon sx={{ color: colors.muted, fontSize: 18 }} />
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                  renderOption={(props, option) => (
                    <li {...props}>
                      <Box>
                        <Typography sx={{ fontSize: 14 }}>{option.full_name}</Typography>
                        <Typography sx={{ fontSize: 12, color: colors.muted }}>{option.phone}</Typography>
                      </Box>
                    </li>
                  )}
                />
              </Box>

              <Box>
                <Typography sx={{ fontSize: 13, color: colors.muted, mb: 1, fontWeight: 700, letterSpacing: 0.5 }}>2. PAYMENT MODE</Typography>
                <Stack direction="row" spacing={1}>
                  {['UPI', 'Cash', 'Credit', 'Card'].map(m => (
                    <Chip 
                      key={m} label={m} clickable 
                      onClick={() => setPaymentMethod(m)}
                      sx={{ 
                        borderRadius: 1.5,
                        bgcolor: paymentMethod === m ? colors.primary : colors.soft,
                        color: paymentMethod === m ? '#fff' : colors.text,
                        fontWeight: 700
                      }} 
                    />
                  ))}
                </Stack>
              </Box>

              <Box sx={{ p: 2, borderRadius: 2, bgcolor: colors.soft }}>
                <Typography sx={{ fontSize: 14, mb: 2, fontWeight: 700 }}>Summary</Typography>
                <Stack spacing={1}>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography sx={{ fontSize: 13, color: colors.muted }}>Subtotal</Typography>
                    <Typography sx={{ fontSize: 13 }}>₹{(totals.taxable + totals.exempt).toLocaleString()}</Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography sx={{ fontSize: 13, color: colors.muted }}>Tax (GST)</Typography>
                    <Typography sx={{ fontSize: 13 }}>₹{totals.gst.toLocaleString()}</Typography>
                  </Stack>
                  <Divider sx={{ my: 1 }} />
                  <Stack direction="row" justifyContent="space-between">
                    <Typography sx={{ fontSize: 15, fontWeight: 700 }}>Payable</Typography>
                    <Typography sx={{ fontSize: 18, color: colors.primary, fontWeight: 800 }}>₹{totals.total.toLocaleString()}</Typography>
                  </Stack>
                </Stack>
              </Box>
            </Stack>
          </Grid>

          <Grid item xs={12} md={7}>
            <Typography sx={{ fontSize: 13, color: colors.muted, mb: 1, fontWeight: 700, letterSpacing: 0.5 }}>3. SCAN OR ADD MEDICINES</Typography>
            <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
              <Autocomplete
                fullWidth
                options={inventory}
                getOptionLabel={(option) => option.medicineName}
                onChange={(e, val) => setSelectedMed(val)}
                value={selectedMed}
                renderInput={(params) => <TextField {...params} placeholder="Select medicine..." size="small" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />}
                renderOption={(props, option) => (
                  <li {...props}>
                    <Box sx={{ width: '100%' }}>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography sx={{ fontSize: 14 }}>{option.medicineName}</Typography>
                        <Typography sx={{ fontSize: 13, fontWeight: 600 }}>₹{option.mrp}</Typography>
                      </Stack>
                      <Typography sx={{ fontSize: 11, color: option.quantity < 10 ? 'error.main' : colors.muted }}>
                        Available: {option.quantity} items
                      </Typography>
                    </Box>
                  </li>
                )}
              />
              <Button 
                variant="contained" onClick={addToCart} disabled={!selectedMed}
                sx={{ bgcolor: colors.primary, '&:hover': { bgcolor: colors.primaryDark }, minWidth: 42, px: 0, borderRadius: 2 }}
              >
                <AddIcon />
              </Button>
            </Stack>

            <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${colors.line}`, borderRadius: 2, maxHeight: 350 }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontSize: 12 }}>Items ({cart.length})</TableCell>
                    <TableCell sx={{ fontSize: 12 }}>Qty</TableCell>
                    <TableCell sx={{ fontSize: 12 }}>Price</TableCell>
                    <TableCell sx={{ fontSize: 12 }}>Total</TableCell>
                    <TableCell sx={{ width: 40 }}></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {cart.map(item => (
                    <TableRow key={item.stockId}>
                      <TableCell sx={{ fontSize: 13 }}>{item.name}</TableCell>
                      <TableCell>
                        <TextField 
                          type="number" value={item.quantity} 
                          onChange={(e) => updateQty(item.stockId, e.target.value)}
                          variant="standard" 
                          InputProps={{ disableUnderline: true, sx: { fontSize: 13, width: 40 } }}
                        />
                      </TableCell>
                      <TableCell sx={{ fontSize: 13 }}>₹{item.mrp}</TableCell>
                      <TableCell sx={{ fontSize: 13, fontWeight: 600 }}>₹{item.mrp * item.quantity}</TableCell>
                      <TableCell>
                        <IconButton size="small" onClick={() => removeFromCart(item.stockId)}><DeleteIcon sx={{ fontSize: 18 }} /></IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                  {!cart.length && (
                    <TableRow>
                      <TableCell colSpan={5} sx={{ height: 100, textAlign: 'center' }}>
                         <Typography sx={{ color: colors.muted, fontSize: 13 }}>No items added.</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 3, borderTop: `1px solid ${colors.line}` }}>
        <Button onClick={onClose} sx={{ color: '#666', textTransform: 'none' }}>Cancel</Button>
        <Button 
          variant="contained" onClick={handleSave} disabled={!cart.length || submitting}
          sx={{ bgcolor: colors.primary, '&:hover': { bgcolor: colors.primaryDark }, px: 4, textTransform: 'none', borderRadius: 2, fontWeight: 700 }}
        >
          {submitting ? 'Creating...' : 'Confirm Bill'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
