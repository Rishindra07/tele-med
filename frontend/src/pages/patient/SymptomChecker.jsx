import React, { useState } from "react";
import {
  Container,
  Typography,
  Box,
  Button,
  Chip,
  CircularProgress,
  Card,
  CardContent,
  TextField,
  AppBar,
  Toolbar,
  IconButton,
  Grow,
  Alert,
  Divider,
} from "@mui/material";
import { ArrowBack as ArrowBackIcon, SmartToy as SmartToyIcon, LocalHospital as HospitalIcon } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { checkSymptoms } from "../../api/symptomApi";

const symptomOptions = ["fever", "cough", "headache", "chest pain", "fatigue", "shortness of breath", "diarrhea", "sneezing"];

export default function SymptomChecker() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState("");

  const toggleSymptom = (symptom) => {
    setSelected((prev) => prev.includes(symptom) ? prev.filter((s) => s !== symptom) : [...prev, symptom]);
  };

  const handleAddSymptom = () => {
    const value = input.trim().toLowerCase();
    if (value && !selected.includes(value)) setSelected((prev) => [...prev, value]);
    setInput("");
  };

  const handleInputKeyDown = (e) => {
    if (e.key === "Enter") { e.preventDefault(); handleAddSymptom(); }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const res = await checkSymptoms(selected);
      setResult(res);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity) => {
    switch(severity?.toLowerCase()) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'primary';
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="static" color="inherit" elevation={1}>
        <Toolbar>
          <IconButton edge="start" onClick={() => navigate(-1)} sx={{ mr: 2 }}><ArrowBackIcon /></IconButton>
          <Typography variant="h6" color="primary" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SmartToyIcon /> AI Symptom Checker
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ py: 6 }}>
        <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 4, mb: 4, overflow: 'visible' }}>
          <Box sx={{ bgcolor: 'primary.main', color: 'white', p: 4, borderRadius: '16px 16px 0 0', textAlign: 'center' }}>
            <Typography variant="h4" fontWeight="bold" gutterBottom>What are your symptoms?</Typography>
            <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
              Select from common symptoms or type your own. Our AI will analyze them and suggest next steps.
            </Typography>
          </Box>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <TextField
                placeholder="Type a custom symptom and press Enter..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleInputKeyDown}
                size="medium"
                disabled={loading}
                variant="outlined"
                sx={{ mb: 4, width: '100%', maxWidth: 500, bgcolor: 'background.paper' }}
              />
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center', mb: 4 }}>
                {symptomOptions.map((symptom) => (
                  <Chip
                    key={symptom}
                    label={symptom}
                    clickable
                    color={selected.includes(symptom) ? "primary" : "default"}
                    onClick={() => toggleSymptom(symptom)}
                    sx={{ fontSize: '1rem', px: 1, py: 2.5, borderRadius: 8, fontWeight: selected.includes(symptom) ? 600 : 400 }}
                  />
                ))}
                {selected.filter(s => !symptomOptions.includes(s)).map((symptom) => (
                  <Chip
                    key={symptom}
                    label={symptom}
                    color="secondary"
                    onDelete={() => toggleSymptom(symptom)}
                    sx={{ fontSize: '1rem', px: 1, py: 2.5, borderRadius: 8, fontWeight: 600 }}
                  />
                ))}
              </Box>
            </Box>

            <Box textAlign="center">
              <Button
                variant="contained"
                size="large"
                disabled={loading || selected.length === 0}
                onClick={handleSubmit}
                sx={{ px: 6, py: 1.5, fontSize: '1.1rem', borderRadius: 8 }}
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SmartToyIcon />}
              >
                {loading ? "Analyzing..." : "Analyze Symptoms"}
              </Button>
            </Box>
          </CardContent>
        </Card>

        {result && (
          <Grow in>
            <Card elevation={0} sx={{ border: '1px solid', borderColor: `${getSeverityColor(result.prediction.severity)}.main`, borderRadius: 4 }}>
              <Box sx={{ bgcolor: `${getSeverityColor(result.prediction.severity)}.light`, p: 3, display: 'flex', alignItems: 'center', color: `${getSeverityColor(result.prediction.severity)}.dark` }}>
                <HospitalIcon sx={{ mr: 2, fontSize: 32 }} />
                <Box>
                  <Typography variant="h6" fontWeight="bold">AI Assessment Result</Typography>
                  <Typography variant="body2">Severity: <strong style={{ textTransform: 'uppercase' }}>{result.prediction.severity}</strong></Typography>
                </Box>
              </Box>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="subtitle2" color="text.secondary" textTransform="uppercase" gutterBottom>Possible Conditions</Typography>
                <Typography variant="h5" fontWeight="bold" gutterBottom color="text.primary">
                  {result.prediction.conditions.join(", ")}
                </Typography>

                <Divider sx={{ my: 3 }} />

                <Typography variant="subtitle2" color="text.secondary" textTransform="uppercase" gutterBottom>Medical Advice</Typography>
                <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
                  {result.prediction.advice}
                </Typography>

                {(result.immediateConsult || result.prediction.severity === 'medium' || result.prediction.severity === 'high') && (
                  <Box sx={{ mt: 4 }}>
                    <Alert severity={getSeverityColor(result.prediction.severity)} sx={{ mb: 3 }}>
                      Based on your symptoms, we strongly recommend consulting a doctor.
                    </Alert>
                    <Button
                      variant="contained"
                      color="primary"
                      size="large"
                      onClick={() => navigate('/patient')}
                      fullWidth
                    >
                      Book a Consultation Now
                    </Button>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grow>
        )}
      </Container>
    </Box>
  );
}
