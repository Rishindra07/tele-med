import { useState } from "react";
import {
  Container,
  Typography,
  Box,
  Button,
  Chip,
  CircularProgress,
  Card,
  CardContent,
  TextField
} from "@mui/material";
import { checkSymptoms } from "../../api/symptomApi";

const symptomOptions = [
  "fever",
  "cough",
  "headache",
  "chest pain",
  "fatigue",
  "shortness of breath",
  "diarrhea",
  "sneezing"
];

export default function SymptomChecker() {
  const [selected, setSelected] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState("");

  const toggleSymptom = (symptom) => {
    setSelected((prev) =>
      prev.includes(symptom)
        ? prev.filter((s) => s !== symptom)
        : [...prev, symptom]
    );
  };

  const handleAddSymptom = () => {
    const value = input.trim().toLowerCase();
    if (value && !selected.includes(value)) {
      setSelected((prev) => [...prev, value]);
    }
    setInput("");
  };

  const handleInputKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddSymptom();
    }
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

  return (
    <Container maxWidth="md">
      <Box mt={5}>
        <Typography variant="h5" gutterBottom>
          AI Symptom Checker
        </Typography>

        <Typography>Select your symptoms:</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          e.g. fever, cough, headache
        </Typography>

        <Box mt={2} mb={3} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <TextField
            label="Add custom symptom"
            placeholder="Type a symptom and press Enter"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleInputKeyDown}
            size="medium"
            disabled={loading}
            sx={{
              mb: 3,
              width: { xs: '90%', sm: 400 },
              background: '#fff',
              borderRadius: 2,
              boxShadow: 2,
              '& .MuiInputBase-root': {
                fontSize: '1.1rem',
                padding: '6px 12px',
              },
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#1976d2',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: '#1565c0',
              },
              '& .Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: '#1565c0',
                borderWidth: 2,
              },
            }}
            inputProps={{ style: { textAlign: 'center' } }}
          />
          <Box sx={{ width: '100%', textAlign: 'center' }}>
            {selected.length === 0 && (
              <Chip label="e.g. fever" variant="outlined" sx={{ m: 1, opacity: 0.6 }} />
            )}
            {symptomOptions.map((symptom) => (
              <Chip
                key={symptom}
                label={symptom}
                clickable
                color={selected.includes(symptom) ? "primary" : "default"}
                onClick={() => toggleSymptom(symptom)}
                sx={{ m: 1, fontSize: '1rem', px: 2, py: 1, borderRadius: 2 }}
              />
            ))}
            {selected.map((symptom) =>
              !symptomOptions.includes(symptom) ? (
                <Chip
                  key={symptom}
                  label={symptom}
                  color="secondary"
                  onDelete={() => toggleSymptom(symptom)}
                  sx={{ m: 1, fontSize: '1rem', px: 2, py: 1, borderRadius: 2 }}
                />
              ) : null
            )}
          </Box>
        </Box>

        <Button
          variant="contained"
          disabled={loading || selected.length === 0}
          onClick={handleSubmit}
        >
          {loading ? <CircularProgress size={24} /> : "Check Symptoms"}
        </Button>

        {/* Result Section */}
        {result && (
          <Card sx={{ mt: 4 }}>
            <CardContent>
              <Typography variant="h6">
                AI Source: {result.aiUsed || result.source}
              </Typography>

              <Typography>
                <strong>Condition:</strong>{" "}
                {result.prediction.conditions.join(", ")}
              </Typography>

              <Typography>
                <strong>Severity:</strong> {result.prediction.severity}
              </Typography>

              <Typography mt={2}>
                <strong>Advice:</strong> {result.prediction.advice}
              </Typography>

              {(result.immediateConsult || result.prediction.severity === 'medium') && (
                <Button
                  variant="contained"
                  color={result.prediction.severity === 'medium' ? 'warning' : 'error'}
                  sx={{ mt: 2 }}
                >
                  Book Appointment
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </Box>
    </Container>
  );
}
