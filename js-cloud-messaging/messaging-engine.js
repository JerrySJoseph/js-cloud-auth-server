const deviceStore = require("../common/device-store");
const exceptions = require("./exceptions/js-cm-exceptions");
let io = null;

async function begin(_io) {
  io = _io;
  return io;
}

function sendPayload(userID, eventName, payload) {
  const socketID = deviceStore.getInstance().getSocketIdFor(userID);
  io.to(socketID).emit(eventName, payload);
}

function notify(userID, title, message) {
  const payload = buildNotificationPayload(title, message);
  sendPayload(userID, "js-cloud-messaging-notify", JSON.stringify(payload));
  console.log("sent notif");
}
function buildNotificationPayload(title, message) {
  if (title === null || title.length < 1)
    throw new exceptions.NotificationBuilderError(
      "Notification title is not valid. Make sure you have a title for the notification"
    );
  if (message === null || message.length < 1)
    throw new exceptions.NotificationBuilderError(
      "Notification message is not valid. Make sure you have a message content for the notification"
    );
  return {
    title,
    message,
  };
}
module.exports = {
  begin,
  sendPayload,
  notify,
};
