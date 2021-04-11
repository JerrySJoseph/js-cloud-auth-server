//import requires dependencies
const gSign = require("../google-sign");
const buildProfile = require("../models/profile");
const userStore = require("../data-access/profile/user-store");
const tokenStore = require("../data-access/token/token-store");
//Auth - flow Google
function handleGoogleSignIn(idToken) {
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
async function handleEmailSignIn(userObj) {
  const { authMode } = userObj;
  let user = null;

  return new Promise(async (resolve, reject) => {
    try {
      if (authMode === "SIGN_IN") {
        user = await userStore.signInEmail(userObj["user"]);
      } else if (authMode === "CREATE") {
        user = await userStore.createUserEmail(userObj["user"]);
      }

      if (user) {
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

async function handleClientHandshake(data, ack) {
  return new Promise(async (resolve, reject) => {
    try {
      const userData = JSON.parse(data);
      console.log(userData);
    } catch (error) {
      reject(error);
    }
  });
}
module.exports = {
  handleEmailSignIn,
  handleGoogleSignIn,
  handleSignOut,
  handleUserUpdate,
  handleClientHandshake,
};
