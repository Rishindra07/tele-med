import React, { useEffect, useState } from 'react';
import { Box, Typography, Grid, Avatar, IconButton, Stack, Link, Popover, Button, Divider } from '@mui/material';
import { Search as SearchIcon, NotificationsNone as NotificationsIcon, MailOutline as MailIcon, Menu as MenuIcon, Phone as PhoneIcon, Description as DocIcon, ChatBubbleOutline as ChatIcon, Check as CheckIcon, Close as CloseIcon, MoreHoriz as MoreIcon, FileDownloadOutlined as FileDownloadIcon } from '@mui/icons-material';
import DoctorLayout from '../../components/DoctorLayout';
import './dashboard.css';

const SummaryCard = ({ icon, title, value, subtext, iconColorClass }) => (
  <Box className="premium-card summary-card">
    <Box className={`summary-icon-wrapper ${iconColorClass}`}>
      {icon}
    </Box>
    <Box>
      <Typography variant="body2" color="text.secondary" fontWeight="500">{title}</Typography>
      <Typography variant="h4" fontWeight="bold" sx={{ my: 0.5 }}>{value}</Typography>
      <Typography variant="caption" color="text.secondary">{subtext}</Typography>
    </Box>
  </Box>
);

const PieChart = () => (
  <Box sx={{ position: 'relative', width: 200, height: 200, margin: '0 auto' }}>
    <svg viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)' }}>
      {/* Background/Total */}
      <circle cx="18" cy="18" r="15.915" fill="none" stroke="#E2E8F0" strokeWidth="3" />
      {/* Total Patients - Dark Blue */}
      <circle cx="18" cy="18" r="15.915" fill="none" stroke="#2563EB" strokeWidth="3" strokeDasharray="100 0" />
      {/* Old Patients - Yellow */}
      <circle cx="18" cy="18" r="15.915" fill="none" stroke="#F59E0B" strokeWidth="3" strokeDasharray="60 40" strokeDashoffset="-25" />
      {/* New Patients - Teal */}
      <circle cx="18" cy="18" r="15.915" fill="none" stroke="#0D9488" strokeWidth="3" strokeDasharray="25 75" strokeDashoffset="0" />
    </svg>
    <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
      <Typography variant="h5" fontWeight="bold">2k+</Typography>
      <Typography variant="caption" color="text.secondary">Patients</Typography>
    </Box>
  </Box>
);

