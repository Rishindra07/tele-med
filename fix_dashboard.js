const fs = require('fs');
const path = 'c:\\sevaTelehealth\\frontend\\src\\pages\\patient\\PatientDashboard.jsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(/onClick=\{\(\) => setSelectedSlot\(slot\)\}/g, 'onClick={() => setSelectedSlot(slot.time)}');
content = content.replace(/selectedSlot === slot/g, 'selectedSlot === slot.time');

// Check handleBookAppointment too
content = content.replace(
  'setSlots((prev) => prev.filter((slot) => slot !== selectedSlot));',
  'setSlots((prev) => prev.map((s) => s.time === selectedSlot ? { ...s, isBooked: true } : s));'
);

fs.writeFileSync(path, content);
console.log('File updated');
