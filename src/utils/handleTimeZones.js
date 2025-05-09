import moment from 'moment';
import { timeZones } from '../constants/calendarSettingsForm';

// Convert offset string like "-05:00" to minutes
function offsetStringToMinutes(offsetStr) {
  const sign = offsetStr.startsWith('-') ? -1 : 1;
  const [hours, minutes] = offsetStr.slice(1).split(':').map(Number);
  return sign * (hours * 60 + minutes);
}

// Define priority for best match (most preferred first)
const timezonePriority = [
  'Canada/Eastern',
  'Canada/Central',
  'Canada/Atlantic',
  'Canada/Newfoundland',
  'Canada/Mountain',
  'Canada/Pacific',
  'Canada/Yukon',
  'Canada/Saskatchewan',
  'America/Blanc-Sablon',
  'America/Coral_Harbour',
];

export function identifyBestTimezone(timestamp) {
  const offsetStr = moment.parseZone(timestamp).format('Z');
  const offsetInMinutes = offsetStringToMinutes(offsetStr);

  const matchingZones = timeZones.filter((tz) => tz.offset === offsetInMinutes);

  for (const preferred of timezonePriority) {
    const match = matchingZones.find((tz) => tz.value === preferred);
    if (match) return match;
  }

  // Fallback: return first match if none in priority list
  return matchingZones[0] || null;
}
