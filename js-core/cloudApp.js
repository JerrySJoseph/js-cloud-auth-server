const express = require("express");
const clientConnection = require("./connections/client-connection");
const app = express();

function initCloudApp(PORT) {
  return clientConnection.initConnection(app, PORT);
}

function registerEvents(io) {
  //Listening to events
  io.on("connection", (socket) => {
    //Consoles a message when a new client connects to the server
    console.log("Connected to Client at socket: " + socket.id);

    //Fires on client handshake (Triggered automatically from client SDK when device connects to server)
    socket.on("client-handshake", (data, ack) => {
      handleClientHandshake(data, ack, socket);
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

module.exports = { initCloudApp };
