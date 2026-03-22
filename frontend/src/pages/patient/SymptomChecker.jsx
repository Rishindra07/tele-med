import React, { useMemo, useState } from 'react';
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
  NotificationsNoneRounded as NotificationIcon,
  SearchRounded as SearchIcon,
  InfoOutlined as InfoIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { checkSymptoms } from '../../api/symptomApi';
import PatientShell from '../../components/patient/PatientShell';

const colors = {
  paper: '#fffdf8',
  line: '#d8d0c4',
  soft: '#e9e2d8',
  text: '#2c2b28',
  muted: '#8b857d',
  green: '#26a37c',
  greenSoft: '#dff3eb',
  blue: '#4a90e2',
  blueSoft: '#d9ebff',
  amber: '#d18a1f',
  amberSoft: '#fbefdc',
  red: '#de5a59',
  redSoft: '#fdeaea'
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

const historyChecks = [
  ['Fever · Headache · Chills', 'Today · Moderate concern', 'Viral fever likely', colors.amber, colors.amberSoft],
  ['Cough · Sore throat', '10 Mar 2026 · Mild', 'Common cold', colors.green, colors.greenSoft],
  ['Chest pain · Shortness of breath', '2 Mar 2026 · High concern', 'Doctor consulted', colors.red, colors.redSoft]
];

const durationOptions = ['Today', '2–3 days', '1 week', '2+ weeks'];
const severityOptions = ['Mild', 'Moderate', 'Severe'];

export default function SymptomChecker() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(['Fever', 'Headache', 'Chills']);
  const [bodyArea, setBodyArea] = useState('Chest & Lungs');
  const [duration, setDuration] = useState('2–3 days');
  const [severity, setSeverity] = useState('Moderate');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState(
    "I have a headache and fever since yesterday"
  );

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
    const payload = selected.length ? selected.map((item) => item.toLowerCase()) : input.split(' ').filter(Boolean);
    if (!payload.length) return;

    try {
      setLoading(true);
      const res = await checkSymptoms(payload);
      setResult(res);
    } catch (error) {
      alert(error.message);
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
      <Box sx={{ px: { xs: 2, md: 4, xl: 5 }, py: { xs: 3, md: 4 } }}>
        <Stack
          direction={{ xs: 'column', lg: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', lg: 'center' }}
          spacing={2}
          sx={{ mb: 3 }}
        >
          <Box>
            <Typography sx={{ fontSize: { xs: 36, md: 46 }, fontFamily: 'Georgia, serif', lineHeight: 1.05 }}>
              Symptom Checker
            </Typography>
            <Typography sx={{ mt: 1, color: colors.muted, fontSize: 18, maxWidth: 470, lineHeight: 1.2 }}>
              Describe your symptoms to get AI-powered health guidance
            </Typography>
          </Box>

          <Stack direction="row" spacing={1.5} alignItems="center" useFlexGap flexWrap="wrap">
            <Box
              sx={{
                px: 2.5,
                py: 1.25,
                borderRadius: 4,
                border: `1px solid ${colors.line}`,
                bgcolor: '#f7f3ea',
                fontSize: 17,
                lineHeight: 1.15
              }}
            >
              {new Date().toLocaleDateString('en-GB', {
                weekday: 'short',
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </Box>
            <Button
              sx={{
                minWidth: 48,
                width: 48,
                height: 48,
                borderRadius: 3,
                border: `1px solid ${colors.line}`,
                bgcolor: '#fff',
                color: colors.text,
                position: 'relative'
              }}
            >
              <NotificationIcon />
              <Box
                sx={{
                  position: 'absolute',
                  top: 12,
                  right: 12,
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: colors.red
                }}
              />
            </Button>
          </Stack>
        </Stack>

        <Box
          sx={{
            p: 2.2,
            borderRadius: 3.5,
            border: '1px solid #9dcbff',
            bgcolor: colors.blueSoft,
            mb: 3
          }}
        >
          <Stack direction="row" spacing={1.6} alignItems="flex-start">
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: 2,
                bgcolor: '#b8d9ff',
                display: 'grid',
                placeItems: 'center',
                color: '#1f5fae',
                flexShrink: 0
              }}
            >
              <InfoIcon fontSize="small" />
            </Box>
            <Box>
              <Typography sx={{ fontSize: 17, color: '#1f5fae' }}>
                For guidance only — not a medical diagnosis
              </Typography>
              <Typography sx={{ mt: 0.6, color: '#2461a8', fontSize: 15.2, lineHeight: 1.5 }}>
                This AI tool provides preliminary suggestions based on your symptoms. Always consult a qualified doctor before taking any medication or making health decisions.
              </Typography>
            </Box>
          </Stack>
        </Box>

        <Stack direction="row" spacing={1.2} useFlexGap flexWrap="wrap" sx={{ mb: 3 }}>
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
                py: 1.2,
                borderRadius: 999,
                border: `1px solid ${active ? colors.green : colors.line}`,
                bgcolor: index === 1 ? colors.green : active ? colors.greenSoft : '#fff',
                color: index === 1 ? '#fff' : active ? colors.greenDark || colors.green : '#a09a92',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                minHeight: 58
              }}
            >
              <Box
                sx={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  bgcolor: index === 1 ? 'rgba(255,255,255,0.18)' : active ? colors.green : '#f3efe7',
                  color: index === 1 ? '#fff' : active ? '#fff' : '#a09a92',
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: 14
                }}
              >
                {index === 0 ? <CheckIcon sx={{ fontSize: 16 }} /> : step}
              </Box>
              <Typography sx={{ fontSize: 15.5, lineHeight: 1.1 }}>{label}</Typography>
            </Box>
          ))}
        </Stack>

        <Stack direction={{ xs: 'column', xl: 'row' }} spacing={3} alignItems="flex-start">
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack direction={{ xs: 'column', lg: 'row' }} spacing={3} alignItems="flex-start">
              <Box
                sx={{
                  flex: 1,
                  width: '100%',
                  p: 2.5,
                  borderRadius: 3.5,
                  border: `1px solid ${colors.line}`,
                  bgcolor: colors.paper
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                  <Typography sx={{ fontSize: 18, lineHeight: 1.2 }}>Describe your symptoms</Typography>
                  <Button onClick={clearAll} sx={{ color: colors.green, textTransform: 'none', fontSize: 14.5 }}>
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
                    mt: 2,
                    width: '100%',
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2.5,
                      bgcolor: '#fff'
                    }
                  }}
                />

                <Typography sx={{ mt: 2, color: colors.muted, fontSize: 15 }}>Selected symptoms</Typography>
                <Box sx={{ mt: 1, p: 1.3, borderRadius: 2.5, bgcolor: '#f3f0e9' }}>
                  <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                    {selected.length ? (
                      selected.map((symptom) => (
                        <Chip
                          key={symptom}
                          label={symptom}
                          onDelete={() => toggleSymptom(symptom)}
                          sx={{
                            bgcolor: colors.green,
                            color: '#fff',
                            '& .MuiChip-deleteIcon': { color: '#fff' }
                          }}
                        />
                      ))
                    ) : (
                      <Typography sx={{ color: colors.muted, fontSize: 14.5 }}>No symptoms selected yet.</Typography>
                    )}
                  </Stack>
                </Box>

                <Stack spacing={2.2} sx={{ mt: 2.2 }}>
                  {Object.entries(symptomGroups).map(([group, items]) => (
                    <Box key={group}>
                      <Typography sx={{ color: colors.muted, fontSize: 15, mb: 1 }}>{group}</Typography>
                      <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                        {items.map((symptom) => {
                          const active = selected.includes(symptom);
                          return (
                            <Button
                              key={symptom}
                              onClick={() => toggleSymptom(symptom)}
                              sx={{
                                px: 2,
                                py: 0.7,
                                borderRadius: 999,
                                border: `1px solid ${active ? colors.green : colors.line}`,
                                bgcolor: active ? colors.greenSoft : '#fff',
                                color: active ? colors.green : '#5f5a52',
                                textTransform: 'none',
                                fontSize: 15,
                                minHeight: 40
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

              <Stack spacing={3} sx={{ width: { xs: '100%', lg: 330 }, flexShrink: 0 }}>
                <Box
                  sx={{
                    p: 2.5,
                    borderRadius: 3.5,
                    border: `1px solid ${colors.line}`,
                    bgcolor: colors.paper
                  }}
                >
                  <Typography sx={{ fontSize: 18, mb: 2 }}>Affected body area</Typography>
                  <Stack spacing={1.1}>
                    {bodyAreas.map((area, index) => {
                      const active = area === bodyArea || index < 3;
                      return (
                        <Button
                          key={area}
                          onClick={() => setBodyArea(area)}
                          sx={{
                            justifyContent: 'flex-start',
                            px: 2,
                            py: 1,
                            borderRadius: 2.2,
                            border: `1px solid ${active ? colors.green : colors.line}`,
                            bgcolor: active ? '#eef9f4' : '#fff',
                            color: active ? '#235d4d' : '#5f5a52',
                            textTransform: 'none',
                            fontSize: 15
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
                    p: 2.5,
                    borderRadius: 3.5,
                    border: `1px solid ${colors.line}`,
                    bgcolor: colors.paper
                  }}
                >
                  <Typography sx={{ fontSize: 18, mb: 2 }}>Common illnesses</Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1.2 }}>
                    {commonIllnesses.map(([title, desc]) => (
                      <Box
                        key={title}
                        sx={{
                          p: 1.5,
                          borderRadius: 2.5,
                          border: `1px solid ${colors.line}`,
                          bgcolor: '#fff'
                        }}
                      >
                        <Typography sx={{ fontSize: 15.5, lineHeight: 1.15 }}>{title}</Typography>
                        <Typography sx={{ mt: 0.6, color: colors.muted, fontSize: 13.5, lineHeight: 1.25 }}>
                          {desc}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>

                <Box
                  sx={{
                    p: 2.5,
                    borderRadius: 3.5,
                    border: `1px solid ${colors.line}`,
                    bgcolor: colors.paper
                  }}
                >
                  <Typography sx={{ fontSize: 18, mb: 2 }}>Past symptom checks</Typography>
                  <Stack spacing={1.5}>
                    {historyChecks.map(([title, meta, tag, dot, bg]) => (
                      <Box key={title} sx={{ pt: 0.5, borderTop: `1px solid ${colors.soft}`, '&:first-of-type': { pt: 0, borderTop: 'none' } }}>
                        <Stack direction="row" spacing={1.1} alignItems="flex-start">
                          <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: dot, mt: 0.8 }} />
                          <Box>
                            <Typography sx={{ fontSize: 15.5 }}>{title}</Typography>
                            <Typography sx={{ color: colors.muted, fontSize: 13.8, mt: 0.25 }}>{meta}</Typography>
                            <Chip label={tag} sx={{ mt: 0.8, bgcolor: bg, color: dot, fontSize: 13 }} />
                          </Box>
                        </Stack>
                      </Box>
                    ))}
                  </Stack>
                </Box>
              </Stack>
            </Stack>

            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mt: 3 }}>
              <Box
                sx={{
                  width: { xs: '100%', md: 210 },
                  p: 2,
                  borderRadius: 3,
                  border: `1px solid ${colors.line}`,
                  bgcolor: colors.paper
                }}
              >
                <Typography sx={{ color: colors.muted, fontSize: 15, lineHeight: 1.15 }}>
                  How long have you had these symptoms?
                </Typography>
                <Stack spacing={1.2} sx={{ mt: 1.5 }}>
                  {durationOptions.map((item) => (
                    <Button
                      key={item}
                      onClick={() => setDuration(item)}
                      sx={{
                        justifyContent: 'flex-start',
                        px: 1.6,
                        py: 0.8,
                        borderRadius: 999,
                        border: `1px solid ${duration === item ? colors.green : colors.line}`,
                        bgcolor: duration === item ? colors.greenSoft : '#fff',
                        color: duration === item ? colors.green : '#5f5a52',
                        textTransform: 'none',
                        fontSize: 15
                      }}
                    >
                      {item}
                    </Button>
                  ))}
                </Stack>
              </Box>

              <Box
                sx={{
                  width: { xs: '100%', md: 220 },
                  p: 2,
                  borderRadius: 3,
                  border: `1px solid ${colors.line}`,
                  bgcolor: colors.paper
                }}
              >
                <Typography sx={{ color: colors.muted, fontSize: 15, lineHeight: 1.15 }}>
                  How severe are your symptoms?
                </Typography>
                <Stack direction="row" spacing={0.7} sx={{ mt: 2, mb: 1 }}>
                  {[0, 1, 2].map((index) => (
                    <Box
                      key={index}
                      sx={{
                        width: 18,
                        height: 8,
                        borderRadius: 999,
                        bgcolor: severityBars[severity][index] ? colors.amber : '#eee8db'
                      }}
                    />
                  ))}
                </Stack>
                <Stack direction="row" spacing={1.1}>
                  {severityOptions.map((item) => (
                    <Typography key={item} sx={{ color: colors.muted, fontSize: 13.5 }}>
                      {item}
                    </Typography>
                  ))}
                </Stack>
                <Typography sx={{ mt: 1.2, color: colors.amber, fontSize: 15 }}>
                  {severity} selected
                </Typography>
              </Box>
            </Stack>

            <Button
              onClick={handleSubmit}
              disabled={loading || (!selected.length && !input.trim())}
              startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <SearchIcon />}
              sx={{
                mt: 2.5,
                px: 3,
                py: 1.45,
                borderRadius: 2.5,
                border: `1px solid ${colors.line}`,
                bgcolor: '#fff',
                color: colors.text,
                textTransform: 'none',
                fontSize: 18,
                minWidth: 245
              }}
            >
              {loading ? 'Analysing...' : 'Analyse Symptoms with AI'}
            </Button>

            {result && (
              <Box
                sx={{
                  mt: 2.5,
                  p: 2.5,
                  borderRadius: 3.5,
                  border: `1px solid ${colors.line}`,
                  bgcolor: colors.paper
                }}
              >
                <Typography sx={{ fontSize: 18, mb: 1.2 }}>AI result</Typography>
                <Typography sx={{ color: colors.muted, fontSize: 14.8 }}>
                  Source: {result.aiUsed || result.source}
                </Typography>
                <Typography sx={{ mt: 1.2, fontSize: 15.5 }}>
                  Condition: {result.prediction.conditions.join(', ')}
                </Typography>
                <Typography sx={{ mt: 0.8, fontSize: 15.5 }}>
                  Severity: {result.prediction.severity}
                </Typography>
                <Typography sx={{ mt: 1.2, color: '#5c564f', fontSize: 15.2, lineHeight: 1.6 }}>
                  {result.prediction.advice}
                </Typography>
                {(result.immediateConsult || result.prediction.severity === 'medium') && (
                  <Button
                    onClick={() => navigate('/patient')}
                    sx={{
                      mt: 2,
                      px: 2.5,
                      py: 1,
                      borderRadius: 2.5,
                      bgcolor: colors.green,
                      color: '#fff',
                      textTransform: 'none',
                      fontSize: 15.5
                    }}
                  >
                    Book Appointment
                  </Button>
                )}
              </Box>
            )}
          </Box>
        </Stack>
      </Box>
    </PatientShell>
  );
}
