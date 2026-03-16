
import React from 'react';
import {
  Box,
  CssBaseline,
  AppBar,
  Toolbar,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Container,
  Grid,
  Paper,
  Button
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  ShoppingBag as OrderIcon,
  Inventory as InventoryIcon,
  Logout as LogoutIcon,
  Store as StoreIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const drawerWidth = 240;

function PharmacyDashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />

      {/* Top App Bar */}
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Seva TeleHealth - Pharmacy Dashboard
          </Typography>
          <Button color="inherit" startIcon={<LogoutIcon />} onClick={handleLogout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      {/* Sidebar Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <List>
            {['Dashboard', 'Orders', 'Inventory', 'Profile'].map((text, index) => (
              <ListItem button key={text}>
                <ListItemIcon>
                  {index === 0 && <DashboardIcon />}
                  {index === 1 && <OrderIcon />}
                  {index === 2 && <InventoryIcon />}
                  {index === 3 && <StoreIcon />}
                </ListItemIcon>
                <ListItemText primary={text} />
              </ListItem>
            ))}
          </List>
          <Divider />
        </Box>
      </Drawer>

      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>

          {/* Stats Cards */}
          <Grid container spacing={3} mb={4}>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
                <Typography component="h2" variant="h6" color="primary" gutterBottom>
                  New Orders
                </Typography>
                <Typography component="p" variant="h4">
                  12
                </Typography>
                <Typography color="text.secondary" sx={{ flex: 1 }}>
                  Pending Processing
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
                <Typography component="h2" variant="h6" color="primary" gutterBottom>
                  Out of Stock
                </Typography>
                <Typography component="p" variant="h4">
                  4
                </Typography>
                <Typography color="text.secondary" sx={{ flex: 1 }}>
                  Items to Reorder
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
                <Typography component="h2" variant="h6" color="primary" gutterBottom>
                  Total Sales
                </Typography>
                <Typography component="p" variant="h4">
                  $1,240
                </Typography>
                <Typography color="text.secondary" sx={{ flex: 1 }}>
                  Today's Revenue
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          {/* Recent Orders List */}
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                <Typography component="h2" variant="h6" color="primary" gutterBottom>
                  Recent Orders
                </Typography>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ textAlign: 'left', borderBottom: '1px solid #ddd' }}>
                      <th style={{ padding: '10px' }}>Order ID</th>
                      <th style={{ padding: '10px' }}>Patient Name</th>
                      <th style={{ padding: '10px' }}>Items</th>
                      <th style={{ padding: '10px' }}>Status</th>
                      <th style={{ padding: '10px' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '10px' }}>#ORD-001</td>
                      <td style={{ padding: '10px' }}>Amit Singh</td>
                      <td style={{ padding: '10px' }}>Paracetamol, Cough Syrup</td>
                      <td style={{ padding: '10px', color: 'orange' }}>Pending</td>
                      <td style={{ padding: '10px' }}>
                        <Button variant="outlined" size="small">View Details</Button>
                      </td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '10px' }}>#ORD-002</td>
                      <td style={{ padding: '10px' }}>Sita Devi</td>
                      <td style={{ padding: '10px' }}>Blood Pressure Monitor</td>
                      <td style={{ padding: '10px', color: 'green' }}>Completed</td>
                      <td style={{ padding: '10px' }}>
                        <Button variant="outlined" size="small">View Details</Button>
                      </td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '10px' }}>#ORD-003</td>
                      <td style={{ padding: '10px' }}>Rahul Verma</td>
                      <td style={{ padding: '10px' }}>Antibiotics</td>
                      <td style={{ padding: '10px', color: 'blue' }}>Shipped</td>
                      <td style={{ padding: '10px' }}>
                        <Button variant="outlined" size="small">View Details</Button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </Paper>
            </Grid>
          </Grid>

        </Container>
      </Box>
    </Box>
  );
}

export default PharmacyDashboard;