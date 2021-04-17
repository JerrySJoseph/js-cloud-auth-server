const { OAuth2Client } = require("google-auth-library");
const exceptions = require("../exceptions/JS-Cloud-Exceptions");
class GoogleSignIn {
  constructor(GoogleClientID) {
    if (GoogleClientID == null)
      throw new exceptions.GoogleClientIDNotFound(
        " Please add Google Client ID in .env file with name 'GOOGLE_CLIENT_ID'"
      );
    this.CLIENT_ID = GoogleClientID;
    this.client = new OAuth2Client(GoogleClientID);
  }

  async verifyToken(token) {
    return new Promise(async (resolve, reject) => {
      try {
        const ticket = await this.client.verifyIdToken({
          idToken: token,
          audience: this.CLIENT_ID,
        });
        resolve(ticket.getPayload());
      } catch (error) {
        reject(error);
      }
    });
  }
}
/*
const CLIENT_ID =
  "162441073530-raoqmrk7bka1s3kr8o1o58j0tktrlrvh.apps.googleusercontent.com";
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
 }*/
module.exports = GoogleSignIn;