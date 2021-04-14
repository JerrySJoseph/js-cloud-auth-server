const express = require("express");
const cloudEngine=require('./cloud-engine');


const app=express();

cloudEngine.addAppSignature(
  "zM7CDz7zzo24Mhs/h0y9fRoMBwEFHahXQM+n5lesKJ8=",
  "com.example.jscloudapi"
);

cloudEngine.allowAnonymousConnections(false);

cloudEngine.initEngine(app, 3001);



app.listen(3000,()=>console.log("HTTP Server running on Port 3000"));