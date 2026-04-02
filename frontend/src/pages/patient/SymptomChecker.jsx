import React, { useMemo, useState, useEffect } from 'react';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import {
  CheckCircleRounded as CheckIcon,
  SearchRounded as SearchIcon,
  InfoOutlined as InfoIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { checkSymptomsAI, fetchSymptomLogs } from '../../api/patientApi';
import PatientShell from '../../components/patient/PatientShell';
import { 
  HistoryRounded as HistoryIcon,
  TimelineRounded as TimelineIcon
} from '@mui/icons-material';

const colors = {
  bg: '#f8f9fa',
  paper: '#ffffff',
  line: '#e0e0e0',
  soft: '#f0f0f0',
  text: '#202124',
  muted: '#5f6368',
  primary: '#1a73e8',
  primarySoft: '#e8f0fe',
  primaryDark: '#1557b0',
  success: '#1e8e3e',
  warning: '#f9ab00',
  danger: '#d93025',
  gray: '#9aa0a6'
};

const symptomGroups = {
  General: ['Fever', 'Fatigue', 'Weakness', 'Weight loss', 'Night sweats', 'Loss of appetite'],
  'Head & Neurological': ['Headache', 'Chills', 'Dizziness', 'Blurred vision', 'Confusion', 'Stiff neck'],
  Respiratory: ['Cough', 'Shortness of breath', 'Sore throat', 'Runny nose', 'Chest pain'],
  Digestive: ['Nausea', 'Vomiting', 'Diarrhoea', 'Abdominal pain', 'Bloating']
};

const bodyAreas = [
  'Head & Face',
  'Neck & Throat',
  'Chest & Lungs',
  'Heart & Blood',
  'Stomach & Digestion',
  'Back & Spine',
  'Arms & Hands',
  'Legs & Feet',
  'Skin',
  'Whole body / General'
];

const commonIllnesses = [
  ['Common Cold', 'Runny nose, cough, sore throat'],
  ['Typhoid', 'High fever, stomach pain'],
  ['Malaria', 'Chills, fever, sweating'],
  ['Dengue', 'High fever, joint rash'],
  ['Hypertension', 'Headache, dizziness, BP high'],
  ['Diabetes', 'Thirst, fatigue, frequent urination']
];

const durationOptions = ['Today', '2–3 days', '1 week', '2+ weeks'];
const severityOptions = ['Mild', 'Moderate', 'Severe'];

export default function SymptomChecker() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState([]);
  const [bodyArea, setBodyArea] = useState('Chest & Lungs');
  const [duration, setDuration] = useState('Today');
  const [severity, setSeverity] = useState('Mild');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  const loadHistory = async () => {
    try {
      const res = await fetchSymptomLogs();
      if (res.success) setHistory(res.logs || []);
    } catch (err) {
      console.error(err);
    }
  };

  React.useEffect(() => {
    loadHistory();
  }, []);

  const toggleSymptom = (symptom) => {
    setSelected((prev) =>
      prev.includes(symptom) ? prev.filter((item) => item !== symptom) : [...prev, symptom]
    );
  };

  const clearAll = () => {
    setSelected([]);
    setInput('');
    setResult(null);
  };

  const handleSubmit = async () => {
    const symptoms = selected.length ? selected : input.split(',').map(s => s.trim()).filter(Boolean);
    if (!symptoms.length) return;

    try {
      setLoading(true);
      const res = await checkSymptomsAI(symptoms);
      setResult(res);
      loadHistory();
    } catch (error) {
      alert(error.response?.data?.message || 'AI service error');
    } finally {
      setLoading(false);
    }
  };

  const severityBars = useMemo(
    () => ({
      Mild: [true, false, false],
      Moderate: [true, true, false],
      Severe: [true, true, true]
    }),
    []
  );

  return (
    <PatientShell activeItem="symptoms">
      <Box sx={{ px: { xs: 2, md: 4, xl: 5 }, py: { xs: 3, md: 4 }, bgcolor: colors.bg, minHeight: '100vh' }}>
        <Stack
          direction={{ xs: 'column', lg: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', lg: 'center' }}
          spacing={2}
          sx={{ mb: 4 }}
        >
          <Box>
            <Typography sx={{ fontSize: { xs: 28, md: 36 }, fontWeight: 600, color: colors.text, fontFamily: 'Inter, sans-serif' }}>
              Symptom Checker
            </Typography>
            <Typography sx={{ mt: 0.5, color: colors.muted, fontSize: 16, maxWidth: 470 }}>
              Describe your symptoms to get AI-powered health guidance.
            </Typography>
          </Box>
          <Button startIcon={<HistoryIcon />} onClick={() => setShowHistory(!showHistory)} sx={{ color: colors.primary, textTransform: 'none', fontWeight: 600 }}>
             {showHistory ? 'Back to Checker' : 'View Past Checks'}
          </Button>
        </Stack>

        <Box
          sx={{
            p: 2.5,
            borderRadius: 2,
            border: `1px solid ${colors.primary}`,
            bgcolor: colors.primarySoft,
            mb: 4
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="flex-start">
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: 1.5,
                bgcolor: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: colors.primary,
                flexShrink: 0
              }}
            >
              <InfoIcon fontSize="small" />
            </Box>
            <Box>
              <Typography sx={{ fontSize: 16, fontWeight: 600, color: colors.primaryDark }}>
                For guidance only — not a medical diagnosis
              </Typography>
              <Typography sx={{ mt: 0.5, color: colors.primaryDark, fontSize: 14, lineHeight: 1.5 }}>
                This AI tool provides preliminary suggestions based on your symptoms. Always consult a qualified doctor before taking any medication or making health decisions.
              </Typography>
            </Box>
          </Stack>
        </Box>

        <Stack direction="row" spacing={1.5} useFlexGap flexWrap="wrap" sx={{ mb: 4 }}>
          {[
            ['1', 'Select Body Area', true],
            ['2', 'Choose Symptoms', true],
            ['3', 'Duration & Severity', false],
            ['4', 'View Results', false]
          ].map(([step, label, active], index) => (
            <Box
              key={label}
              sx={{
                px: 2,
                py: 1.25,
                borderRadius: 2,
                border: `1px solid ${active ? colors.primary : colors.line}`,
                bgcolor: index === 1 ? colors.primary : active ? colors.paper : '#fff',
                color: index === 1 ? '#fff' : active ? colors.primaryDark : colors.muted,
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                minHeight: 48,
                boxShadow: active ? '0 1px 3px rgba(0,0,0,0.02)' : 'none'
              }}
            >
              <Box
                sx={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  bgcolor: index === 1 ? 'rgba(255,255,255,0.2)' : active ? colors.primarySoft : colors.soft,
                  color: index === 1 ? '#fff' : active ? colors.primaryDark : colors.muted,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 13,
                  fontWeight: 600
                }}
              >
                {index === 0 ? <CheckIcon sx={{ fontSize: 16 }} /> : step}
              </Box>
              <Typography sx={{ fontSize: 15, fontWeight: 500 }}>{label}</Typography>
            </Box>
          ))}
        </Stack>

        <Stack direction={{ xs: 'column', xl: 'row' }} spacing={3} alignItems="flex-start">
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack direction={{ xs: 'column', lg: 'row' }} spacing={3} alignItems="flex-start">
              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3, width: '100%' }}>
                <Box
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    border: `1px solid ${colors.line}`,
                    bgcolor: colors.paper,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
                  }}
                >
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                  <Typography sx={{ fontSize: 18, fontWeight: 600, color: colors.text }}>Describe your symptoms</Typography>
                  <Button onClick={clearAll} sx={{ color: colors.primary, textTransform: 'none', fontSize: 14 }}>
                    Clear all
                  </Button>
                </Stack>

                <TextField
                  multiline
                  minRows={4}
                  maxRows={4}
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder="Type your symptoms here... e.g. 'I have a headache and fever since yesterday'"
                  sx={{
                    mt: 1,
                    width: '100%',
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 1.5,
                      bgcolor: '#fff'
                    }
                  }}
                />

                <Typography sx={{ mt: 3, color: colors.text, fontSize: 15, fontWeight: 500 }}>Selected symptoms</Typography>
                <Box sx={{ mt: 1.5, p: 2, borderRadius: 1.5, bgcolor: colors.soft }}>
                  <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                    {selected.length ? (
                      selected.map((symptom) => (
                        <Chip
                          key={symptom}
                          label={symptom}
                          onDelete={() => toggleSymptom(symptom)}
                          sx={{
                            bgcolor: colors.primary,
                            color: '#fff',
                            fontWeight: 500,
                            borderRadius: 1.5,
                            '& .MuiChip-deleteIcon': { color: 'rgba(255,255,255,0.7)' },
                            '& .MuiChip-deleteIcon:hover': { color: '#fff' }
                          }}
                        />
                      ))
                    ) : (
                      <Typography sx={{ color: colors.muted, fontSize: 14 }}>No symptoms selected clinically.</Typography>
                    )}
                  </Stack>
                </Box>

                <Stack spacing={3} sx={{ mt: 4 }}>
                  {Object.entries(symptomGroups).map(([group, items]) => (
                    <Box key={group}>
                      <Typography sx={{ color: colors.muted, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600, mb: 1.5 }}>{group}</Typography>
                      <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                        {items.map((symptom) => {
                          const active = selected.includes(symptom);
                          return (
                            <Button
                              key={symptom}
                              onClick={() => toggleSymptom(symptom)}
                              sx={{
                                px: 2,
                                py: 0.75,
                                borderRadius: 1.5,
                                border: `1px solid ${active ? colors.primary : colors.line}`,
                                bgcolor: active ? colors.primarySoft : '#fff',
                                color: active ? colors.primaryDark : colors.text,
                                textTransform: 'none',
                                fontSize: 14,
                                minHeight: 40,
                                '&:hover': { bgcolor: active ? colors.primarySoft : colors.soft }
                              }}
                            >
                              {symptom}
                            </Button>
                          );
                        })}
                      </Stack>
                    </Box>
                  ))}
                </Stack>
              </Box>

              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ width: '100%' }}>
                <Box
                  sx={{
                    flex: 1,
                    p: 3,
                    borderRadius: 2,
                    border: `1px solid ${colors.line}`,
                    bgcolor: colors.paper, // Changed back to paper to be a distinct card
                    boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
                  }}
                >
                  <Typography sx={{ color: colors.text, fontSize: 15, fontWeight: 600, lineHeight: 1.3 }}>
                    How long have you had these symptoms?
                  </Typography>
                  <Stack spacing={1.5} sx={{ mt: 2 }}>
                    {durationOptions.map((item) => (
                      <Button
                        key={item}
                        onClick={() => setDuration(item)}
                        sx={{
                          justifyContent: 'flex-start',
                          px: 2,
                          py: 1,
                          borderRadius: 1.5,
                          border: `1px solid ${duration === item ? colors.primary : colors.line}`,
                          bgcolor: duration === item ? colors.primarySoft : '#fff',
                          color: duration === item ? colors.primaryDark : colors.text,
                          textTransform: 'none',
                          fontSize: 14,
                          fontWeight: duration === item ? 600 : 400
                        }}
                      >
                        {item}
                      </Button>
                    ))}
                  </Stack>
                </Box>

                <Box
                  sx={{
                    flex: 1,
                    p: 3,
                    borderRadius: 2,
                    border: `1px solid ${colors.line}`,
                    bgcolor: colors.paper,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
                  }}
                >
                  <Typography sx={{ color: colors.text, fontSize: 15, fontWeight: 600, lineHeight: 1.3 }}>
                    How severe are your symptoms?
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ mt: 3, mb: 2 }}>
                    {[0, 1, 2].map((index) => (
                      <Box
                        key={index}
                        sx={{
                          flex: 1,
                          height: 8,
                          borderRadius: 1,
                          bgcolor: severityBars[severity][index] ? colors.warning : colors.soft
                        }}
                      />
                    ))}
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    {severityOptions.map((item) => (
                      <Button 
                        key={item}
                        onClick={()=>setSeverity(item)}
                        autoCapitalize="none"
                        sx={{ p: 0, minWidth: 'auto', textTransform: 'none', color: severity === item ? colors.warning : colors.muted, fontSize: 13, fontWeight: severity === item ? 600 : 400 }}
                      >
                        {item}
                      </Button>
                    ))}
                  </Stack>
                  <Typography sx={{ mt: 2, color: colors.warning, fontSize: 14, fontWeight: 600, textAlign: 'center' }}>
                    {severity} selected
                  </Typography>
                </Box>
              </Stack>

              <Button
                onClick={handleSubmit}
                disabled={loading || (!selected.length && !input.trim())}
                startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <SearchIcon />}
                sx={{
                  mt: 1,
                  width: { xs: '100%', md: 'fit-content' },
                  alignSelf: 'center',
                  px: 6,
                  py: 1.25,
                  borderRadius: 1.5,
                  bgcolor: colors.primary,
                  color: '#fff',
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: 16,
                  boxShadow: '0 4px 12px rgba(26,115,232,0.2)',
                  '&:hover': { bgcolor: colors.primaryDark, boxShadow: '0 6px 16px rgba(26,115,232,0.3)' },
                  '&:disabled': { bgcolor: colors.line, color: colors.muted }
                }}
              >
                {loading ? 'Analysing...' : 'Analyse Symptoms with AI'}
              </Button>

              {result && (
                <Box
                  sx={{
                    p: 4,
                    borderRadius: 2,
                    border: `1px solid ${colors.primaryDark}`,
                    bgcolor: colors.primarySoft,
                    boxShadow: '0 4px 12px rgba(26,115,232,0.1)'
                  }}
                >
                  <Typography sx={{ fontSize: 20, fontWeight: 600, color: colors.primaryDark, mb: 1 }}>AI Analysis Result</Typography>
                  <Typography sx={{ color: colors.primaryDark, fontSize: 14, mb: 3 }}>
                    Source: {result.aiUsed || result.source}
                  </Typography>
                  
                  <Box sx={{ p: 3, bgcolor: '#fff', borderRadius: 1.5, mb: 3, border: `1px solid ${colors.line}` }}>
                    <Typography sx={{ fontSize: 16, fontWeight: 600, color: colors.text, mb: 1 }}>
                      Possible Conditions:
                    </Typography>
                    <Typography sx={{ fontSize: 15, color: colors.muted, mb: 2 }}>
                      {result.prediction.conditions.join(', ')}
                    </Typography>
                    <Typography sx={{ fontSize: 16, fontWeight: 600, color: colors.text, mb: 1 }}>
                      Severity Level:
                    </Typography>
                    <Chip 
                      label={result.prediction.severity.toUpperCase()} 
                      size="small" 
                      sx={{ 
                        bgcolor: result.prediction.severity === 'high' ? colors.dangerSoft : result.prediction.severity === 'medium' ? colors.warningSoft : colors.successSoft,
                        color: result.prediction.severity === 'high' ? colors.danger : result.prediction.severity === 'medium' ? colors.warning : colors.success,
                        fontWeight: 600,
                        borderRadius: 1
                      }} 
                    />
                  </Box>

                  <Typography sx={{ fontSize: 16, fontWeight: 600, color: colors.primaryDark, mb: 1 }}>Advice:</Typography>
                  <Typography sx={{ color: colors.text, fontSize: 15, lineHeight: 1.6, mb: 3 }}>
                    {result.prediction.advice}
                  </Typography>

                  {(result.immediateConsult || result.prediction.severity === 'medium' || result.prediction.severity === 'high') && (
                    <Button
                      onClick={() => navigate('/patient')}
                      sx={{
                        px: 4,
                        py: 1.25,
                        borderRadius: 1.5,
                        bgcolor: colors.primary,
                        color: '#fff',
                        textTransform: 'none',
                        fontSize: 15,
                        fontWeight: 600,
                        boxShadow: '0 2px 4px rgba(26,115,232,0.2)',
                        '&:hover': { bgcolor: colors.primaryDark }
                      }}
                    >
                      Book Consultation Now
                    </Button>
                  )}
                </Box>
              )}
            </Box>

              <Stack spacing={3} sx={{ width: { xs: '100%', lg: 330 }, flexShrink: 0 }}>
                <Box
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    border: `1px solid ${colors.line}`,
                    bgcolor: colors.paper,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
                  }}
                >
                  <Typography sx={{ fontSize: 16, fontWeight: 600, color: colors.text, mb: 2 }}>Affected body area</Typography>
                  <Stack spacing={1}>
                    {bodyAreas.map((area, index) => {
                      const active = area === bodyArea;
                      return (
                        <Button
                          key={area}
                          onClick={() => setBodyArea(area)}
                          sx={{
                            justifyContent: 'flex-start',
                            px: 2,
                            py: 1,
                            borderRadius: 1.5,
                            border: `1px solid ${active ? colors.primary : 'transparent'}`,
                            bgcolor: active ? colors.primarySoft : 'transparent',
                            color: active ? colors.primaryDark : colors.text,
                            textTransform: 'none',
                            fontSize: 14,
                            fontWeight: active ? 600 : 400,
                            '&:hover': { bgcolor: active ? colors.primarySoft : colors.soft }
                          }}
                        >
                          {area}
                        </Button>
                      );
                    })}
                  </Stack>
                </Box>

                <Box
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    border: `1px solid ${colors.line}`,
                    bgcolor: colors.paper,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
                  }}
                >
                  <Typography sx={{ fontSize: 16, fontWeight: 600, color: colors.text, mb: 2 }}>Common illnesses</Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: 1.5 }}>
                    {commonIllnesses.map(([title, desc]) => (
                      <Box
                        key={title}
                        sx={{
                          p: 2,
                          borderRadius: 1.5,
                          border: `1px solid ${colors.line}`,
                          bgcolor: colors.soft
                        }}
                      >
                        <Typography sx={{ fontSize: 14, fontWeight: 600, color: colors.text }}>{title}</Typography>
                        <Typography sx={{ mt: 0.5, color: colors.muted, fontSize: 13, lineHeight: 1.4 }}>
                          {desc}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>

              </Stack>
            </Stack>




          </Box>
        </Stack>

        {showHistory && (
           <Box sx={{ mt: 4, p: 3, borderRadius: 2, border: `1px solid ${colors.line}`, bgcolor: '#fff' }}>
              <Typography sx={{ fontSize: 18, fontWeight: 600, mb: 3 }}>Your Past Reports</Typography>
              {history.length > 0 ? (
                 <Stack spacing={2}>
                    {history.map(log => (
                       <Box key={log._id} sx={{ p: 2, borderRadius: 1.5, border: `1px solid ${colors.soft}`, bgcolor: colors.bg }}>
                          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                             <Typography sx={{ fontSize: 13, fontWeight: 600, color: colors.muted }}>{new Date(log.createdAt).toLocaleDateString()} at {new Date(log.createdAt).toLocaleTimeString()}</Typography>
                             <Chip label={log.severity.toUpperCase()} size="small" sx={{ 
                                bgcolor: log.severity === 'high' ? colors.dangerSoft : log.severity === 'medium' ? colors.warningSoft : colors.successSoft,
                                color: log.severity === 'high' ? colors.danger : log.severity === 'medium' ? colors.warning : colors.success,
                                fontWeight: 700, fontSize: 10
                             }} />
                          </Stack>
                          <Typography sx={{ fontSize: 15, fontWeight: 600, mb: 0.5 }}>Symptoms: {log.symptoms.join(', ')}</Typography>
                          <Typography sx={{ fontSize: 14, color: colors.text, mb: 1 }}>Predicted: {log.predictedConditions.join(', ')}</Typography>
                          <Typography sx={{ fontSize: 13, color: colors.muted, fontStyle: 'italic' }}>{log.advice}</Typography>
                       </Box>
                    ))}
                 </Stack>
              ) : (
                 <Box sx={{ py: 4, textAlign: 'center' }}>
                    <TimelineIcon sx={{ fontSize: 40, color: colors.gray, mb: 1.5 }} />
                    <Typography sx={{ color: colors.muted }}>No past reports found.</Typography>
                 </Box>
              )}
           </Box>
        )}
      </Box>
    </PatientShell>
  );
}
