const buildProfile = require("../../models/profile");
const ObjectId = require("mongodb").ObjectId;

const profiledb = require("mongoose").connection.collection("profile_data");


async function signInOrCreate(payload)
{
    return new Promise(async(resolve,reject)=>{
      try {
        const user = await profiledb.findOne({
          email: payload["email"],
          authType: "Google",
        });
        if (user) resolve(user);
        else {
          const userProfile = buildProfile({
            name: payload["name"],
            email: payload["email"],
            photoUrl: payload["picture"],
            isVerified: payload["email_verified"],
            authType: "Google",
            createdAt: new Date(),
          });
          profiledb
            .insertOne(userProfile)
            .then((result) => resolve(result.ops[0]))
            .catch((error) => reject(error));
        }
      } catch (error) {
        reject(error);
      }
    })
}
async function update(newUser)
{
    //saving _id and deleting _id 
    const id=newUser['_id'];
    delete newUser._id;

    new Promise(async (resolve,reject)=>{
        
        try {
            const result = await profiledb.findOneAndUpdate(
              { _id: ObjectId(id) },
              { $set: newUser }
            );
          
            if (!result) reject({message:"user not found"});
            resolve(result);

        } catch (error) {
            reject(error);
        }
        
    })
}
module.exports = { signInOrCreate ,update};