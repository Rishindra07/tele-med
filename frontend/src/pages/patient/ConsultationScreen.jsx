import React, { useState } from 'react';
import { Box, Typography, Paper, Grid, IconButton, Button, Avatar, Stack, TextField, Divider, Switch, FormControlLabel, Tooltip } from '@mui/material';
import { 
  Videocam as VideocamIcon, 
  VideocamOff as VideocamOffIcon,
  Mic as MicIcon,
  MicOff as MicOffIcon,
  CallEnd as CallEndIcon,
  Send as SendIcon,
  WifiTetheringError as LowBandwidthIcon,
  ReceiptLong as PrescriptionIcon,
  Forum as ChatIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

export default function ConsultationScreen() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isDoctor = user.role === 'doctor';
  
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [micEnabled, setMicEnabled] = useState(true);
  const [lowBandwidthMode, setLowBandwidthMode] = useState(false);
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' or 'notes'

  const handleToggleBandwidth = (e) => {
    const isLow = e.target.checked;
    setLowBandwidthMode(isLow);
    if (isLow) {
      setVideoEnabled(false);
      document.body.classList.add('low-bandwidth');
    } else {
      setVideoEnabled(true);
      document.body.classList.remove('low-bandwidth');
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#000' }}>
      {/* Top Bar */}
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'rgba(30,41,59,0.9)', color: 'white', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <Typography variant="h6" fontWeight="bold">
          {isDoctor ? `Consultation with Patient` : `Dr. Sharma - General Consultation`}
        </Typography>
        <Stack direction="row" alignItems="center" spacing={2}>
          <FormControlLabel
            control={<Switch checked={lowBandwidthMode} onChange={handleToggleBandwidth} color="warning" />}
            label={<Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}><LowBandwidthIcon sx={{ mr: 0.5, fontSize: 18 }} /> Low Bandwidth</Typography>}
          />
          <Typography variant="body2" sx={{ bgcolor: 'error.main', px: 1.5, py: 0.5, borderRadius: 1 }}>05:23</Typography>
        </Stack>
      </Box>

      {/* Main Content */}
      <Grid container sx={{ flexGrow: 1, overflow: 'hidden' }}>
        {/* Video Area */}
        <Grid item xs={12} md={8} lg={9} sx={{ p: 2, display: 'flex', flexDirection: 'column', position: 'relative' }}>
          <Box sx={{ 
            flexGrow: 1, 
            bgcolor: '#1E293B', 
            borderRadius: 3, 
            overflow: 'hidden', 
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {!videoEnabled ? (
              <Stack alignItems="center" spacing={2}>
                <Avatar sx={{ width: 120, height: 120, fontSize: '3rem', bgcolor: 'primary.main' }}>
                  {isDoctor ? 'P' : 'DS'}
                </Avatar>
                <Typography variant="h5" color="white">{isDoctor ? 'Patient' : 'Dr. Sharma'}</Typography>
                <Typography variant="body1" color="gray">Audio Only Mode Active</Typography>
              </Stack>
            ) : (
              <Box sx={{ width: '100%', height: '100%', backgroundImage: 'url("https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=1200")', backgroundSize: 'cover', backgroundPosition: 'center' }} />
            )}
            
            {/* Self View mini */}
            <Paper elevation={4} sx={{ 
              position: 'absolute', 
              bottom: 24, 
              right: 24, 
              width: 160, 
              height: 120, 
              borderRadius: 2, 
              overflow: 'hidden',
              bgcolor: '#334155',
              border: '2px solid rgba(255,255,255,0.2)'
            }}>
              {!videoEnabled ? (
                <Box display="flex" height="100%" alignItems="center" justifyContent="center">
                  <Avatar>Y</Avatar>
                </Box>
              ) : (
                <Box sx={{ width: '100%', height: '100%', bgcolor: '#94A3B8' }} /> // placeholder self view
              )}
            </Paper>
          </Box>

          {/* Controls */}
          <Paper elevation={0} sx={{ mt: 2, p: 2, borderRadius: 3, bgcolor: '#1E293B', display: 'flex', justifyContent: 'center', gap: 3 }}>
            <Tooltip title={videoEnabled ? "Turn off camera" : "Turn on camera"}>
              <IconButton 
                onClick={() => setVideoEnabled(!videoEnabled)} 
                sx={{ 
                  bgcolor: videoEnabled ? 'rgba(255,255,255,0.1)' : 'rgba(239, 68, 68, 0.2)', 
                  color: videoEnabled ? 'white' : 'error.main', 
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } 
                }}
                size="large"
              >
                {videoEnabled ? <VideocamIcon /> : <VideocamOffIcon />}
              </IconButton>
            </Tooltip>
            
            <Tooltip title={micEnabled ? "Mute microphone" : "Unmute microphone"}>
              <IconButton 
                onClick={() => setMicEnabled(!micEnabled)}
                sx={{ 
                  bgcolor: micEnabled ? 'rgba(255,255,255,0.1)' : 'rgba(239, 68, 68, 0.2)', 
                  color: micEnabled ? 'white' : 'error.main', 
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } 
                }}
                size="large"
              >
                {micEnabled ? <MicIcon /> : <MicOffIcon />}
              </IconButton>
            </Tooltip>

            <Button 
              variant="contained" 
              color="error" 
              startIcon={<CallEndIcon />}
              onClick={() => navigate(isDoctor ? '/doctor/appointments' : '/patient')}
              sx={{ borderRadius: 8, px: 4, fontWeight: 'bold' }}
            >
              End Call
            </Button>
          </Paper>
        </Grid>

        {/* Side Panel */}
        <Grid item xs={12} md={4} lg={3} sx={{ borderLeft: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', bgcolor: 'white' }}>
          <Stack direction="row" sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Button 
              fullWidth 
              variant={activeTab === 'chat' ? 'contained' : 'text'} 
              color="inherit" 
              startIcon={<ChatIcon />}
              onClick={() => setActiveTab('chat')}
              sx={{ borderRadius: 0, py: 2, color: activeTab === 'chat' ? 'primary.main' : 'text.secondary', bgcolor: activeTab === 'chat' ? 'primary.light' : 'transparent', boxShadow: 'none' }}
            >
              Chat
            </Button>
            <Button 
              fullWidth 
              variant={activeTab === 'notes' ? 'contained' : 'text'} 
              color="inherit" 
              startIcon={<PrescriptionIcon />}
              onClick={() => setActiveTab('notes')}
              sx={{ borderRadius: 0, py: 2, color: activeTab === 'notes' ? 'primary.main' : 'text.secondary', bgcolor: activeTab === 'notes' ? 'primary.light' : 'transparent', boxShadow: 'none' }}
            >
              Rx Notes
            </Button>
          </Stack>

          <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2 }}>
            {activeTab === 'chat' ? (
              <Stack spacing={2}>
                <Box sx={{ alignSelf: 'flex-start', bgcolor: '#F1F5F9', p: 1.5, borderRadius: 2, maxWidth: '80%' }}>
                  <Typography variant="body2">Hello! How are you feeling today?</Typography>
                  <Typography variant="caption" color="text.secondary" display="block" textAlign="right" mt={0.5}>10:01 AM</Typography>
                </Box>
                <Box sx={{ alignSelf: 'flex-end', bgcolor: 'primary.main', color: 'white', p: 1.5, borderRadius: 2, maxWidth: '80%' }}>
                  <Typography variant="body2">Hi Doctor. I still have the fever and throat pain.</Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }} display="block" textAlign="right" mt={0.5}>10:02 AM</Typography>
                </Box>
              </Stack>
            ) : (
              <Box>
                <Alert severity="info" sx={{ mb: 2 }}>The doctor is currently writing your prescription.</Alert>
                <Typography variant="subtitle2" color="text.secondary">Live Notes:</Typography>
                <Typography variant="body1" sx={{ mt: 1, p: 2, bgcolor: '#F8FAFC', borderRadius: 2, border: '1px dashed #CBD5E1' }}>
                  - Patient reports 101F fever inside the last 24h.<br/>
                  - Prescribing antibiotics (Azithromycin 500mg)
                </Typography>
              </Box>
            )}
          </Box>

          {activeTab === 'chat' && (
            <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
              <TextField 
                fullWidth 
                placeholder="Type a message..." 
                variant="outlined" 
                size="small"
                InputProps={{
                  endAdornment: <IconButton color="primary"><SendIcon /></IconButton>
                }}
              />
            </Box>
          )}
        </Grid>
      </Grid>
    </Box>
  );
}
