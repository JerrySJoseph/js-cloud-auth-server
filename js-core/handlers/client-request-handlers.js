const deviceStore = require("../helpers/device-store");

function handleClientHandshake(data, ack, socketID) {
  const { clientID } = JSON.parse(data);
  try {
    deviceStore.getInstance().addDevice(clientID, socketID);
    ack(true, "Device synced with server");
  } catch (error) {
    ack(false, error.message);
  }
}

module.exports = {
  handleClientHandshake,
};
