//import requires dependencies
const gSign = require("../google-sign");
const buildProfile = require("../models/profile");
const userStore = require("../data-access/profile/user-store");
const tokenStore = require("../data-access/token/token-store");

let userBase = {};
let deviceBase= {};
//Auth - flow Google
function handleGoogleSignIn({idToken,device}) {
  return new Promise(async (resolve, reject) => {
    try {
      const payload = await gSign.verifyToken(idToken);
      if (payload) {
        const profile = buildProfile({
          name: payload["name"],
          email: payload["email"],
          photoUrl: payload["picture"],
          isVerified: payload["email_verified"],
          authType: "Google",
          createdAt: new Date(),
        });
        const user = await userStore.signInOrCreate(profile);
        registerUserToDevice(device["clientID"], user["_id"]);
        resolve(user);
      }
    } catch (error) {
      reject(error);
    }
  });
}

//Auth-Floe update User
function handleUserUpdate(id, profile) {
  return new Promise(async (resolve, reject) => {
    try {
      const result = await userStore.updateProfile(id, profile);
      resolve(result.value);
    } catch (error) {
      reject(error);
    }
  });
}

//Auth- flow Email
async function handleEmailSignIn(data) {
  const { authMode ,device} = data;
  let user = null;

  return new Promise(async (resolve, reject) => {
    try {
      if (authMode === "SIGN_IN") {
        user = await userStore.signInEmail(data["user"]);
      } else if (authMode === "CREATE") {
        user = await userStore.createUserEmail(data["user"]);
      }

      if (user) {
        registerUserToDevice(device["clientID"], user["_id"]);
        resolve(user);
      } else
        reject({
          message: "Unknown Error",
        });
    } catch (error) {
      reject(error);
    }
  });
}

async function handleDelete(user) {}

//SignOut
async function handleSignOut(_id, ack) {
  return tokenStore
    .singOut(_id)
    .then((result) => ack("user signed out", true))
    .catch((error) => ack(error["message"], false));
}

async function handleClientHandshake(data, ack,socket) {
  return new Promise(async (resolve, reject) => {
    try {
      const userData = JSON.parse(data);
      addDevice(userData['clientID'],socket.id);
      ack(true,'Device synced with server');
    } catch (error) {
      reject(error);
    }
  });
}
function addDevice(deviceID,socketID)
{
  deviceBase[deviceID]=socketID;
   console.log("device base");
   console.log(deviceBase);
}
function removeDevice(deviceID)
{
  delete deviceBase[deviceID];
  console.log("device base");
  console.log(deviceBase);
}
function registerUserToDevice(deviceID,userID)
{
  userBase[userID]=deviceID;
  console.log('user base');
  console.log(userBase);
}
function removeUserFromDevice(userID)
{
  delete userBase[userID];
  console.log("user base");
  console.log(userBase);
  
}

function getSocketIdFor(userID)
{
  return deviceBase[userBase[userID]];
}

module.exports = {
  handleEmailSignIn,
  handleGoogleSignIn,
  handleSignOut,
  handleUserUpdate,
  handleClientHandshake,
  registerUserToDevice,
  removeUserFromDevice,
  removeDevice,
  addDevice,
  getSocketIdFor
};
