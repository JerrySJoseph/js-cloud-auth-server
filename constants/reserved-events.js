const events = {
  event_connect: "connection",
  event_disconnect: "disconnect",
};

function getEventFor(propName) {
  return events[propName];
}

function isReservedEvent(propName) {
  return Object.keys(events).some((key) => key === propName);
}

module.exports = { getEventFor, isReservedEvent };
