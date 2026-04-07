import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Card, CardContent, Table, TableBody, 
  TableCell, TableContainer, TableHead, TableRow, Paper, 
  Chip, CircularProgress, Stack, Button, IconButton, Alert
} from '@mui/material';
import { 
  Payments as PaymentIcon, 
  Download as DownloadIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import PatientShell from '../../components/patient/PatientShell';
import { fetchMyPayments } from '../../api/patientApi';

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
  bg: '#f8f9fa'
};

export default function PatientPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadPayments();
  }, []);

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

  const getStatusChip = (status) => {
    const s = (status || 'Pending').toLowerCase();
    let config = { label: status, color: 'default', bgcolor: '#eee', text: '#666' };
    
    if (s === 'paid') config = { label: 'SUCCESS', bgcolor: colors.successSoft, text: colors.success };
    if (s === 'pending') config = { label: 'PENDING', bgcolor: colors.warningSoft, text: colors.warning };
    if (s === 'failed') config = { label: 'FAILED', bgcolor: colors.dangerSoft, text: colors.danger };
    
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

  return (
    <PatientShell activeItem="payments">
      <Box sx={{ p: { xs: 2, md: 5 }, bgcolor: colors.bg, minHeight: '100vh' }}>
        <Box sx={{ maxWidth: 1100, mx: 'auto' }}>
          
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
            <Box>
              <Typography variant="h4" fontWeight={700} color={colors.text}>Payment History</Typography>
              <Typography variant="body1" color="textSecondary">View all your transactions for consultations and medicines</Typography>
            </Box>
            <Button 
                startIcon={<RefreshIcon />} 
                onClick={loadPayments}
                variant="outlined"
                sx={{ borderRadius: 2, textTransform: 'none' }}
            >
                Refresh
            </Button>
          </Stack>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error">{error}</Alert>
          ) : payments.length === 0 ? (
            <Card sx={{ textAlign: 'center', py: 10, borderRadius: 3 }}>
              <PaymentIcon sx={{ fontSize: 60, color: '#ccc', mb: 2 }} />
              <Typography variant="h6">No transactions found</Typography>
              <Typography color="textSecondary">Your payment history will appear here once you make a purchase.</Typography>
            </Card>
          ) : (
            <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #eee', borderRadius: 3, overflow: 'hidden' }}>
              <Table>
                <TableHead sx={{ bgcolor: '#fafafa' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>DATE</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>TYPE</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>DESCRIPTION</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>AMOUNT</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>METHOD</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>STATUS</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>RECEIPT</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {payments.map((p) => (
                    <TableRow key={p.id} hover>
                      <TableCell sx={{ fontSize: 13 }}>
                        {new Date(p.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </TableCell>
                      <TableCell>
                        <Chip 
                            label={p.type} 
                            size="small" 
                            variant="outlined" 
                            sx={{ fontSize: 11, fontWeight: 500 }}
                        />
                      </TableCell>
                      <TableCell sx={{ fontWeight: 500 }}>{p.description}</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>₹{p.amount}</TableCell>
                      <TableCell sx={{ textTransform: 'uppercase', fontSize: 12, fontWeight: 600, color: colors.muted }}>
                        {p.method}
                      </TableCell>
                      <TableCell>
                        {getStatusChip(p.status)}
                      </TableCell>
                      <TableCell>
                        <IconButton size="small" color="primary">
                          <DownloadIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          <Box sx={{ mt: 4, bgcolor: '#fff', p: 3, borderRadius: 3, border: '1px solid #eee' }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>Payment Security</Typography>
            <Typography variant="body2" color="textSecondary">
              All transactions are secured with 256-bit encryption. We do not store your full card details. 
              Payments are processed through Razorpay's PCI-DSS compliant infrastructure.
            </Typography>
          </Box>
        </Box>
      </Box>
    </PatientShell>
  );
}
