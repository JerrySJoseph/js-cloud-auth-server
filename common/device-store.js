class DeviceStore {
  constructor() {
    if (!DeviceStore._instance) {
      DeviceStore._instance = this;
      this.deviceBase = {};
      this.userBase = {};
    }
    return DeviceStore._instance;
  }
  static getInstance() {
    return this._instance;
  }
  addDevice(deviceID, socketID) {
    this.deviceBase[deviceID] = socketID;
  }
  removeDevice(deviceID) {
    delete this.deviceBase[deviceID];
  }
  showDevices() {
    console.log(this.deviceBase);
  }
  registerUserToDevice(deviceID, userID) {
    this.userBase[userID] = deviceID;
  }
  removeUserFromDevice(userID) {
    delete this.userBase[userID];
  }
  getSocketIdFor(userID) {
    return this.deviceBase[this.userBase[userID]];
  }
  getDeviceIdFor(userID) {
    return this.userBase[userID];
  }
}

module.exports = DeviceStore;
