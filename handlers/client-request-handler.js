//import requires dependencies
const gSign = require("../google-sign");
const buildProfile = require("../models/profile");
const {
  signInOrCreate,
  updateProfile,
} = require("../data-access/profile/user-store");

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
        const user = await signInOrCreate(profile);
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
      const result = await updateProfile(id, profile);
      resolve(result.value);
    } catch (error) {
      reject(error);
    }
  });
}

//Auth- flow Email
async function handleEmailSignIn(authRequest, ack) {}

//SignOut
async function handleSignOut(data, ack) {}

module.exports = {
  handleEmailSignIn,
  handleGoogleSignIn,
  handleSignOut,
  handleUserUpdate,
};
