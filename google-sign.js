const { OAuth2Client } = require("google-auth-library");

const CLIENT_ID ="629362459295-krpl7a5s8cgt5b96s25jabtiotlvpkq1.apps.googleusercontent.com";
const client = new OAuth2Client(CLIENT_ID);

 async function verify(token) {
   const ticket = await client.verifyIdToken({
     idToken: token,
     audience: CLIENT_ID,
   });
   const payload = ticket.getPayload();
   const userid = payload["sub"];

   // If request specified a G Suite domain:
   // const domain = payload['hd'];
 }

 function verifyToken(token) {
   return new Promise(async (resolve, reject) => {
     try {
       const ticket = await client.verifyIdToken({
         idToken: token,
         audience: CLIENT_ID,
       });
       resolve(ticket.getPayload());
     } catch (error) {
       reject(error);
     }
   });
 }
module.exports={verifyToken};