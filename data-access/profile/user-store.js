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
module.exports = { signInOrCreate, updateProfile };
