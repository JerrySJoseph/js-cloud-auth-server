const deviceConnection = require("./connections/client-connection");
const googleSign = require("./google-sign");
const db = require("./db/auth-database");
const jwt=require('./helpers/jwt_helper')
const auth=require('./data-access/profile/auth-Google');
const authEmail=require('./data-access/profile/auth-Email');
const tokenStore = require("./data-access/token/token-store");

const handler = require("./handlers/client-request-handler");

let io=null;
//Initialize Auth Engine 
const initEngine = (app, PORT) => {
  return new Promise( async (resolve, reject) => {
      try {
           io = await deviceConnection.initConnection(app, PORT);
           registerEvents(io);
          
           db.ConnectToDb()
            .then(() => console.log("Connected to Auth Database"))
            .catch((err) => console.log(err));

           resolve();
      } catch (error) {
          reject(error);
      }
       
  });
};

function registerEvents(io) {
  //To listen to messages
  io.on("connection", (socket) => {
    
    //Consoles a message when a new client connects to the server
    console.log("Connected to Client at socket: " + socket.id);

    //Fires when a client disconnects
    socket.on("disconnect", () => {
      console.log("Disconnected");
    });

    //Fires when an auth-flow is intiated
    socket.on("auth-flow", async(data, ack) => {
      handleAuthFlow(data,ack);
    });

    //Fires when a user profile update is requested
    socket.on("js-cloud-user-update",(data, ack) => {
      handleUserUpdate(data,ack)
    });

    socket.on('refresh-token',(data,ack)=>{
      handleRefreshToken(data,ack)
    })
    socket.on('sign-out',async (_id,ack)=>{
      

      tokenStore.singOut(_id)
      .then(result=>ack('user signed out',true))
      .catch(error=>ack(error['message'],false));


    })
  });
}

//Handling all auth flows
async function handleAuthFlow(data,ack)
{
  //used for creating Ack responses
  let message = "unknown request";
  let ackObject = null;
  let accessToken=null;
  let refreshToken=null;

  console.log("auth-flow recieved");

  //Parsing String JSON to POJO
  data = JSON.parse(data);

  //Handling google Sign IN
  if (data.authType === "Google")
  {
     try{
        const user = await handler.handleGoogleSignIn(data["idToken"]);
        console.log(user);
        if (user) {
          ackObject = JSON.stringify(user);
          message = "User signed in with Google";
          const tokens = await tokenStore.genAccessToken(user);
          accessToken = tokens.accessToken;
          refreshToken = tokens.refreshToken;
        }
    }catch(error)
    {
      ackObject = null;
      message = error.message;
    }
  } 
  //Fb
  else if (data.authType === "Facebook")
  {
  }
  //Email
  else if (data.authType === "Email") 
  {
    try
    {
      const user = await EmailSignIn(data);
      
      if (user) {
         ackObject = JSON.stringify(user);
         message = "User signed in with Email";
         const tokens = await tokenStore.genAccessToken(user);
         accessToken = tokens.accessToken;
         refreshToken = tokens.refreshToken;
        
      }
    }catch(error)
    {
       ackObject = null;
       message = error.message;
    }
  } 
  else if (data.authType === "Phone") 
  {
  }
  else 
  {
  }

ack(message,ackObject,accessToken,refreshToken);
}

//Handling user profile updates
async function handleUserUpdate(data,ack){
  try {
    console.log("update request recived");
    const { idToken, user } = JSON.parse(data);
    //Verifying token
    const payload=await tokenStore.validateAccesToken(idToken)
    const result = await handler.handleUserUpdate(payload['_id'],user);
    console.log(result);
    ack('User updated successfully',JSON.stringify(result));
  } catch (error) {
    ack(error.message,null)
  }
  
}

async function handleRefreshToken(data,ack){
  try {
    const tokens=await tokenStore.refreshTokens(data)
    ack(true,'tokens generated successfully',tokens.accessToken,tokens.refreshToken);
    console.log(payload);
  } catch (error) {
    ack(false,error.message,null,null);
  }
  

}

//Facebook Sign In flow
function facebookSignIn(){
}

//Phone Sign in Flow
function phoneSignIn(){

}

//Email Sign In Flow
function EmailSignIn(userObj){
  const { authMode } = userObj;
  let user = null;

  return new Promise(async (resolve, reject) => {
    try {
      if (authMode === "SIGN_IN") {
        user = await authEmail.signIn(userObj["user"]);
      } else if (authMode === "CREATE") {
        user = await authEmail.createUser(userObj["user"]);
      }

      if (user) {
        resolve(user);
      } else
        reject({
          message: "Unknown Error",
        });
    } catch (error) {
      reject(error);
    }
  });
}

//Anonymous Sign In Flow
function GuestSignIn(){

}

function updateUser(data)
{
}


module.exports={initEngine};
