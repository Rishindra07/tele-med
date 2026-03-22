import React, { useState } from 'react';
import {
  Box, AppBar, Toolbar, Typography, Drawer, List, ListItem, ListItemIcon, ListItemText, Divider, Container, Grid, Paper, Button, Avatar, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Stack, IconButton
} from '@mui/material';
import {
  Dashboard as DashboardIcon, ShoppingBag as OrderIcon, Inventory as InventoryIcon, Logout as LogoutIcon, Store as StoreIcon, CheckCircle as CheckIcon, Pending as PendingIcon, Error as ErrorIcon, LocalShipping as ShippingIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import StatusBadge from '../../components/StatusBadge';

const drawerWidth = 260;

function PharmacyDashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const orders = [
    { id: '#ORD-001', patient: 'Amit Singh', items: 'Paracetamol 500mg, Cough Syrup', status: 'Pending', time: '10:30 AM' },
    { id: '#ORD-002', patient: 'Rahul Verma', items: 'Azithromycin 500mg (5 days)', status: 'Ready', time: '11:15 AM' },
    { id: '#ORD-003', patient: 'Sita Devi', items: 'BP Monitor, Aspirin', status: 'Partial', time: '09:00 AM' },
    { id: '#ORD-004', patient: 'John Doe', items: 'Insulin Glargine', status: 'Out of Stock', time: 'Yesterday' },
  ];

  const inventory = [
    { item: 'Paracetamol 500mg', stock: 450, status: 'In Stock' },
    { item: 'Azithromycin 500mg', stock: 12, status: 'Low Stock' },
    { item: 'Insulin Glargine', stock: 0, status: 'Out of Stock' },
  ];

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Toolbar sx={{ px: 2, py: 1, backgroundColor: '#0ea5e9', color: 'white' }}>
        <StoreIcon sx={{ mr: 1 }} />
        <Typography variant="h6" noWrap fontWeight="bold">TeleMedi Rx</Typography>
      </Toolbar>
      <Divider />
      <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Avatar sx={{ bgcolor: '#e0f2fe', color: '#0284c7', fontWeight: 'bold' }}>PH</Avatar>
        <Box>
          <Typography variant="subtitle2" fontWeight="bold">City Pharmacy</Typography>
          <Typography variant="caption" color="text.secondary">Main Branch</Typography>
        </Box>
      </Box>
      <List sx={{ flexGrow: 1, px: 2 }}>
        <ListItem button selected sx={{ mb: 1, borderRadius: 2, bgcolor: 'rgba(14, 165, 233, 0.1)', color: '#0284c7' }}>
          <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}><OrderIcon /></ListItemIcon>
          <ListItemText primary="Prescriptions & Orders" primaryTypographyProps={{ fontWeight: 600 }} />
        </ListItem>
        <ListItem button sx={{ mb: 1, borderRadius: 2 }}>
          <ListItemIcon sx={{ minWidth: 40 }}><InventoryIcon /></ListItemIcon>
          <ListItemText primary="Inventory" />
        </ListItem>
      </List>
      <Divider />
      <List sx={{ px: 2, pb: 2 }}>
        <ListItem button onClick={handleLogout} sx={{ borderRadius: 2, color: 'error.main' }}>
          <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}><LogoutIcon /></ListItemIcon>
          <ListItemText primary="Logout" primaryTypographyProps={{ fontWeight: 600 }} />
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="fixed" elevation={0} sx={{ width: { md: `calc(100% - ${drawerWidth}px)` }, ml: { md: `${drawerWidth}px` }, bgcolor: 'white', color: 'text.primary', borderBottom: '1px solid', borderColor: 'divider' }}>
        <Toolbar>
          <Typography variant="h6" noWrap sx={{ flexGrow: 1, fontWeight: 600 }}>Order Management</Typography>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
        <Drawer variant="permanent" sx={{ display: { xs: 'none', md: 'block' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, borderRight: '1px solid rgba(0,0,0,0.08)' } }} open>
          {drawer}
        </Drawer>
      </Box>

      <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, sm: 3 }, width: { md: `calc(100% - ${drawerWidth}px)` } }}>
        <Toolbar />
        <Container maxWidth="xl" sx={{ mt: 2, mb: 4 }}>
          {/* Stats Cards */}
          <Grid container spacing={3} mb={4}>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', height: '100%', borderLeft: '4px solid', borderColor: 'primary.main', borderRadius: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" textTransform="uppercase" fontWeight="bold">New Prescriptions</Typography>
                <Typography variant="h3" fontWeight="bold" color="primary.main" my={1}>12</Typography>
                <Typography variant="body2" color="text.secondary">Pending Processing</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', height: '100%', borderLeft: '4px solid', borderColor: 'error.main', borderRadius: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" textTransform="uppercase" fontWeight="bold">Out of Stock Alerts</Typography>
                <Typography variant="h3" fontWeight="bold" color="error.main" my={1}>4</Typography>
                <Typography variant="body2" color="text.secondary">Items need immediate reorder</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', height: '100%', borderLeft: '4px solid', borderColor: 'success.main', borderRadius: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" textTransform="uppercase" fontWeight="bold">Orders Ready</Typography>
                <Typography variant="h3" fontWeight="bold" color="success.main" my={1}>8</Typography>
                <Typography variant="body2" color="text.secondary">Awaiting pickup/delivery</Typography>
              </Paper>
            </Grid>
          </Grid>

          <Grid container spacing={3}>
            {/* Incoming Prescriptions List */}
            <Grid item xs={12} lg={8}>
              <Paper sx={{ p: 3, borderRadius: 3, height: '100%' }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>Incoming Prescriptions</Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: 'rgba(0,0,0,0.02)' }}>
                        <TableCell sx={{ fontWeight: 600 }}>Order ID</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Patient</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Items</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {orders.map((order) => (
                        <TableRow key={order.id} hover>
                          <TableCell sx={{ fontWeight: 500 }}>{order.id}<br/><Typography variant="caption" color="text.secondary">{order.time}</Typography></TableCell>
                          <TableCell>{order.patient}</TableCell>
                          <TableCell sx={{ maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{order.items}</TableCell>
                          <TableCell><StatusBadge status={order.status} /></TableCell>
                          <TableCell>
                            <Button variant="outlined" size="small" sx={{ borderRadius: 6 }}>Fulfill</Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Grid>

            {/* Inventory Tracker Summary */}
            <Grid item xs={12} lg={4}>
              <Paper sx={{ p: 3, borderRadius: 3, height: '100%' }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>Inventory Highlights</Typography>
                <Stack spacing={2} mt={2}>
                  {inventory.map((item, idx) => (
                    <Box key={idx} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography fontWeight="bold">{item.item}</Typography>
                        <Typography variant="body2" color="text.secondary">Stock: {item.stock} units</Typography>
                      </Box>
                      <Chip 
                        label={item.status} 
                        size="small" 
                        color={item.status === 'In Stock' ? 'success' : item.status === 'Low Stock' ? 'warning' : 'error'} 
                      />
                    </Box>
                  ))}
                </Stack>
                <Button fullWidth variant="text" sx={{ mt: 3 }}>View Full Inventory</Button>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
}

export default PharmacyDashboard;