const express = require("express");
const authEngine = require("./js-auth");
const cloudApp = require("./js-core");

const app=express();

cloudApp.allowAnonymousConnections(true);

async function bigBang() {
  cloudApp.initCloudApp(3001).then((io) => authEngine.begin(io));
}
bigBang();

app.listen(3000,()=>console.log("HTTP Server running on Port 3000"));