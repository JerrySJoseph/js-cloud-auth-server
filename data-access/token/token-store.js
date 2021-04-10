const tokenDb = require("mongoose").connection.collection("token_store");
const ObjectId = require("mongodb").ObjectId;
const jwt =require('../../helpers/jwt_helper');

async function saveToken(_id,access_token,refresh_token){
return new Promise(async(resolve,reject)=>{
    try {
        const result = await tokenDb.replaceOne(
          { _id: ObjectId(_id) },
          { access_token, refresh_token },
          {upsert:true}
        );
        if(result)
        resolve(result.ops[0]);
    } catch (error) {
        reject(error);
    }
    
})
}
async function validateRefreshToken(_id,refresh_token){
    return new Promise(async (resolve, reject) => {
      try {
        const result = await tokenDb.findOne(
          { _id: ObjectId(_id),refresh_token}
        );
        if (result)
         {
           resolve(true);
         }
      } catch (error) {
        reject(error);
      }
    });
}
async function validateAccessToken(_id, access_token) {
  return new Promise(async (resolve, reject) => {
    try {
      const result = await tokenDb.findOne({
        _id: ObjectId(_id),
        access_token,
        refresh_token,
      });
      if (result) resolve(true);
    } catch (error) {
      reject(error);
    }
  });
}
async function singOut(_id)
{
  return new Promise(async (resolve,reject)=>{
    try {
      const user=await tokenDb.findOne({_id:ObjectId(_id)});
      if(user)
      {
       saveToken(_id,'-S/O-','-S/O-').then(res=>resolve(res)).catch(er=>reject(er));
      }
      else
        reject({
          success:false,
          message:'No token found for user with id: '+_id
        })
    } catch (error) {
      reject(error)
    }
  })
}

module.exports = { saveToken, validateRefreshToken,validateAccessToken, singOut };