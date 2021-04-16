const db = require("./db/auth-database");
const tokenStore = require("./data-access/token/token-store");
const handler = require("./handlers/client-request-handler");

//Saving instance of Socket for sending custom server events
let io = null;
let invokes = [];

async function begin(_io) {
 
  io = _io;
  registerEvents(io);
  console.log("Auth Events registered");
  const database = await db.ConnectToDb();
  console.log("connected to Auth Database");
  return io;
}

function registerEvents(io) {
  //Listening to events
  io.on("connection", (socket) => {
    
    //Fires when an auth-flow is intiated
    socket.on("auth-flow", async (data, ack) => {
      handleAuthFlow(data, ack, socket);
    });

    //Fires when a user profile update is requested
    socket.on("js-cloud-user-update", (data, ack) => {
      handleUserUpdate(data, ack);
    });

    //Fires when a user request for refreshing token
    socket.on("refresh-token", (data, ack) => {
      handleRefreshToken(data, ack);
    });

   
    socket.on("auth-handshake", (data, ack) => {
      handleAuthHandshake(data, ack);
    });

    //Fires on sign-out (This triggers an automated signout sequence, removes all issued tokens from database)
    socket.on("sign-out", async (_id, ack) => {
      handler.handleSignOut(_id, ack);
    });
    //Fires on sync
    socket.on("cloud-sync", (accessToken, ack) => {
      handleCloudSync(accessToken, ack);
    });
    //Delete user
    socket.on("delete-user", (data, ack) => {
      handleDeleteUser(data, ack);
    });
    //This event is for testing functionalities. Invoke any random  function inside the callblock
    socket.on("invoke", (data, ack) => {
      revokeAccess(data)
        .then(({ success, message }) => console.log(message))
        .catch(({ success, message }) => console.log(message));
    });

    invokes.forEach((inv) => {
      socket.on(inv.eventName, (data, ack) => {
        inv.method(data, ack);
      });
    });
  });
}

//Handling all auth flows
async function handleAuthFlow(data, ack, socket) {
  //used for creating Ack responses
  let message = "unknown request";
  let ackObject = null;
  let accessToken = null;
  let refreshToken = null;
  let user = null;
  console.log("auth-flow recieved");

  //Parsing String JSON to POJO
  data = JSON.parse(data);

  //Handling google Sign IN
  if (data.authType === "Google") {
    try {
      user = await handler.handleGoogleSignIn(data);
      console.log(user);
      if (user) {
        ackObject = JSON.stringify(user);
        message = "User signed in with Google";
        const tokens = await tokenStore.genAccessToken(user);
        accessToken = tokens.accessToken;
        refreshToken = tokens.refreshToken;
      }
    } catch (error) {
      ackObject = null;
      message = error.message;
    }
  }
  //Fb
  else if (data.authType === "Facebook") {
  }
  //Email
  else if (data.authType === "Email") {
    try {
      user = await handler.handleEmailSignIn(data);

      if (user) {
        ackObject = JSON.stringify(user);
        message = "User signed in with Email";
        const tokens = await tokenStore.genAccessToken(user);
        accessToken = tokens.accessToken;
        refreshToken = tokens.refreshToken;
        handler.registerUserToDevice(data["device"]["clientID"], user["_id"]);
      }
    } catch (error) {
      ackObject = null;
      message = error.message;
    }
  } else if (data.authType === "Phone") {
  } else {
  }

  ack(message, ackObject, accessToken, refreshToken);
  //Fires when a client disconnects
  socket.on("disconnect", () => {
    handler.removeDevice(data["device"]["clientID"]);
  });
}

//Handling user profile updates
async function handleUserUpdate(data, ack) {
  try {
    console.log("update request recived");
    const { idToken, user } = JSON.parse(data);
    //Verifying token
    const payload = await tokenStore.validateAccesToken(idToken);
    const result = await handler.handleUserUpdate(payload["_id"], user);
    console.log("user with id: " + result["_id"] + " updated successfully");
    ack(true, "User updated successfully", JSON.stringify(result));
  } catch (error) {
    ack(false, error.message, null);
  }
}

//handling refreshTokens
async function handleRefreshToken(data, ack) {
  try {
    console.log("refresh-recieved");
    const tokens = await tokenStore.refreshTokens(data);
    ack(
      true,
      "tokens generated successfully",
      tokens.accessToken,
      tokens.refreshToken
    );
   
  } catch (error) {
    ack(false, error.message, null, null);
  }
}


//handling cloud Sync
async function handleCloudSync(accessToken, ack) {
  return handler.handleCloudSync(accessToken, ack);
}

//handling auth handshake
async function handleAuthHandshake(data, ack) {
  handler.handleAuthHandshake(data, ack);
}

async function handleDeleteUser(data, ack) {
  handler.handleDeleteUser(data, ack);
}


function revokeAccess(id) {
  return sendEventTo(id, "revoke-access", "Access revoked by server");
}

async function sendEventTo(id, eventName, payload) {
  return new Promise((resolve, reject) => {
    try {
      const sid = handler.getSocketIdFor(id);
      if (sid) {
        //if payload is not a string, convert to string
        payload = isString(payload) ? payload : JSON.stringify(payload);
        io.to(sid).emit(eventName, payload);
        resolve({
          success: true,
          message: "Event (" + eventName + ") sent to " + id,
        });
      } else
        reject({
          success: false,
          message:
            "socket id for " +
            id +
            " not found. Discarding event - " +
            eventName,
        });
    } catch (error) {
      reject({
        success: false,
        message: error.message,
      });
    }
  });
}

function findUserByID(id) {
  return handler.findUserById(id);
}


function sendOnProfileUpdateEvent(id, newProfile) {
  return sendEventTo(id, "auth-profile-update", newProfile);
}

function isString(obj) {
  return obj.constructor == String;
}

function attachinvoke(eventName, method) {
  invokes.push({ eventName, method });
}

module.exports = {
  begin,
  revokeAccess,
  sendEventTo,
  sendOnProfileUpdateEvent,
  attachinvoke,
  findUserByID,
};
