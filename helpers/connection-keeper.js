/**
 * NOTE: Create only one instance of this class to maintain consistency of users, sockets and id mapping
 */

let userBase = {};
let deviceBase = {};

function addDevice(deviceID, socketID) {
  deviceBase[deviceID] = socketID;
  console.log("device base");
  console.log(deviceBase);
}
function removeDevice(deviceID) {
  delete deviceBase[deviceID];
  console.log("device base");
  console.log(deviceBase);
}
function registerUserToDevice(deviceID, userID) {
  userBase[userID] = deviceID;
  console.log("user base");
  console.log(userBase);
}
function removeUserFromDevice(userID) {
  delete userBase[userID];
  console.log("user base");
  console.log(userBase);
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
