/**
 * Calculates the consultation status based on appointment date, time slot, and core status.
 * @param {Object} appt - The appointment object.
 * @returns {Object} { status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled' | 'missed', label: string, isJoinNear: boolean }
 */
export const getConsultationStatus = (appt) => {
  if (!appt) return { status: 'upcoming', label: 'TBD', isJoinNear: false };

  const rawStatus = (appt.status || 'Scheduled').toLowerCase();
  
  if (rawStatus.includes('complete')) return { status: 'completed', label: 'Completed', isJoinNear: false };
  if (rawStatus.includes('cancel')) return { status: 'cancelled', label: 'Cancelled', isJoinNear: false };
  
  if (!appt.appointmentDate || !appt.timeSlot) {
    return { status: 'upcoming', label: 'TBD', isJoinNear: false };
  }

  const now = new Date();
  const apptDate = new Date(appt.appointmentDate);
  
  // Handle 12h or 24h formats
  let hours = 0;
  let minutes = 0;
  const timeStr = String(appt.timeSlot).toUpperCase();
  
  if (timeStr.includes('AM') || timeStr.includes('PM')) {
    const [time, modifier] = timeStr.split(' ');
    let [h, m] = time.split(':').map(Number);
    if (modifier === 'PM' && h < 12) h += 12;
    if (modifier === 'AM' && h === 12) h = 0;
    hours = h;
    minutes = m;
  } else {
    const parts = timeStr.split(':').map(Number);
    hours = parts[0] || 0;
    minutes = parts[1] || 0;
  }
  
  const targetTime = new Date(apptDate);
  targetTime.setHours(hours, minutes, 0, 0);

  const diffMs = targetTime - now;

  // Ongoing: From 10 mins before till 1 hour after
  if (diffMs <= 10 * 60 * 1000 && diffMs > -60 * 60 * 1000) {
    return { status: 'ongoing', label: 'Live Now', isJoinNear: true };
  }
  
  // Missed: past 1 hour and not completed/cancelled
  if (diffMs <= -60 * 60 * 1000) {
     return { status: 'missed', label: 'Missed', isJoinNear: false };
  }

  // Upcoming:
  const isJoinNear = diffMs <= 10 * 60 * 1000;
  const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  
  let label = '';
  if (diffHrs >= 24) {
    label = `Starts in ${Math.floor(diffHrs / 24)}d ${diffHrs % 24}h`;
  } else if (diffHrs > 0) {
    label = `Starts in ${diffHrs}h ${diffMins}m`;
  } else {
    label = `Starts in ${diffMins}m`;
  }

  return { status: 'upcoming', label, isJoinNear };
};
