import React, { useState } from "react";
import { Box, Typography, TextField, Button, Chip, Stack, Paper, CircularProgress, Alert } from "@mui/material";
import { checkSymptoms } from "../api/symptomApi";

const SymptomChecker = () => {
  const [input, setInput] = useState("");
  const [symptoms, setSymptoms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleAddSymptom = () => {
    if (input.trim() && !symptoms.includes(input.trim().toLowerCase())) {
      setSymptoms([...symptoms, input.trim().toLowerCase()]);
      setInput("");
    }
  };

  const handleDeleteSymptom = (symptom) => {
    setSymptoms(symptoms.filter((s) => s !== symptom));
  };

  const handleCheck = async () => {
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await checkSymptoms(symptoms);
      setResult(res.prediction);
    } catch (err) {
      setError(err.message || "Failed to get diagnosis");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 3, mb: 4 }} elevation={4}>
      <Typography variant="h5" color="primary" gutterBottom>
        Symptom Checker
      </Typography>
      <Typography variant="body1" sx={{ mb: 2 }}>
        Enter your symptoms below. Our AI will suggest possible conditions and advice.
      </Typography>
      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <TextField
          label="Add Symptom"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAddSymptom()}
          size="small"
        />
        <Button variant="contained" onClick={handleAddSymptom} disabled={!input.trim()}>
          Add
        </Button>
      </Stack>
      <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: "wrap" }}>
        {symptoms.map((symptom) => (
          <Chip
            key={symptom}
            label={symptom}
            onDelete={() => handleDeleteSymptom(symptom)}
            color="secondary"
          />
        ))}
      </Stack>
      <Button
        variant="contained"
        color="primary"
        onClick={handleCheck}
        disabled={symptoms.length === 0 || loading}
        sx={{ mb: 2 }}
      >
        {loading ? <CircularProgress size={24} /> : "Check Symptoms"}
      </Button>
      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      {result && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" color="secondary" gutterBottom>
            Possible Conditions:
          </Typography>
          <ul>
            {result.conditions?.map((cond) => (
              <li key={cond}>{cond}</li>
            ))}
          </ul>
          <Typography variant="body1" sx={{ mt: 1 }}>
            <b>Severity:</b> {result.severity}
          </Typography>
          <Typography variant="body1" sx={{ mt: 1 }}>
            <b>Advice:</b> {result.advice}
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default SymptomChecker;
