const tokenDb = require("mongoose").connection.collection("token_store");
const ObjectId = require("mongodb").ObjectId;
const jwt = require("../../../common/jwt_helper");

//Generate Access and refresh Tokens then save to Token store
async function genAccessToken(profile) {

  return new Promise(async (resolve,reject)=>{
    try {
      const accessToken = await jwt.signAccessToken(profile);
      const refreshToken = await jwt.signRefreshToken(profile);
      const result = await saveToken(profile["_id"], accessToken, refreshToken);
      resolve({
        success: true,
        accessToken: accessToken,
        refreshToken: refreshToken,
        message: "Access and Refresh Tokens generated.",
      });
    } catch (error) {
      reject(error);
    }
  })
}

//Validating accessTokens
async function validateAccesToken(accessToken) {
  return new Promise(async  (resolve,  reject)  =>  {
    try {
      const payload = await jwt.verfifyAccessToken(accessToken);

      if (payload) {
      
        //conforming this was the token issued
        const tokenexists = await tokenDb.findOne({
          _id: ObjectId(payload["_id"]),
          accessToken: accessToken,
        });
        if (!tokenexists)
          reject({
            name: "Token Mismatch",
            message:
              "issued token mismatch. Please login/refresh for new tokens",
          });
        resolve(payload);
      }
    } catch (error) {
      reject(error);
    }
  });;
}
//validating refreshTokens
async function refreshTokens(refreshToken)
{
  return new Promise(async(resolve,reject)=>{
    try {
      const payload = await jwt.verfifyRefreshToken(refreshToken);
      if(payload)
      {
        //conforming this was the token issued
        const tokenexists=await tokenDb.findOne({_id:ObjectId(payload['_id']),refreshToken:refreshToken})
        if(!tokenexists)
          reject({
            name:'Token Mismatch',
            message:'issued token mismatch. Please login again for new tokens'
          })
        else
          resolve(await genAccessToken(payload));
      }
    } catch (error) {
      reject(error)
    }
    
  })
}
//Save to Token store
async function saveToken(_id,access_token,refresh_token){
  return new Promise(async (resolve, reject) => {
    try {
      const result = await tokenDb.replaceOne(
        { _id: ObjectId(_id) },
        { accessToken: access_token, refreshToken: refresh_token },
        { upsert: true }
      );
      if (result) resolve(result.ops[0]);
    } catch (error) {
      reject(error);
    }
  });
}

//Sign out
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

async function deleteToken({ _id }) {
  return new Promise(async (resolve, reject) => {
    try {
      resolve((await tokenDb.findOneAndDelete({ _id: ObjectId(_id) })).value);
    } catch (error) {
      reject(error);
    }
  });
}
module.exports = {
  genAccessToken,
  validateAccesToken,
  singOut,
  refreshTokens,
  deleteToken,
};