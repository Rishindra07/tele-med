import { Box, Button, Container, Paper, Typography, Avatar, alpha, Stack } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "../../api/authApi.js";
import { HourglassEmpty, HealthAndSafety, VerifiedUserOutlined, ArrowBack } from "@mui/icons-material";

const PRIMARY_BLUE = "#2563EB";

export default function PendingApproval() {
  const navigate = useNavigate();

  const handleBackToLogin = () => {
    logoutUser();
    navigate("/login");
  };

  return (
    <Box sx={{ 
      minHeight: "100vh", 
      display: "flex", 
      flexDirection: "column", 
      bgcolor: "#F1F5F9",
      background: 'radial-gradient(circle at center, rgba(37, 99, 235, 0.05) 0%, rgba(241, 245, 249, 1) 100%)',
      p: { xs: 2, sm: 4 },
      justifyContent: 'center'
    }}>
      <Container maxWidth="sm">
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <Avatar sx={{ bgcolor: PRIMARY_BLUE, width: 64, height: 64, mb: 1.5, mx: 'auto', boxShadow: `0 8px 16px ${alpha(PRIMARY_BLUE, 0.25)}` }}>
              <HealthAndSafety fontSize="large" />
            </Avatar>
            <Typography variant="h4" fontWeight={900} color="#1E293B" sx={{ fontFamily: '"Outfit", sans-serif', letterSpacing: -0.5 }}>
              Seva<span style={{ color: PRIMARY_BLUE }}>TeleHealth</span>
            </Typography>
          </Box>

          <Paper elevation={0} sx={{ 
            p: { xs: 5, sm: 7 }, 
            width: "100%", 
            borderRadius: 2, 
            border: '1px solid #E2E8F0',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.05), 0 10px 10px -5px rgba(0,0,0,0.04)',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            textAlign: "center",
            position: 'relative',
            overflow: 'hidden'
          }}>
            <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 6, bgcolor: '#F59E0B' }} />
            
            <Box sx={{ mb: 3 }}>
              <HourglassEmpty sx={{ fontSize: 80, color: '#F59E0B', animation: 'pulse 2s infinite' }} />
            </Box>

            <Typography variant="h5" color="#1E293B" fontWeight={800} mb={2}>
              Verification in Progress
            </Typography>
            
            <Typography color="text.secondary" variant="body1" sx={{ mb: 4, lineHeight: 1.7, fontWeight: 500 }}>
              Your professional credentials have been securely transmitted. Our medical compliance team is currently reviewing your documentation to ensure platform safety.
            </Typography>

            <Stack spacing={2} sx={{ mb: 4, textAlign: 'left', bgcolor: alpha('#F59E0B', 0.05), p: 3, borderRadius: 4, border: '1px solid', borderColor: alpha('#F59E0B', 0.1) }}>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <VerifiedUserOutlined sx={{ color: '#F59E0B' }} fontSize="small" />
                <Typography variant="body2" fontWeight={700}>Standard review time: 24-48 hours</Typography>
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ ml: 5 }}>
                You will receive an email notification once your dashboard access is granted.
              </Typography>
            </Stack>

            <Button 
              variant="outlined" 
              onClick={handleBackToLogin}
              startIcon={<ArrowBack />}
              sx={{ 
                py: 1.5, 
                px: 4, 
                borderRadius: 3, 
                fontWeight: 700, 
                textTransform: 'none',
                borderColor: alpha(PRIMARY_BLUE, 0.3),
                color: PRIMARY_BLUE
              }}
            >
              Sign Out and Return Home
            </Button>
          </Paper>

          <Box sx={{ mt: 4, textAlign: 'center' }}>
             <Typography variant="caption" color="text.disabled" sx={{ letterSpacing: 2, fontWeight: 700 }}>
                SECURED PORTAL • COMPLIANCE QUEUE
             </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
