//import requires dependencies
const googleSign = require("../google-sign");
const buildProfile = require("../models/profile");
const userStore = require("../data-access/profile/user-store");
const tokenStore = require("../data-access/token/token-store");
const connKeeper = require("../helpers/connection-keeper");
const config = require("../helpers/config-parser");

const gSign = new googleSign(config.getValue("GOOGLE_CLIENT_ID", null));

/**
 * 
 * @param {AuthRequest} authRequest 
 * 
 * Implementation of Google Auth from GoogleSignIn SDK. Recieves an AuthRequest
 * issued by client-SDK (android or Web) with properties idToken and device
 * 
 * Param Definitions:
 * idToken->Auth-Token issued by GoogleCloud
 * device-> device specific object created by JS-cloud-client SDK for android or Web
 * 
 * Working:
 * The idToken is verified by the GoogleSDK and if the verified successfully, 
 * and if the user is not logged in already, returns the userObject. Otherwise,
 * rejects with proper error message.
 * 
 * @returns User 
 * 
 * 
 * 
 */
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
        //Check if the user is logged in some other device already
        const loggedIn = connKeeper.getDeviceIdFor(user["_id"]);
        if (!loggedIn || loggedIn === device["clientID"]) {
          connKeeper.registerUserToDevice(device["clientID"], user["_id"]);
          resolve(user);
        } else
          reject({
            message: "User logged in with same account on other device.",
          });
      }
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * 
 * @param {String} id 
 * @param {User} profile 
 * @returns 
 */
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
        //Check if the user is logged in some other device already
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

async function handleDeleteUser(data, ack) {
  try {
    console.log("delete request recived");
    const { idToken, user } = JSON.parse(data);

    //Verifying token
    const payload = await tokenStore.validateAccesToken(idToken);

    if (payload) {
      const result = await userStore.deleteUser(user);
      await tokenStore.deleteToken(user);
      if (result) ack(true, "User deleted succesfully");
    }
  } catch (error) {
    ack(false, error.message);
  }
}

//SignOut
async function handleSignOut(_id, ack) {
  tokenStore
    .singOut(_id)
    .then((result) =>{ 
      connKeeper.removeUserFromDevice(_id);
      ack("user signed out", true)})
    .catch((error) => ack(error["message"], false));
}

//handle revoke access command from server
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

//handle client handshake
async function handleClientHandshake(clientID, ack, socket) {
  try {
    connKeeper.addDevice(clientID, socket.id);
    ack(true, "Device synced with server");
  } catch (error) {
    ack(false, error.message);
  }
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

function findUserById(id) {
  return userStore.fetchUserById(id);
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
  handleDeleteUser,
  handleRevokeAccess,
  handleAuthHandshake,
  findUserById,
  registerUserToDevice,
  removeUserFromDevice,
  removeDevice,
  addDevice,
  getSocketIdFor,
};
