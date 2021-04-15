/**
 * NOTE: Create only one instance of this class to maintain consistency of users, sockets and id mapping
 */

let userBase = {};
let deviceBase = {};

function addDevice(deviceID, socketID) {
  deviceBase[deviceID] = socketID;
}

function removeDevice(deviceID) {
  delete deviceBase[deviceID];
}

function registerUserToDevice(deviceID, userID) {
  userBase[userID] = deviceID;
}

function removeUserFromDevice(userID) {
  delete userBase[userID];
}

function getSocketIdFor(userID) {
  return deviceBase[userBase[userID]];
}

function getDeviceIdFor(userID) {
  return userBase[userID];
}

module.exports = {
  registerUserToDevice,
  removeUserFromDevice,
  removeDevice,
  addDevice,
  getSocketIdFor,
  getDeviceIdFor,
};
