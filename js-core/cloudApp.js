const express = require("express");
const clientConnection = require("./connections/client-connection");
const clientHandler = require("./handlers/client-request-handlers");
const DeviceStore = require("./helpers/device-store");
const config = require("../common/config-parser");
const errors = require("../Exceptions/JS-Cloud-Exceptions");

const app = express();
//Saving instance of Socket for sending custom server events
let io = null;
let appSignatures=[];
let anonymousConnections = false;
let invokes = [];


function allowAnonymousConnections(isAllowed) {
  anonymousConnections = isAllowed;
}

function initCloudApp(PORT) {
  return new Promise(async (resolve, reject) => {
    try {
      appSignatures = config.getValue("APP_SIGNATURES", []);
      if (!anonymousConnections && appSignatures.length < 1)
        throw new errors.NoAppSignaturesFound(
          "No app signatures registered, hence No client application will be able to connect to the server. Add atleast 1 app before intializing the server."
        );
      io = await clientConnection.initConnection(app, PORT);
      const device = new DeviceStore();
      registerEvents(io);
      resolve(io);
    } catch (error) {
      reject(error);
    }
  });
}

function attachinvoke(eventName, method) {
  invokes.push({ eventName, method });
}


function registerEvents(io) {
  //Listening to events
  io.on("connection", (socket) => {
    //Consoles a message when a new client connects to the server
    console.log("Connected to Client at socket: " + socket.id);

    //Fires on client handshake (Triggered automatically from client SDK when device connects to server)
    socket.on("client-handshake", (data, ack) => {
      clientHandler.handleClientHandshake(data, ack, socket.id);
    });

    //Disconnect Events
    socket.on("disconnect", () => {
      console.log("device-disconnected ");
    });
    //This event is for testing functionalities. Invoke any random  function inside the callblock
    socket.on("invoke", (data, ack) => {
      //Do any testing work here
    });

    invokes.forEach((inv) => {
      socket.on(inv.eventName, (data, ack) => {
        inv.method(data, ack);
      });
    });
  });
}



module.exports = { initCloudApp, attachinvoke, allowAnonymousConnections };