function DoctorDashboard() {
  const [slotDate, setSlotDate] = useState('');
  const [notifAnchor, setNotifAnchor] = useState(null);
  const handleNotifClick = (e) => setNotifAnchor(e.currentTarget);
  const handleNotifClose = () => setNotifAnchor(null);
  const notifOpen = Boolean(notifAnchor);
  
  const todayAppointments = [
    { name: 'M.J. Mical', diag: 'Health Cheakup', time: 'On Going', status: 'ongoing' },
    { name: 'Sanath Deo', diag: 'Health Cheakup', time: '12:30 PM', status: 'time' },
    { name: 'Loeara Phanj', diag: 'Report', time: '01:00 PM', status: 'time' },
    { name: 'Komola Haris', diag: 'Common Cold', time: '01:30 PM', status: 'time' }
  ];

  const appointmentRequests = [
    { name: 'Maria Sarafat', problem: 'Cold' },
    { name: 'Jhon Deo', problem: 'Over swtting' }
  ];

  return (
    <DoctorLayout title="Doctor Dashboard">
      <Box className="dashboard-container" sx={{ pt: { xs: 1, md: 2 } }}>
        {/* Header Section - Modern replacement for Sidebar's Toolbar Title if needed */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mb: 3, gap: 1 }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton 
                size="small" 
                onClick={handleNotifClick}
                sx={{ bgcolor: 'white', border: '1px solid #E2E8F0', ...(notifOpen && { bgcolor: '#F8FAFC' }) }}
              >
                <NotificationsIcon sx={{ color: '#64748B', fontSize: 20 }} />
              </IconButton>
            </Box>
            <Box className="search-bar" sx={{ bgcolor: 'white', border: '1px solid #E2E8F0' }}>
              <SearchIcon sx={{ color: '#94A3B8', fontSize: 20 }} />
              <input type="text" placeholder="Search" />
            </Box>
            <IconButton size="small" sx={{ bgcolor: 'white', border: '1px solid #E2E8F0' }}><MenuIcon sx={{ color: '#1E293B', fontSize: 20 }} /></IconButton>
        </Box>

        <Popover
          open={notifOpen}
          anchorEl={notifAnchor}
          onClose={handleNotifClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          slotProps={{ paper: { sx: { width: 420, borderRadius: 3, mt: 1, boxShadow: '0 10px 40px -10px rgba(0,0,0,0.1)' } } }}
        >
          <Box sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography fontWeight="800" fontSize="1.1rem" color="#0F172A">Notifications</Typography>
              <IconButton size="small" onClick={handleNotifClose}><CloseIcon fontSize="small" sx={{ color: '#94A3B8' }} /></IconButton>
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Typography fontSize="0.75rem" fontWeight="700" color="#0F172A" sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                  View All <Box sx={{ bgcolor: '#0F172A', color: 'white', px: 0.8, py: 0.2, borderRadius: 1.5, fontSize: '0.65rem' }}>8</Box>
                </Typography>
                {['Mentions', 'Invites', 'Feed', 'Files'].map(txt => (
                  <Typography key={txt} fontSize="0.75rem" color="text.secondary" sx={{ cursor: 'pointer', '&:hover': { color: '#0F172A' } }}>{txt}</Typography>
                ))}
              </Stack>
              <Typography fontSize="0.75rem" color="#2563EB" fontWeight="500" sx={{ cursor: 'pointer' }}>Mark all read</Typography>
            </Box>
            
            <Divider sx={{ mb: 2 }} />
            
            <Stack spacing={2.5} sx={{ maxHeight: 420, overflowY: 'auto', p: 0.5, '&::-webkit-scrollbar': { width: 4 }, '&::-webkit-scrollbar-thumb': { bgcolor: '#CBD5E1', borderRadius: 4 } }}>
              {/* 1. Dora */}
              <Box sx={{ display: 'flex', gap: 1.5 }}>
                <Avatar src="https://i.pravatar.cc/150?u=dora" sx={{ width: 36, height: 36 }} />
                <Box flex={1}>
                  <Typography fontSize="0.82rem" color="#0F172A">
                    <Box component="span" fontWeight="700">Dora Pesh</Box> published a project <b>"AI Tools in Design"</b>
                  </Typography>
                  <Typography fontSize="0.68rem" color="text.secondary" sx={{ mt: 0.5 }}>12 Minutes ago | Working Space</Typography>
                </Box>
              </Box>
              
              {/* 2. Alex */}
              <Box sx={{ display: 'flex', gap: 1.5 }}>
                <Avatar src="https://i.pravatar.cc/150?u=alex" sx={{ width: 36, height: 36 }} />
                <Box flex={1}>
                  <Typography fontSize="0.82rem" color="#0F172A">
                    <Box component="span" fontWeight="700">Alex Green</Box> attached multiple Photos
                  </Typography>
                  <Typography fontSize="0.68rem" color="text.secondary" sx={{ mt: 0.5 }}>2 hour ago | Project references</Typography>
                </Box>
              </Box>
              
              {/* 3. Max */}
              <Box sx={{ display: 'flex', gap: 1.5 }}>
                <Avatar src="https://i.pravatar.cc/150?u=max" sx={{ width: 36, height: 36 }} />
                <Box flex={1}>
                  <Typography fontSize="0.82rem" color="#0F172A">
                    <Box component="span" fontWeight="700">Max Lile</Box> attached Files
                  </Typography>
                  <Typography fontSize="0.68rem" color="text.secondary" sx={{ mt: 0.5 }}>5 hour ago | Project references</Typography>
                </Box>
              </Box>
              
              {/* 4. file doc */}
              <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', bgcolor: '#F8FAFC', p: 1.5, borderRadius: 3 }}>
                <Box sx={{ width: 40, height: 40, bgcolor: '#3B82F6', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 5px rgba(59, 130, 246, 0.3)' }}>
                  <DocIcon sx={{ color: 'white', fontSize: 22 }} />
                </Box>
                <Box flex={1}>
                  <Typography fontSize="0.82rem" fontWeight="700" color="#0F172A">heropage.pdf</Typography>
                  <Typography fontSize="0.68rem" color="text.secondary">12mb</Typography>
                </Box>
                <IconButton size="small"><FileDownloadIcon fontSize="small" sx={{ color: '#94A3B8' }}/></IconButton>
              </Box>
              
              {/* 5. file img */}
              <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', bgcolor: '#F8FAFC', p: 1.5, borderRadius: 3 }}>
                <Box sx={{ width: 40, height: 40, bgcolor: '#60A5FA', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 5px rgba(96, 165, 250, 0.3)' }}>
                  <DocIcon sx={{ color: 'white', fontSize: 22 }} />
                </Box>
                <Box flex={1}>
                  <Typography fontSize="0.82rem" fontWeight="700" color="#0F172A">illustration.png</Typography>
                  <Typography fontSize="0.68rem" color="text.secondary">20mb</Typography>
                </Box>
                <IconButton size="small"><FileDownloadIcon fontSize="small" sx={{ color: '#94A3B8' }}/></IconButton>
              </Box>
              
              {/* 6. Invite */}
              <Box sx={{ display: 'flex', gap: 1.5 }}>
                <Avatar src="https://i.pravatar.cc/150?u=sofie" sx={{ width: 36, height: 36 }} />
                <Box flex={1}>
                  <Typography fontSize="0.82rem" color="#0F172A">
                    <Box component="span" fontWeight="700">Sofie Cooper</Box> send a Project Invitation
                  </Typography>
                  <Typography fontSize="0.68rem" color="text.secondary" sx={{ mt: 0.5 }}>7 hour ago | AI Chat Project</Typography>
                  <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
                    <Button variant="contained" size="small" sx={{ textTransform: 'none', borderRadius: 5, fontSize: '0.75rem', px: 2.5, boxShadow: 'none' }}>Accept</Button>
                    <Button variant="outlined" size="small" sx={{ textTransform: 'none', borderRadius: 5, fontSize: '0.75rem', px: 2.5, borderColor: '#CBD5E1', color: '#64748B', '&:hover': { borderColor: '#94A3B8', bgcolor: 'transparent' } }}>Decline</Button>
                  </Stack>
                </Box>
              </Box>
              
              {/* 7. Message */}
              <Box sx={{ display: 'flex', gap: 1.5 }}>
                <Avatar sx={{ width: 36, height: 36, bgcolor: '#94A3B8', color: 'white', fontSize: '0.85rem' }}>JO</Avatar>
                <Box flex={1}>
                  <Typography fontSize="0.82rem" color="#0F172A">
                    <Box component="span" fontWeight="700">John Owner</Box> sent a massage in a channel <b>AI Tools in Design</b>: "Hello, friends! I need help!..."
                  </Typography>
                  <Typography fontSize="0.68rem" color="text.secondary" sx={{ mt: 0.5 }}>1 day ago | Working Space</Typography>
                </Box>
              </Box>
            </Stack>
            
            <Box sx={{ mt: 2, pt: 1.5 }}>
              <Typography fontSize="0.82rem" color="text.secondary" sx={{ cursor: 'pointer', textAlign: 'left', '&:hover': { color: '#0F172A' } }}>See all notifications</Typography>
            </Box>
          </Box>
        </Popover>

        {/* Top Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <SummaryCard title="Total Patient" value="2000+" subtext="Till Today" icon={<PhoneIcon />} />
          </Grid>
          <Grid item xs={12} md={4}>
            <SummaryCard title="Today Patient" value="068" subtext="21 Dec-2021" icon={<PhoneIcon />} iconColorClass="cyan" />
          </Grid>
          <Grid item xs={12} md={4}>
            <SummaryCard title="Today Appointments" value="085" subtext="21 Dec-2021" icon={<PhoneIcon />} iconColorClass="indigo" />
          </Grid>
        </Grid>

        <Box sx={{ display: 'flex', gap: 5, mb: 4, flexWrap: { xs: 'wrap', lg: 'nowrap' }, alignItems: 'stretch' }}>
          {/* Appointment Request Section (Moved from Bottom) */}
          <Box sx={{ flex: { xs: '1 1 100%', lg: '1' }, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
            <Box className="premium-card">
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="body2" fontWeight="600">Appointment Requast</Typography>
                <Link href="#" sx={{ textDecoration: 'none', fontSize: '0.875rem' }}>See All</Link>
              </Box>
              <Stack spacing={2}>
                {appointmentRequests.map((req, idx) => (
                  <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ width: 40, height: 40 }} />
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="body2" fontWeight="bold">{req.name}</Typography>
                      <Typography variant="caption" color="text.secondary" display="block">{req.problem}</Typography>
                    </Box>
                    <Stack direction="row" spacing={0.5}>
                      <IconButton size="small" sx={{ bgcolor: '#D1FAE5', color: '#10B981', '&:hover': { bgcolor: '#A7F3D0' } }}><CheckIcon sx={{ fontSize: 16 }} /></IconButton>
                      <IconButton size="small" sx={{ bgcolor: '#FEE2E2', color: '#EF4444', '&:hover': { bgcolor: '#FECACA' } }}><CloseIcon sx={{ fontSize: 16 }} /></IconButton>
                      <IconButton size="small" sx={{ bgcolor: '#CCFBF1', color: '#0D9488', '&:hover': { bgcolor: '#99F6E4' } }}><ChatIcon sx={{ fontSize: 16 }} /></IconButton>
                    </Stack>
                  </Box>
                ))}
              </Stack>
            </Box>
          </Box>

          {/* Today Appointment Section */}
          <Box sx={{ flex: { xs: '1 1 100%', lg: '1' }, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
            <Box className="premium-card">
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="body2" fontWeight="600">Today Appointment</Typography>
                <Link href="#" sx={{ textDecoration: 'none', fontSize: '0.875rem', fontWeight: '500' }}>See All</Link>
              </Box>
              <Grid container sx={{ borderBottom: '1px solid #F1F5F9', pb: 1, mb: 1 }}>
                <Grid item xs={3}><Typography variant="caption" color="text.secondary" fontWeight="600">Patient</Typography></Grid>
                <Grid item xs={6}><Typography variant="caption" color="text.secondary" fontWeight="600">Name/Diagonosis</Typography></Grid>
                <Grid item xs={3} sx={{ textAlign: 'right' }}><Typography variant="caption" color="text.secondary" fontWeight="600">Time</Typography></Grid>
              </Grid>
              <Stack spacing={1}>
                {todayAppointments.map((app, idx) => (
                  <Grid container key={idx} alignItems="center" sx={{ py: 1 }}>
                    <Grid item xs={3}><Avatar sx={{ width: 28, height: 28 }} /></Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" fontWeight="600" sx={{ fontSize: '0.75rem' }} noWrap>{app.name}</Typography>
                      <Typography variant="caption" color="text.secondary" display="block" sx={{ fontSize: '0.65rem' }} noWrap>{app.diag}</Typography>
                    </Grid>
                    <Grid item xs={3} sx={{ textAlign: 'right' }}>
                      <Box component="span" className={`status-chip status-${app.status}`} style={{ fontSize: '0.6rem', padding: '1px 4px' }}>
                        {app.time}
                      </Box>
                    </Grid>
                  </Grid>
                ))}
              </Stack>
            </Box>
          </Box>

          {/* Next Patient Details */}
          <Box sx={{ flex: { xs: '1 1 100%', lg: '1.2' }, minWidth: 0 }}>
            <Box className="premium-card" sx={{ bgcolor: '#ffffffff', border: 'none' }}>
              <Typography variant="body2" fontWeight="600" sx={{ mb: 2 }}>Next Patient Details</Typography>
              <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <Avatar sx={{ width: 48, height: 48 }} />
                <Box>
                  <Typography variant="body1" fontWeight="bold">Sanath Deo</Typography>
                  <Typography variant="caption" color="text.secondary">Health Cheakup</Typography>
                </Box>
                <Box sx={{ ml: 'auto', textAlign: 'right' }}>
                  <Typography variant="caption" color="text.secondary">Patient ID</Typography>
                  <Typography variant="caption" display="block" fontWeight="600">0220092020005</Typography>
                </Box>
              </Box>

              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={4}>
                  <Typography variant="caption" color="text.secondary">D. O. B</Typography>
                  <Typography variant="body2" fontWeight="500">15 Jan 1989</Typography>
                </Grid>
                <Grid item xs={2}>
                  <Typography variant="caption" color="text.secondary">Sex</Typography>
                  <Typography variant="body2" fontWeight="500">Male</Typography>
                </Grid>
                <Grid item xs={2}>
                  <Typography variant="caption" color="text.secondary">Weight</Typography>
                  <Typography variant="body2" fontWeight="500">59 Kg</Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="caption" color="text.secondary">Last Appt</Typography>
                  <Typography variant="body2" fontWeight="500">15 Dec - 21</Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="caption" color="text.secondary">Height</Typography>
                  <Typography variant="body2" fontWeight="500">172 cm</Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="caption" color="text.secondary">Reg. Date</Typography>
                  <Typography variant="body2" fontWeight="500">10 Dec 21</Typography>
                </Grid>
              </Grid>

              <Typography variant="caption" fontWeight="600" sx={{ display: 'block', mb: 1 }}>Patient History</Typography>
              <Stack direction="row" spacing={1} sx={{ mb: 1.5 }} flexWrap="wrap">
                <Box className="patient-history-tag tag-asthma">Asthma</Box>
                <Box className="patient-history-tag tag-hypertension">Hypertention</Box>
                <Box className="patient-history-tag tag-fever">Fever</Box>
              </Stack>

              <Stack direction="row" spacing={1} justifyContent="space-between" flexWrap="wrap" gap={1}>
                <Box sx={{ flex: 1, p: 1, borderRadius: 2, bgcolor: '#2563EB', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, cursor: 'pointer', minWidth: '110px' }}>
                  <PhoneIcon sx={{ fontSize: 14 }} />
                  <Typography variant="caption" fontWeight="600" sx={{ fontSize: '0.7rem' }}>(308) 555-0102</Typography>
                </Box>
                <Box className="action-btn btn-doc" sx={{ flexGrow: 1, minWidth: '80px' }}><DocIcon sx={{ fontSize: 16 }} /><Typography variant="caption" fontWeight="600" sx={{ ml: 0.5 }}>Document</Typography></Box>
                <Box className="action-btn btn-chat" sx={{ flexGrow: 1, minWidth: '60px' }}><ChatIcon sx={{ fontSize: 16 }} /><Typography variant="caption" fontWeight="600" sx={{ ml: 0.5 }}>Chat</Typography></Box>
              </Stack>
            </Box>
          </Box>
        </Box>

        {/* Bottom Widgets */}
        <Grid container spacing={5} sx={{ mt: 5 }}>
          <Grid item xs={12} md={5}>
            <Box className="premium-card">
              <Typography variant="body2" fontWeight="600" sx={{ mb: 3 }}>Patients Review</Typography>
              <Stack spacing={3}>
                {[
                  { label: 'Excellent', class: 'excellent' },
                  { label: 'Great', class: 'great' },
                  { label: 'Good', class: 'good' },
                  { label: 'Avarage', class: 'average' }
                ].map((review, idx) => (
                  <Box key={idx}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="caption" color="text.secondary">{review.label}</Typography>
                    </Box>
                    <Box className="review-bar">
                      <Box className={`review-progress progress-${review.class}`} />
                    </Box>
                  </Box>
                ))}
              </Stack>
            </Box>
          </Grid>

          <Grid item xs={12} md={4}>
            {/* Patients Summary Section */}
            <Box className="premium-card">
              <Typography variant="body2" fontWeight="600" sx={{ mb: 3 }}>Patients Summaey December 2021</Typography>
              <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center' }}>
                <PieChart />
              </Box>
              <Stack spacing={1.5}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ width: 12, height: 12, borderRadius: '2px', bgcolor: '#0D9488' }} />
                  <Typography variant="body2" color="text.secondary">New Patients</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ width: 12, height: 12, borderRadius: '2px', bgcolor: '#F59E0B' }} />
                  <Typography variant="body2" color="text.secondary">Old Patients</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ width: 12, height: 12, borderRadius: '2px', bgcolor: '#2563EB' }} />
                  <Typography variant="body2" color="#1E293B" fontWeight="600">Total Patients</Typography>
                </Box>
              </Stack>
            </Box>
          </Grid>

          <Grid item xs={12} md={3}>
            <Box className="premium-card">
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="body2" fontWeight="600">Calander</Typography>
                <Typography variant="caption" fontWeight="600" color="primary">December - 2021</Typography>
              </Box>
              <Box className="calendar-grid">
                {['Sa', 'Su', 'Mo', 'Tu', 'We', 'Th', 'Fr'].map(d => <Box key={d} className="calendar-day header">{d}</Box>)}
                {[18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 1, 2, 3, 4, 5, 6, 7].map(n => (
                  <Box key={n} className={`calendar-day ${n === 21 ? 'active' : ''}`}>{n < 10 && n > 0 ? `0${n}` : n}</Box>
                ))}
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </DoctorLayout>
  );
}

export default DoctorDashboard;
