export function groupEventsByDate(events) {
  if (events) {
    const groupedEvents = {};

    // Group events by startDate
    events.forEach((event) => {
      if (!groupedEvents[event.startDate]) {
        groupedEvents[event.startDate] = [];
      }
      groupedEvents[event.startDate].push({ startTime: event.startTime, endTime: event.endTime });
    });

    // Convert groupedEvents object to array of objects
    const result = [];
    for (const startDate in groupedEvents) {
      result.push({
        startDate: startDate,
        customTimes: groupedEvents[startDate],
      });
    }

    return result;
  } else return [];
}
