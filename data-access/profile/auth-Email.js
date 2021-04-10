const buildProfile = require("../../models/profile");
const ObjectId = require("mongodb").ObjectId;

const profiledb = require("mongoose").connection.collection("profile_data");


async function signIn({email,password}){
    return new Promise(async (resolve,reject)=>{
        try{
            const user=await profiledb.findOne({email:email,password:password});
            if(user) resolve(user);
            return reject({message:'User not found with this email and password'});
            
            
        }catch(err)
        {
            reject(err);
        }
    })
}

async function createUser(userObj)
{
    return new Promise(async (resolve,reject)=>{
        try {
            const user=await profiledb.findOne({email:userObj['email']});
            if(user) reject({message:"User with Same email exists"});
            else
            {
                const result=await profiledb.insertOne(userObj);
                if(result) resolve(result.ops[0]);
                else reject({message:'unknown error while saving user'});
            }
        } catch (error) {
            reject(error);
        }
    })
}

async function update(newUser) {
  //saving _id and deleting _id
  const id = newUser["_id"];
  delete newUser._id;

  new Promise(async (resolve, reject) => {
    try {
      const result = await profiledb.findOneAndUpdate(
        { _id: ObjectId(id) },
        { $set: newUser }
      );

      if (!result) reject({message:"User not found"});
      resolve(result);
    } catch (error) {
      reject(error);
    }
  });
}
module.exports = { signIn, update ,createUser};
