const deviceConnection = require("../js-core/connections/client-connection");
const db = require("./db/auth-database");
const tokenStore = require("./data-access/token/token-store");
const handler = require("./handlers/client-request-handler");
const errors = require("./Exceptions/JS-Cloud-Exceptions");
const config = require("./helpers/config-parser");

//Saving instance of Socket for sending custom server events
let io = null;
let appSignatures = [];
let anonymousConnections = false;
let invokes = [];
/**
 * @function
 * @param {String} signature SHA256 singature of application
 * @param {String} packageName application packageName
 * 
 * @example addAppSignature('myAppSignature','com.example.myapp');
 * 
 * 
 * signature-> fingerprint of application (Android->SHA256)
 * packageName-> packageName of the application (for eg :com.jstechnologies.someapp)
 * 
 * The packageName and signature will be displayed in the Log output of your device
 * in Android Studio when you Initialize the JSCloudApp. 
 * 
 * Adding Application signature to server. This ensures only registered application
 * can connect to the server.
 * 
 * How it Works:
 * 
 * JS Cloud SDK android has its core dependency, which establishes a connection with 
 * the cloud SDK when the app is opened. As a security measure, the SDK begins 
 * Client-handshake protocol and exchanges device specific information (like deviceID,
 * app-signature and packageName) to verify application. If the verification is not successfull,
 * the server rejects the connection with that client and the SDk automatically disconnects from 
 * the server. On the Other hand if verification results are successfull, the server maintains 
 * a long lived connection to the device.
 *   
 * Disable Client verification:
 * 
 * You can override the client verification by:
 
 * @example allowAnonymousConnections(true)
 * 
 * This function disables strict client verification and allows any application capable of connecting
 * via websockets to connect.
 * NOTE: This mode is not recommended for production as any client can connect to the server and can 
 * potentially steal data or crash the server.
 * 
 */
function addAppSignature(signature, packageName) {
  appSignatures.push({ signature: signature, packageName: packageName });
}

/**
 * @function
 * @param {Boolean} isAllowed
 */
function allowAnonymousConnections(isAllowed) {
  anonymousConnections = isAllowed;
}

async function begin(_io) {
  if (!anonymousConnections && appSignatures.length < 1)
    throw new errors.NoAppSignaturesFound(
      "No app signatures registered, hence No client application will be able to connect to the server. Add atleast 1 app before intializing teh server."
    );

  io = _io;
  registerEvents(io);
  const database = await db.ConnectToDb();
  console.log("connected to Auth Database");
  return io;
}
/*
//Initialize Auth Engine
const initEngine = (app, PORT) => {
  //Returns a promise resolving to a WebSocket
  return new Promise(async (resolve, reject) => {
    try {
      if (!anonymousConnections && appSignatures.length < 1)
        throw new errors.NoAppSignaturesFound(
          "No app signatures registered, hence No client application will be able to connect to the server. Add atleast 1 app before intializing teh server."
        );
      io = await deviceConnection.initConnection(app, PORT);
      registerEvents(io);

      db.ConnectToDb()
        .then(() => console.log("Connected to Auth Database"))
        .catch((err) => console.log(err));

      resolve(io);
    } catch (error) {
      reject(error);
    }
  });
};
*/
function registerEvents(io) {
  //Listening to events
  io.on("connection", (socket) => {
    //Consoles a message when a new client connects to the server
    console.log("Connected to Client at socket: " + socket.id);

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

    //Fires on client handshake (Triggered automatically from client SDK when device connects to server)
    socket.on("client-handshake", (data, ack) => {
      handleClientHandshake(data, ack, socket);
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

    //Disconnect Events
    socket.on("disconnect", () => {
      console.log("device-disconnected ");
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
    const tokens = await tokenStore.refreshTokens(data);
    ack(
      true,
      "tokens generated successfully",
      tokens.accessToken,
      tokens.refreshToken
    );
    console.log(payload);
  } catch (error) {
    ack(false, error.message, null, null);
  }
}

//handling client handshake for exchange of deviceId and socketid
async function handleClientHandshake(data, ack, socket) {
  const { clientID, SHA_fingerprint, packageName } = JSON.parse(data);

  if (!verifySignature(SHA_fingerprint, packageName)) {
    console.log(
      "Signature verification failed for device -> " +
        clientID +
        " , Closing connection to client..."
    );
    return ack(false, "Application signature could not be verified");
  }
  return handler.handleClientHandshake(clientID, ack, socket);
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

//Facebook Sign In flow
function facebookSignIn() {}

//Phone Sign in Flow
function phoneSignIn() {}

//Email Sign In Flow
function EmailSignIn(userObj) {
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

function verifySignature(signature, packageName) {
  if (anonymousConnections) return true;
  return appSignatures.some(
    (obj) => obj.signature === signature && obj.packageName === packageName
  );
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
  allowAnonymousConnections,
  attachinvoke,
  addAppSignature,
  findUserByID,
};
