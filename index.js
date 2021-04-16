const express = require("express");
const authEngine = require("./js-auth/auth-engine");
const deviceConnection = require("./js-core/connections/client-connection");


const app=express();

authEngine.addAppSignature(
  "zM7CDz7zzo24Mhs/h0y9fRoMBwEFHahXQM+n5lesKJ8=",
  "com.example.jscloudapi"
);

authEngine.addAppSignature(
  "zM7CDz7zzo24Mhs/h0y9fRoMBwEFHahXQM+n5lesKJ8=",
  "com.example.tnsm_app"
);

authEngine.attachinvoke("some", (data, ack) => {
  authEngine.revokeAccess(data);
});

authEngine.allowAnonymousConnections(false);

deviceConnection.initConnection(app, 3001).then((io) => authEngine.begin(io));

app.listen(3000,()=>console.log("HTTP Server running on Port 3000"));