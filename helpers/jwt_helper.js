const JWT= require('jsonwebtoken');


/**
 * These are some useful defaults declared before hand. 
 * sDefaultExpirationTime - Default expiration time for access Tokens
 * sDefaultRefreshExpirationTime - Default time for expiration of refresh Tokens
 * sDefaultIssuerName - Default issuer name 
 */

const sDefaultExpirationTime = "1h";
const sDefaultRefreshExpirationTime = "24h";
const sDefaultIssuerName = "js-cloud-auth-api";
const secret='sdfijn93nd-nef3-128fb2872bfcybcdfw2343ej9fun280n20f8yn27n20208c280n7208c7b8bv2087b'

/**
 * This function generates 256-bit HMAC SHA256 encrypted Access Token (JWT)
 * which includes hubID as a payload. This hubID will be used to identify
 * requests. 
 * @param {String} hubID - HubID of the hub
 * @returns - a Promise which resolves to the encrypted Access Token (JWT)
 * or rejects with an error object.
 */

const signAccessToken=({_id,email,name,authType})=>{
    return new Promise((resolve,reject)=>{
      const payload = { _id,email,name,authType };
     

      const options = {
        expiresIn: sDefaultExpirationTime,
        issuer: sDefaultIssuerName,
      };

      JWT.sign(payload, secret, options, (error, token) => {
        if (error) reject(error);
        else if (token) {
            resolve(token);
        }
      });
    })
}
/**
 * This function verifyies 256-bit HMAC SHA256 encrypted JSON Web Token 
 * which includes hubID as a payload. This hubID will be used to identify
 * requests. 
 * @param {String} token - JWT token supplied by the client
 * @returns - a Promise which resolves to payload or rejects with
 * an error object.
 */
const verfifyAccessToken=(token)=>{
    return new Promise((resolve,reject)=>{
        try{
            JWT.verify(token,secret,(err,payload)=>{
                    if(err)
                    {
                        return reject(parseError(err));
                    }
                resolve(payload);
            })
        }catch(e)
        {
            console.log(e);
            reject(e);
        }
         
    })
}

function parseError(err) {
  let msg = null;
  if (err.name === "TokenExpiredError")
    msg = {
      name: "Token Expired",
      message:
        "Your token is Expired. Try refreshing the tokens or login again",
    };
  else if (err.name === "JsonWebTokenError")
    msg = {
      name: "Token Error",
      message: "Token verification resulted in failure",
    };
  else msg = err;

  return msg;
}

/**
 * This function generates 256-bit HMAC SHA256 encrypted REFRESH_TOKEN (JWT)
 * which includes hubID as a payload. This hubID will be used to identify
 * requests. This REFRESH TOKEN has to be used when the ACESS_TOKEN expires
 * @param {String} hubID - HubID of the hub
 * @returns - a Promise which resolves to the encrypted Access Token (JWT)
 * or rejects with an error object.
 */
const signRefreshToken = ({ _id, email, name, authType }) => {
  return new Promise((resolve, reject) => {
    const payload = { _id, email, name, authType };
    const options = {
      expiresIn: sDefaultRefreshExpirationTime,
      issuer: sDefaultIssuerName,
    };

    JWT.sign(payload, secret, options, (error, token) => {
      if (error) reject(error);
      else if (token) resolve(token);
    });
  });
};

const verfifyRefreshToken=(token)=>{
    return new Promise((resolve,reject)=>{
        try{
            JWT.verify(token,secret,(err,payload)=>{
                    if (err) {
                      return reject(parseError(err));
                    }
                resolve(payload);
            })
        }catch(e)
        {
            console.log(e);
            reject(e);
        }
         
    })
}

module.exports={
    signAccessToken,
    verfifyAccessToken,
    signRefreshToken,
    verfifyRefreshToken
}

