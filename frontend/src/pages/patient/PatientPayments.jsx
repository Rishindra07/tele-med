import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Card, CardContent, Table, TableBody, 
  TableCell, TableContainer, TableHead, TableRow, Paper, 
  Chip, CircularProgress, Stack, Button, IconButton, Alert,
  Grid, TextField, InputAdornment, Tabs, Tab, Dialog,
  DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { 
  Payments as PaymentIcon, 
  Download as DownloadIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  AccountBalanceWallet as WalletIcon,
  CheckCircle as SuccessIcon,
  History as HistoryIcon,
  Cancel as CancelIcon,
  ErrorOutline as WarningIcon
} from '@mui/icons-material';
import PatientShell from '../../components/patient/PatientShell';
import { fetchMyPayments, cancelPayment } from '../../api/patientApi';

const colors = {
  primary: '#1a73e8',
  primarySoft: '#e8f0fe',
  success: '#1e8e3e',
  successSoft: '#e6f4ea',
  warning: '#f9ab00',
  warningSoft: '#fef7e0',
  danger: '#d93025',
  dangerSoft: '#fce8e6',
  text: '#202124',
  muted: '#5f6368',
  bg: '#f8f9fa',
  line: '#e0e0e0'
};

export default function PatientPayments() {
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [tabValue, setTabValue] = useState(0); // 0: All, 1: Successful, 2: Pending, 3: Cancelled
  const [cancelId, setCancelId] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    loadPayments();
  }, []);

  useEffect(() => {
    filterAndSearch();
  }, [payments, search, tabValue]);

  const loadPayments = async () => {
    setLoading(true);
    try {
      const res = await fetchMyPayments();
      if (res.success) {
        setPayments(res.payments);
      }
    } catch (err) {
      setError("Failed to load payment history");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSearch = () => {
    let result = [...payments];

    // Filter by Tab
    if (tabValue === 1) result = result.filter(p => p.status === 'paid');
    if (tabValue === 2) result = result.filter(p => p.status === 'created');
    if (tabValue === 3) result = result.filter(p => p.status === 'cancelled' || p.status === 'failed');

    // Search
    if (search) {
      const s = search.toLowerCase();
      result = result.filter(p => 
        p.description?.toLowerCase().includes(s) || 
        p.razorpayOrderId?.toLowerCase().includes(s) ||
        p.type?.toLowerCase().includes(s)
      );
    }

    setFilteredPayments(result);
  };

  const handleCancelPayment = async () => {
    if (!cancelId) return;
    setCancelling(true);
    try {
      const res = await cancelPayment(cancelId);
      if (res.success) {
        setCancelId(null);
        loadPayments();
      }
    } catch (err) {
       console.error(err);
    } finally {
      setCancelling(false);
    }
  };

  const getStatusChip = (status) => {
    const s = (status || 'Pending').toLowerCase();
    let config = { label: status, bgcolor: '#eee', text: '#666' };
    
    if (s === 'paid') config = { label: 'SUCCESSFUL', bgcolor: colors.successSoft, text: colors.success };
    if (s === 'created' || s === 'pending') config = { label: 'PENDING', bgcolor: colors.warningSoft, text: colors.warning };
    if (s === 'failed') config = { label: 'FAILED', bgcolor: colors.dangerSoft, text: colors.danger };
    if (s === 'cancelled') config = { label: 'CANCELLED', bgcolor: '#f5f5f5', text: '#999' };
    
    return (
      <Chip 
        label={config.label} 
        size="small" 
        sx={{ 
          bgcolor: config.bgcolor, 
          color: config.text, 
          fontWeight: 700, 
          fontSize: 10,
          borderRadius: 1
        }} 
      />
    );
  };

  const stats = {
    total: payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0),
    count: payments.filter(p => p.status === 'paid').length,
    pending: payments.filter(p => p.status === 'created').length,
    cancelled: payments.filter(p => p.status === 'cancelled').length
  };

  return (
    <PatientShell activeItem="payments">
      <Box sx={{ p: { xs: 2, md: 4, xl: 6 }, bgcolor: colors.bg, minHeight: '100vh' }}>
        <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
          
          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="flex-start" sx={{ mb: 4 }} spacing={2}>
            <Box>
              <Typography variant="h4" fontWeight={800} sx={{ color: colors.text, letterSpacing: '-0.5px' }}>Payment History</Typography>
              <Typography variant="body1" sx={{ color: colors.muted, mt: 0.5 }}>Track all your health-related transactions and receipts</Typography>
            </Box>
            <Button 
                startIcon={<RefreshIcon />} 
                onClick={loadPayments}
                variant="white"
                sx={{ 
                  bgcolor: '#fff', 
                  color: colors.text, 
                  border: `1px solid ${colors.line}`,
                  borderRadius: 2, 
                  px: 3,
                  py: 1,
                  textTransform: 'none',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                  '&:hover': { bgcolor: '#f8f8f8' }
                }}
            >
                Refresh Data
            </Button>
          </Stack>

          {/* Stats Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ borderRadius: 3, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                <CardContent sx={{ display: 'flex', alignItems: 'center', p: 3 }}>
                  <Box sx={{ bgcolor: colors.primarySoft, p: 1.5, borderRadius: 2, mr: 2 }}>
                    <WalletIcon sx={{ color: colors.primary }} />
                  </Box>
                  <Box>
                    <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600 }}>TOTAL SPENT</Typography>
                    <Typography variant="h5" fontWeight={800} color={colors.text}>₹{stats.total.toLocaleString()}</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ borderRadius: 3, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                <CardContent sx={{ display: 'flex', alignItems: 'center', p: 3 }}>
                  <Box sx={{ bgcolor: colors.successSoft, p: 1.5, borderRadius: 2, mr: 2 }}>
                    <SuccessIcon sx={{ color: colors.success }} />
                  </Box>
                  <Box>
                    <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600 }}>SUCCESSFUL</Typography>
                    <Typography variant="h5" fontWeight={800} color={colors.text}>{stats.count}</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ borderRadius: 3, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                <CardContent sx={{ display: 'flex', alignItems: 'center', p: 3 }}>
                  <Box sx={{ bgcolor: colors.warningSoft, p: 1.5, borderRadius: 2, mr: 2 }}>
                    <HistoryIcon sx={{ color: colors.warning }} />
                  </Box>
                  <Box>
                    <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600 }}>PENDING</Typography>
                    <Typography variant="h5" fontWeight={800} color={colors.text}>{stats.pending}</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ borderRadius: 3, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                <CardContent sx={{ display: 'flex', alignItems: 'center', p: 3 }}>
                  <Box sx={{ bgcolor: colors.dangerSoft, p: 1.5, borderRadius: 2, mr: 2 }}>
                    <CancelIcon sx={{ color: colors.danger }} />
                  </Box>
                  <Box>
                    <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600 }}>CANCELLED</Typography>
                    <Typography variant="h5" fontWeight={800} color={colors.text}>{stats.cancelled}</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Filter Bar */}
          <Paper sx={{ mb: 3, borderRadius: 3, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}>
              <Tabs 
                value={tabValue} 
                onChange={(e, v) => setTabValue(v)}
                sx={{ 
                  '& .MuiTabs-indicator': { height: 3, borderRadius: '3px 3px 0 0' },
                  '& .MuiTab-root': { fontWeight: 700, p: 2, textTransform: 'none', fontSize: 14 }
                }}
              >
                <Tab label="All Transactions" />
                <Tab label="Successful" />
                <Tab label="Pending" />
                <Tab label="Cancelled" />
              </Tabs>
            </Box>
            <Box sx={{ p: 2 }}>
              <TextField
                fullWidth
                placeholder="Search by order ID, description, or type..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: colors.muted }} />
                    </InputAdornment>
                  ),
                  sx: { borderRadius: 2, bgcolor: colors.bg, border: 'none', '& fieldset': { border: 'none' } }
                }}
                size="small"
              />
            </Box>
          </Paper>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
              <CircularProgress thickness={5} size={50} sx={{ color: colors.primary }} />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>
          ) : filteredPayments.length === 0 ? (
            <Card sx={{ textAlign: 'center', py: 10, borderRadius: 3, border: '1px dashed #ccc', bgcolor: 'transparent' }}>
              <PaymentIcon sx={{ fontSize: 60, color: '#ccc', mb: 2 }} />
              <Typography variant="h6" fontWeight={700}>No transactions matches</Typography>
              <Typography color="textSecondary">Try adjusting your filters or search keywords.</Typography>
            </Card>
          ) : (
            <TableContainer component={Paper} elevation={0} sx={{ border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', borderRadius: 3, overflow: 'hidden' }}>
              <Table>
                <TableHead sx={{ bgcolor: '#fff', borderBottom: `2px solid ${colors.bg}` }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 800, color: colors.muted, fontSize: 12 }}>DATE</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: colors.muted, fontSize: 12 }}>TYPE</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: colors.muted, fontSize: 12 }}>DESCRIPTION</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: colors.muted, fontSize: 12 }}>AMOUNT</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: colors.muted, fontSize: 12 }}>STATUS</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: colors.muted, fontSize: 12, textAlign: 'right' }}>ACTIONS</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody sx={{ bgcolor: '#fff' }}>
                  {filteredPayments.map((p) => (
                    <TableRow key={p._id} hover sx={{ '&:last-child td': { border: 0 } }}>
                      <TableCell sx={{ fontSize: 14, fontWeight: 500 }}>
                        <Typography sx={{ fontSize: 14, fontWeight: 700 }}>
                          {new Date(p.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                        </Typography>
                        <Typography sx={{ fontSize: 12, color: colors.muted }}>
                          {new Date(p.date).getFullYear()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                            label={p.type} 
                            size="small" 
                            sx={{ 
                              fontSize: 10, 
                              fontWeight: 800, 
                              bgcolor: p.type === 'Consultation' ? '#f3e5f5' : '#e3f2fd',
                              color: p.type === 'Consultation' ? '#7b1fa2' : '#1976d2',
                              borderRadius: 1
                            }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography sx={{ fontSize: 14, fontWeight: 700, color: colors.text }}>{p.description}</Typography>
                        <Typography sx={{ fontSize: 11, color: colors.muted, fontFamily: 'monospace' }}>ID: {p.razorpayOrderId}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography sx={{ fontSize: 16, fontWeight: 900, color: colors.primary }}>₹{p.amount}</Typography>
                        <Typography sx={{ fontSize: 10, color: colors.muted, textTransform: 'uppercase' }}>{p.method}</Typography>
                      </TableCell>
                      <TableCell>
                        {getStatusChip(p.status)}
                      </TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          {p.status === 'created' && (
                            <Button 
                              size="small" 
                              color="error" 
                              onClick={() => setCancelId(p._id)}
                              sx={{ textTransform: 'none', fontWeight: 700 }}
                            >
                              Cancel
                            </Button>
                          )}
                          {p.status === 'paid' && (
                            <IconButton size="small" sx={{ color: colors.primary, bgcolor: colors.primarySoft }}>
                              <DownloadIcon fontSize="small" />
                            </IconButton>
                          )}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* Confirmation Dialog */}
          <Dialog open={!!cancelId} onClose={() => !cancelling && setCancelId(null)} PaperProps={{ sx: { borderRadius: 3 } }}>
            <DialogTitle sx={{ fontWeight: 800 }}>Cancel Payment?</DialogTitle>
            <DialogContent>
              <Typography color="textSecondary">
                Are you sure you want to cancel this pending payment? This action cannot be undone.
              </Typography>
            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
              <Button onClick={() => setCancelId(null)} disabled={cancelling} sx={{ textTransform: 'none', fontWeight: 700 }}>Ignore</Button>
              <Button 
                onClick={handleCancelPayment} 
                variant="contained" 
                color="error" 
                disabled={cancelling}
                sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700, px: 3 }}
              >
                {cancelling ? 'Cancelling...' : 'Confirm Cancel'}
              </Button>
            </DialogActions>
          </Dialog>

          {/* Security Footer */}
          <Box sx={{ mt: 5, p: 4, borderRadius: 4, bgcolor: '#1a202c', color: '#fff', position: 'relative', overflow: 'hidden' }}>
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                <WalletIcon sx={{ color: colors.warning, fontSize: 32 }} />
                <Typography variant="h6" fontWeight={800}>Secure Transactions</Typography>
              </Stack>
              <Typography variant="body2" sx={{ opacity: 0.8, maxWidth: 800, mb: 3 }}>
                All your payments are processed securely via Razorpay's enterprise-grade infrastructure. 
                Seva Telehealth does not store sensitive card information. Your data is protected with 
                industry-standard 256-bit SSL encryption.
              </Typography>
              <Stack direction="row" spacing={1}>
                {['PCI-DSS Compliant', 'SSL Secured', '24/7 Monitoring'].map(tag => (
                  <Chip key={tag} label={tag} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: '#fff', fontSize: 10, fontWeight: 700 }} />
                ))}
              </Stack>
            </Box>
            <PaymentIcon sx={{ position: 'absolute', right: -20, bottom: -20, fontSize: 180, color: 'rgba(255,255,255,0.03)' }} />
          </Box>
        </Box>
      </Box>
    </PatientShell>
  );
}
