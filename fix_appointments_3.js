const fs = require('fs');
const path = 'c:\\sevaTelehealth\\frontend\\src\\pages\\patient\\PatientAppointments.jsx';
let content = fs.readFileSync(path, 'utf8');

const regex = /fetchAppointments\(\);\s*}\s*,\s*\[\]\s*\);/;
const match = content.match(regex);

const newEffectCode = `

  useEffect(() => {
    const getSlots = async () => {
      if (!newDate || !selectedAppt?.doctorId) return;
      setSlotsLoading(true);
      try {
        const res = await fetchDoctorSlots(selectedAppt.doctorId, newDate);
        if (res.success) {
          setAvailableSlots(res.slots || []);
        }
      } catch (err) {
        console.error('Error fetching slots:', err);
        setAvailableSlots([]);
      } finally {
        setSlotsLoading(false);
      }
    };
    getSlots();
  }, [newDate, selectedAppt]);`;

if (match) {
    content = content.replace(match[0], match[0] + newEffectCode);
}

fs.writeFileSync(path, content);
console.log('File updated');
