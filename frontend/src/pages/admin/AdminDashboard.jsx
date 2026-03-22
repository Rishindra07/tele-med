import React, { useState } from 'react';
import {
  Box, AppBar, Toolbar, Typography, Drawer, List, ListItem, ListItemIcon, ListItemText, Divider, Container, Grid, Paper, Avatar, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Stack, Button, Chip, LinearProgress
} from '@mui/material';
import {
  SpaceDashboard as DashboardIcon, People as UsersIcon, Assessment as AnalyticsIcon, HealthAndSafety as HospitalIcon, LocalPharmacy as PharmacyIcon, Logout as LogoutIcon, Verified as VerifiedIcon, Security as SecurityIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import StatusBadge from '../../components/StatusBadge';

const drawerWidth = 260;

function AdminDashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const pendingApprovals = [
    { id: 'DR-892', name: 'Dr. Vivek Menon', role: 'Doctor', submitted: '2 days ago', status: 'Pending Verification' },
    { id: 'PH-114', name: 'Apollo Pharmacy', role: 'Pharmacy', submitted: 'Yesterday', status: 'Pending Verification' },
  ];

  const recentUsers = [
    { id: 'PT-990', name: 'Alia Bhatt', role: 'Patient', joined: 'Today', status: 'Active' },
    { id: 'DR-442', name: 'Dr. R. Sharma', role: 'Doctor', joined: 'Oct 12', status: 'Active' },
    { id: 'PT-881', name: 'Rahul Verma', role: 'Patient', joined: 'Oct 10', status: 'Active' },
  ];

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Toolbar sx={{ px: 2, py: 1, backgroundColor: '#334155', color: 'white' }}>
        <SecurityIcon sx={{ mr: 1 }} />
        <Typography variant="h6" noWrap fontWeight="bold">TeleMedi Admin</Typography>
      </Toolbar>
      <Divider />
      <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Avatar sx={{ bgcolor: '#475569', color: 'white', fontWeight: 'bold' }}>AD</Avatar>
        <Box>
          <Typography variant="subtitle2" fontWeight="bold">Super Admin</Typography>
          <Typography variant="caption" color="text.secondary">System Manager</Typography>
        </Box>
      </Box>
      <List sx={{ flexGrow: 1, px: 2 }}>
        <ListItem button selected sx={{ mb: 1, borderRadius: 2, bgcolor: 'rgba(15, 23, 42, 0.05)', color: '#0f172a' }}>
          <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}><DashboardIcon /></ListItemIcon>
          <ListItemText primary="System Overview" primaryTypographyProps={{ fontWeight: 600 }} />
        </ListItem>
        <ListItem button sx={{ mb: 1, borderRadius: 2 }}>
          <ListItemIcon sx={{ minWidth: 40 }}><UsersIcon /></ListItemIcon>
          <ListItemText primary="User Management" />
        </ListItem>
        <ListItem button sx={{ mb: 1, borderRadius: 2 }}>
          <ListItemIcon sx={{ minWidth: 40 }}><AnalyticsIcon /></ListItemIcon>
          <ListItemText primary="Reports & Analytics" />
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
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#F1F5F9' }}>
      <AppBar position="fixed" elevation={0} sx={{ width: { md: `calc(100% - ${drawerWidth}px)` }, ml: { md: `${drawerWidth}px` }, bgcolor: 'white', color: 'text.primary', borderBottom: '1px solid', borderColor: 'divider' }}>
        <Toolbar>
          <Typography variant="h6" noWrap sx={{ flexGrow: 1, fontWeight: 600 }}>Master Analytics</Typography>
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
          {/* Analytics Overview Cards */}
          <Grid container spacing={3} mb={4}>
            <Grid item xs={12} sm={6} lg={3}>
              <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', height: '100%', borderRadius: 3, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.02)' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" fontWeight="bold">Total Users</Typography>
                  <Avatar sx={{ bgcolor: 'rgba(37,99,235,0.1)', color: '#2563EB', width: 36, height: 36 }}><UsersIcon fontSize="small" /></Avatar>
                </Box>
                <Typography variant="h4" fontWeight="bold" my={1}>12,450</Typography>
                <Typography variant="body2" color="success.main" fontWeight="bold">+12% this month</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} lg={3}>
              <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', height: '100%', borderRadius: 3, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.02)' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" fontWeight="bold">Consultations</Typography>
                  <Avatar sx={{ bgcolor: 'rgba(34,197,94,0.1)', color: '#22C55E', width: 36, height: 36 }}><HospitalIcon fontSize="small" /></Avatar>
                </Box>
                <Typography variant="h4" fontWeight="bold" my={1}>4,201</Typography>
                <Typography variant="body2" color="success.main" fontWeight="bold">+8% this month</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} lg={3}>
              <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', height: '100%', borderRadius: 3, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.02)' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" fontWeight="bold">Rx Orders</Typography>
                  <Avatar sx={{ bgcolor: 'rgba(245,158,11,0.1)', color: '#F59E0B', width: 36, height: 36 }}><PharmacyIcon fontSize="small" /></Avatar>
                </Box>
                <Typography variant="h4" fontWeight="bold" my={1}>1,890</Typography>
                <Typography variant="body2" color="success.main" fontWeight="bold">+24% this month</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} lg={3}>
              <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', height: '100%', borderRadius: 3, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.02)' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" fontWeight="bold">Platform Uptime</Typography>
                  <Avatar sx={{ bgcolor: 'rgba(100,116,139,0.1)', color: '#64748B', width: 36, height: 36 }}><AnalyticsIcon fontSize="small" /></Avatar>
                </Box>
                <Typography variant="h4" fontWeight="bold" my={1}>99.9%</Typography>
                <LinearProgress variant="determinate" value={99.9} sx={{ mt: 1, height: 6, borderRadius: 3, bgcolor: 'rgba(0,0,0,0.05)', '& .MuiLinearProgress-bar': { bgcolor: 'success.main' } }} />
              </Paper>
            </Grid>
          </Grid>

          <Grid container spacing={3}>
            {/* Approvals Needed */}
            <Grid item xs={12} lg={6}>
              <Paper sx={{ p: 3, borderRadius: 3, height: '100%', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.02)' }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>Pending Approvals</Typography>
                <Typography variant="body2" color="text.secondary" mb={2}>Review medical licenses and pharmacy certifications.</Typography>
                <List sx={{ p: 0 }}>
                  {pendingApprovals.map((user, idx) => (
                    <Box key={user.id}>
                      <ListItem sx={{ px: 0, py: 2 }}>
                        <ListItemText 
                          primary={<Typography fontWeight="bold">{user.name}</Typography>}
                          secondary={<>{user.role} • Submitted {user.submitted}</>}
                        />
                        <Stack direction="row" spacing={1}>
                          <Button variant="outlined" color="error" size="small" sx={{ borderRadius: 6 }}>Reject</Button>
                          <Button variant="contained" color="primary" size="small" sx={{ borderRadius: 6 }}>Approve</Button>
                        </Stack>
                      </ListItem>
                      {idx < pendingApprovals.length - 1 && <Divider />}
                    </Box>
                  ))}
                </List>
                {pendingApprovals.length === 0 && <Typography color="text.secondary">All caught up!</Typography>}
              </Paper>
            </Grid>

            {/* Recent Users */}
            <Grid item xs={12} lg={6}>
              <Paper sx={{ p: 3, borderRadius: 3, height: '100%', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.02)' }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>Recent Users</Typography>
                <Typography variant="body2" color="text.secondary" mb={2}>Latest signups across the platform.</Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600, color: 'text.secondary', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>User</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: 'text.secondary', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>Role</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600, color: 'text.secondary', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {recentUsers.map((user) => (
                        <TableRow key={user.id} sx={{ '& td': { borderBottom: '1px solid rgba(0,0,0,0.05)' }, '&:last-child td': { borderBottom: 0 } }}>
                          <TableCell sx={{ py: 1.5 }}>
                            <Typography fontWeight="bold" variant="body2">{user.name}</Typography>
                            <Typography variant="caption" color="text.secondary">Joined {user.joined}</Typography>
                          </TableCell>
                          <TableCell><Chip label={user.role} size="small" sx={{ bgcolor: 'rgba(0,0,0,0.04)', fontWeight: 500 }} /></TableCell>
                          <TableCell align="right"><StatusBadge status="Ready" /></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
}

export default AdminDashboard;
