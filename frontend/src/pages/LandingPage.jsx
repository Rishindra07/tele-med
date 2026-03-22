import React from 'react';
import { Box, Typography, Button, Container, Grid, Card, CardContent, AppBar, Toolbar, Stack, alpha } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import VideoCallIcon from '@mui/icons-material/VideoCall';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import LocalPharmacyIcon from '@mui/icons-material/LocalPharmacy';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';

const FeatureCard = ({ icon, title, description, delay }) => (
  <Card 
    className="glass-pane"
    sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      textAlign: 'center', 
      p: 4, 
      animation: `fadeInUp 0.6s ease-out forwards ${delay}s`,
      opacity: 0,
      background: 'rgba(255, 255, 255, 0.8)',
    }}
  >
    <Box sx={{ 
      color: 'primary.main', 
      mb: 3, 
      p: 2, 
      borderRadius: '50%', 
      bgcolor: alpha('#2563EB', 0.1),
      display: 'inline-flex'
    }}>
      {icon}
    </Box>
    <CardContent sx={{ flexGrow: 1, p: 0 }}>
      <Typography gutterBottom variant="h5" component="h3" fontWeight="bold" color="text.primary">
        {title}
      </Typography>
      <Typography color="text.secondary" sx={{ lineHeight: 1.6 }}>
        {description}
      </Typography>
    </CardContent>
  </Card>
);

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default', overflow: 'hidden' }}>
      
      {/* Glassmorphic Navbar */}
      <AppBar 
        position="fixed" 
        className="glass-pane"
        elevation={0}
        sx={{ borderBottom: '1px solid rgba(0,0,0,0.05)', zIndex: 1100 }}
      >
        <Container maxWidth="lg">
          <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 0, sm: 2 } }}>
            <Typography variant="h5" color="primary.main" fontWeight="800" sx={{ display: 'flex', alignItems: 'center', gap: 1.5, fontFamily: '"Outfit", sans-serif' }}>
              <HealthAndSafetyIcon fontSize="large" sx={{ color: 'secondary.main' }} /> 
              Seva<span style={{ color: '#0F172A' }}>TeleHealth</span>
            </Typography>
            <Stack direction="row" spacing={2} alignItems="center">
              <Button
                variant="outlined"
                onClick={() => navigate('/login')}
                sx={{
                  fontWeight: 600,
                  borderRadius: 8,
                  px: 3,
                  py: 0.9,
                  borderColor: 'primary.main',
                  color: 'primary.main',
                  borderWidth: '2px',
                  transition: 'all 0.25s ease',
                  '&:hover': {
                    borderWidth: '2px',
                    bgcolor: 'rgba(37, 99, 235, 0.06)',
                    borderColor: 'primary.dark',
                    color: 'primary.dark',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)',
                  },
                }}
              >
                Sign In
              </Button>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={() => navigate('/register')}
                sx={{
                  borderRadius: 8,
                  px: 3,
                  py: 0.9,
                  fontWeight: 600,
                  transition: 'all 0.25s ease',
                  '&:hover': {
                    transform: 'translateY(-1px)',
                    boxShadow: '0 6px 16px rgba(37, 99, 235, 0.35)',
                  },
                }}
              >
                Sign Up
              </Button>
            </Stack>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Hero Section */}
      <Box sx={{ 
        position: 'relative', 
        pt: { xs: 15, md: 24 }, 
        pb: { xs: 10, md: 16 }, 
        textAlign: 'center', 
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)'
      }}>
        {/* Animated Background Blobs */}
        <Box sx={{
          position: 'absolute', top: '-10%', left: '-10%', width: '40vw', height: '40vw',
          background: 'radial-gradient(circle, rgba(16,185,129,0.15) 0%, rgba(16,185,129,0) 70%)',
          animation: 'float 6s ease-in-out infinite'
        }} />
        <Box sx={{
          position: 'absolute', bottom: '-20%', right: '-10%', width: '50vw', height: '50vw',
          background: 'radial-gradient(circle, rgba(37,99,235,0.15) 0%, rgba(37,99,235,0) 70%)',
          animation: 'float 8s ease-in-out infinite reverse'
        }} />

        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
          <Typography 
            variant="h1" 
            component="h1" 
            gutterBottom 
            sx={{ 
              animation: 'fadeInUp 0.8s ease-out',
              color: '#0F172A',
              mb: 3
            }}
          >
            Healthcare <span className="gradient-text">Anywhere</span>,<br /> Anytime.
          </Typography>
          <Typography 
            variant="h5" 
            sx={{ 
              mb: 5, 
              color: 'text.secondary', 
              fontWeight: 400,
              maxWidth: '800px',
              mx: 'auto',
              lineHeight: 1.6,
              animation: 'fadeInUp 0.8s ease-out forwards 0.2s',
              opacity: 0
            }}
          >
            Connect with top-tier certified doctors instantly through our platform. 
            Optimized for rural accessibility and low-bandwidth areas, bringing the clinic to your home.
          </Typography>
          
          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            spacing={3} 
            justifyContent="center"
            sx={{ 
              animation: 'fadeInUp 0.8s ease-out forwards 0.4s',
              opacity: 0
            }}
          >
            <Button 
              variant="contained" 
              color="primary" 
              size="large" 
              onClick={() => navigate('/register')} 
              endIcon={<ArrowForwardIcon />}
              sx={{ px: 5, py: 1.8, fontSize: '1.1rem', borderRadius: 50, animation: 'pulseGlow 3s infinite' }}
            >
              Start Consultation
            </Button>
            <Button 
              className="glass-pane"
              variant="outlined" 
              color="primary"
              size="large" 
              onClick={() => navigate('/symptom-checker')}
              sx={{ px: 5, py: 1.8, fontSize: '1.1rem', borderRadius: 50, border: '2px solid #2563EB', '&:hover': { border: '2px solid #1D4ED8', bgcolor: 'rgba(37, 99, 235, 0.05)' } }}
            >
              Try AI Symptom Checker
            </Button>
          </Stack>
        </Container>
      </Box>

      {/* Services Section */}
      <Container maxWidth="lg" sx={{ py: 12, flexGrow: 1, position: 'relative', zIndex: 2 }}>
        <Box textAlign="center" mb={8} sx={{ animation: 'fadeInUp 0.8s ease-out forwards 0.2s', opacity: 0 }}>
          <Typography variant="subtitle1" color="secondary.main" fontWeight="bold" textTransform="uppercase" letterSpacing={2} gutterBottom>
            Features
          </Typography>
          <Typography variant="h2" fontWeight="800" color="text.primary">
            Our Core Services
          </Typography>
        </Box>

        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <FeatureCard 
              delay={0.4}
              icon={<VideoCallIcon sx={{ fontSize: 50 }} />} 
              title="Remote Consultations" 
              description="High-quality video and low-bandwidth audio options carefully designed to ensure you can talk to doctors seamlessly." 
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FeatureCard 
              delay={0.6}
              icon={<SmartToyIcon sx={{ fontSize: 50 }} />} 
              title="AI Symptom Analysis" 
              description="Get instant AI-driven suggestions, preliminary assessments, and severity indicators before confirming your booking." 
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FeatureCard 
              delay={0.8}
              icon={<LocalPharmacyIcon sx={{ fontSize: 50 }} />} 
              title="Digital Pharmacy" 
              description="Easily order prescribed medicines from connected local pharmacies directly through your digital heath record." 
            />
          </Grid>
        </Grid>

        {/* Trust Banner */}
        <Box 
          sx={{ 
            mt: 12, 
            textAlign: 'center', 
            bgcolor: 'primary.main', 
            color: 'white',
            p: { xs: 5, md: 8 }, 
            borderRadius: 6, 
            boxShadow: '0 20px 25px -5px rgba(37, 99, 235, 0.4)',
            backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <VerifiedUserIcon sx={{ fontSize: 72, color: 'secondary.light', mb: 3 }} />
          <Typography variant="h3" fontWeight="bold" gutterBottom>Trusted by Vetted Professionals</Typography>
          <Typography variant="h6" sx={{ maxWidth: 700, mx: 'auto', fontWeight: 400, opacity: 0.9, lineHeight: 1.6 }}>
            All our medical practitioners are fully verified and certified. We strictly ensure you receive the safest and most reliable healthcare advice.
          </Typography>
        </Box>
      </Container>
      
      {/* Footer */}
      <Box component="footer" sx={{ bgcolor: '#0F172A', color: 'white', py: 6, textAlign: 'center', mt: 'auto' }}>
        <Typography variant="body1" sx={{ color: '#94A3B8', mb: 1 }}>
          © {new Date().getFullYear()} Seva TeleHealth Platform. All rights reserved.
        </Typography>
        <Typography variant="body2" sx={{ color: '#64748B' }}>
          Dedicated to accessible healthcare for all.
        </Typography>
      </Box>
    </Box>
  );
};

export default LandingPage;
