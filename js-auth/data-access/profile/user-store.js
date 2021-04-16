const buildProfile = require("../../models/profile");
const ObjectId = require("mongodb").ObjectId;

const profiledb = require("mongoose").connection.collection("profile_data");

async function signInOrCreate(profile) {
  return new Promise(async (resolve, reject) => {
    try {
      const userExist = await profiledb.findOne({ email: profile["email"] });
      if (userExist) resolve(userExist);
      else {
        const result = await profiledb.insertOne(profile);
        resolve(result.ops[0]);
      }
    } catch (err) {
      reject(err);
    }
  });
}

async function updateProfile(id, newUser) {
  return new Promise(async (resolve, reject) => {
    try {
      delete newUser["_id"];
      const result = await profiledb.findOneAndUpdate(
        { _id: ObjectId(id) },
        { $set: newUser },
        { returnOriginal: false }
      );

      if (!result) reject({ message: "user not found" });
      resolve(result);
    } catch (error) {
      reject(error);
    }
  });
}

async function signInEmail({ email, password }) {
  return new Promise(async (resolve, reject) => {
    try {
      const user = await profiledb.findOne({ email, password });
      if (!user)
        reject({
          success: false,
          message: "User not found with this email and password",
        });
      else resolve(user);
    } catch (error) {
      reject(error);
    }
  });
}

async function createUserEmail(user) {
  return new Promise(async (resolve, reject) => {
    try {
      const userExists = await profiledb.findOne({ email: user["email"] });
      if (userExists)
        reject({
          success: false,
          message:
            "User exists with same email ID. Try logging in to that account",
        });
      else {
        resolve((await profiledb.insertOne(user)).ops[0]);
      }
    } catch (error) {
      reject(error);
    }
  });
}

async function deleteUser({ _id }) {
  return new Promise(async (resolve, reject) => {
    try {
      resolve((await profiledb.findOneAndDelete({ _id: ObjectId(_id) })).value);
    } catch (error) {
      reject(error);
    }
  });
}

async function fetchUserById(id) {
  return profiledb.findOne({ _id: ObjectId(id) });
}

module.exports = {
  signInOrCreate,
  updateProfile,
  signInEmail,
  createUserEmail,
  deleteUser,
  fetchUserById,
};
