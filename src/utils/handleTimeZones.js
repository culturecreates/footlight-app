import moment from 'moment-timezone';
import { timeZones } from '../constants/calendarSettingsForm';

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
  'Asia/Tokyo',
];

export function identifyBestTimezone(timestamp) {
  const targetOffset = moment.parseZone(timestamp).utcOffset(); // in minutes

  const matchingZones = timeZones.filter((tz) => {
    const zoneOffset = moment.tz(timestamp, tz.value).utcOffset(); // dynamic offset at this time
    return zoneOffset === targetOffset;
  });

  for (const preferred of timezonePriority) {
    const match = matchingZones.find((tz) => tz.value === preferred);
    if (match) return match;
  }

  return matchingZones[0] || null;
}

export function getLabelByTimezoneValue(value) {
  const tz = timeZones.find((tz) => tz.value === value);
  return tz ? tz.label : null;
}
