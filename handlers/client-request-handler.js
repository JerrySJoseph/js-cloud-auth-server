//import requires dependencies
const gSign = require("../google-sign");
const buildProfile = require("../models/profile");
const userStore = require("../data-access/profile/user-store");
const tokenStore = require("../data-access/token/token-store");
const connKeeper = require("../helpers/connection-keeper");

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
        const loggedIn = connKeeper.getDeviceIdFor(user["_id"]);
        if (!loggedIn || loggedIn === device["clientID"])
        {
          connKeeper.registerUserToDevice(device["clientID"], user["_id"]);
          resolve(user);
        }
        else
          reject({
            message:'User logged in with same account on other device.'
          }) 
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
      const loggedIn = connKeeper.getDeviceIdFor(user["_id"]);
      if (!loggedIn || loggedIn === device["clientID"]) {
        connKeeper.registerUserToDevice(device["clientID"], user["_id"]);
        resolve(user);
      } else
        reject({
          message: "User logged in with same account on other device.",
        }); 
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
  tokenStore
    .singOut(_id)
    .then((result) =>{ 
      connKeeper.removeUserFromDevice(_id);
      ack("user signed out", true)})
    .catch((error) => ack(error["message"], false));
}
async function handleRevokeAccess(id) {
  return new Promise(async (resolve, reject) => {
    try {
      await tokenStore.singOut(id);
      connKeeper.removeUserFromDevice(id);
      resolve("user signed out", true);
    } catch (error) {
      reject(error);
    }
  });
}
async function handleClientHandshake(data, ack,socket) {
  return new Promise(async (resolve, reject) => {
    try {
      const userData = JSON.parse(data);
      connKeeper.addDevice(userData["clientID"], socket.id);
      ack(true,'Device synced with server');
    } catch (error) {
      reject(error);
    }
  });
}

async function handleAuthHandshake(data, ack) {
  const { device, user } = JSON.parse(data);
  const exists = connKeeper.getDeviceIdFor(user["_id"]);
  if (!exists || exists === device["clientID"]) {
    connKeeper.registerUserToDevice(device["clientID"], user["_id"]);
    ack(true, "Client handshake successfull");
  } else ack(false, "Client logged in other device using same account");
}

async function handleCloudSync(accessToken, ack) {
  try {
    const payload = await tokenStore.validateAccesToken(accessToken);
    if (payload) {
      const user = await userStore.fetchUserById(payload["_id"]);
      console.log("user fetched for id : " + payload["_id"]);
      ack(true, "user data synced successfully", JSON.stringify(user));
    }
  } catch (error) {
    console.log(error);
    ack(false, error.message, null);
  }
}

function addDevice(deviceID,socketID)
{
  connKeeper.addDevice(deviceID, socketID);
}

function removeDevice(deviceID)
{
  connKeeper.removeDevice(deviceID);
}
function registerUserToDevice(deviceID,userID)
{
  connKeeper.registerUserToDevice(deviceID, userID);
}
function removeUserFromDevice(userID)
{
  connKeeper.removeUserFromDevice(userID);
}
function getSocketIdFor(userID)
{
  return connKeeper.getSocketIdFor(userID);
}

module.exports = {
  handleEmailSignIn,
  handleGoogleSignIn,
  handleSignOut,
  handleUserUpdate,
  handleClientHandshake,
  handleCloudSync,
  handleRevokeAccess,
  handleAuthHandshake,
  registerUserToDevice,
  removeUserFromDevice,
  removeDevice,
  addDevice,
  getSocketIdFor,
};
