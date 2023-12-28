export const subEventsCountHandler = (events) => {
  var numberOfSubEvents = 0;
  events?.map((event) => {
    if (!event?.isDeleted) {
      if (event?.time?.length > 0) numberOfSubEvents = numberOfSubEvents + event?.time?.length;
      else if (event?.time?.length === 0 || !event?.time) {
        numberOfSubEvents = numberOfSubEvents + 1;
      }
    }
  });
  return numberOfSubEvents;
};
