import { Box, Button, Container, Paper, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "../../api/authApi.js";

export default function PendingApproval() {
  const navigate = useNavigate();

  const handleBackToLogin = () => {
    logoutUser();
    navigate("/login");
  };

  return (
    <Container maxWidth="sm">
      <Box mt={10}>
        <Paper sx={{ p: 4, borderRadius: 3, textAlign: "center" }}>
          <Typography variant="h5" mb={1}>
            Approval Pending
          </Typography>
          <Typography color="text.secondary" mb={3}>
            Your email is verified, but your account still needs admin approval before you can use the dashboard.
          </Typography>
          <Button variant="contained" onClick={handleBackToLogin}>
            Back to Login
          </Button>
        </Paper>
      </Box>
    </Container>
  );
}
