const fs = require('fs');
const path = 'c:\\sevaTelehealth\\frontend\\src\\pages\\patient\\PatientAppointments.jsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Add doctorId to normalized object
const oldIdLine = 'id: appointment._id || `appointment-${index}`,';
const newIdLine = 'id: appointment._id || `appointment-${index}`,\n        doctorId: appointment.doctor?._id || appointment.doctor,';
if (content.indexOf(oldIdLine) !== -1) {
    content = content.replace(oldIdLine, newIdLine);
}

// 2. Add new states
const oldStates = 'const [newSlot, setNewSlot] = useState(\'\');';
const newStates = 'const [newSlot, setNewSlot] = useState(\'\');\n  const [availableSlots, setAvailableSlots] = useState([]);\n  const [slotsLoading, setSlotsLoading] = useState(false);';
if (content.indexOf(oldStates) !== -1) {
    content = content.replace(oldStates, newStates);
}

// 3. Add handleRescheduleOpen change (clear slots)
const oldHandleOpen = 'setNewSlot(\'\');\n    setRescheduleOpen(true);';
const newHandleOpen = 'setNewSlot(\'\');\n    setAvailableSlots([]);\n    setRescheduleOpen(true);';
if (content.indexOf(oldHandleOpen) !== -1) {
    content = content.replace(oldHandleOpen, newHandleOpen);
}

// 4. Add useEffect for slots
const oldEffect = 'useEffect(() => {\n    fetchAppointments();\n  }, []);';
const newEffect = 'useEffect(() => {\n    fetchAppointments();\n  }, []);\n\n  useEffect(() => {\n    const getSlots = async () => {\n      if (!newDate || !selectedAppt?.doctorId) return;\n      setSlotsLoading(true);\n      try {\n        const res = await fetchDoctorSlots(selectedAppt.doctorId, newDate);\n        if (res.success) {\n          setAvailableSlots(res.slots || []);\n        }\n      } catch (err) {\n        console.error(\'Error fetching slots:\', err);\n        setAvailableSlots([]);\n      } finally {\n        setSlotsLoading(false);\n      }\n    };\n    getSlots();\n  }, [newDate, selectedAppt]);';

if (content.indexOf(oldEffect) !== -1) {
    content = content.replace(oldEffect, newEffect);
}

// 5. Update Dialog
const oldDialogContent = `<TextField
      label="New Time Slot (HH:mm)"
      placeholder="09:30"
      value={newSlot}
      onChange={(e) => setNewSlot(e.target.value)}
      fullWidth
    />`;

const newDialogContent = `{!newDate ? (\n            <Typography variant="caption" sx={{ color: colors.muted }}>Select a date first</Typography>\n          ) : slotsLoading ? (\n            <CircularProgress size={24} sx={{ mx: 'auto', my: 2 }} />\n          ) : availableSlots.length === 0 ? (\n            <Alert severity="warning" sx={{ fontSize: 13 }}>No slots available on this day</Alert>\n          ) : (\n            <TextField\n              select\n              label="Available Time Slots"\n              value={newSlot}\n              onChange={(e) => setNewSlot(e.target.value)}\n              fullWidth\n            >\n              {availableSlots.map((s) => (\n                <MenuItem key={s} value={s}>{s}</MenuItem>\n              ))}\n            </TextField>\n          )}`;

if (content.indexOf(oldDialogContent) !== -1) {
    content = content.replace(oldDialogContent, newDialogContent);
}

fs.writeFileSync(path, content);
console.log('File updated');
