const express = require("express");
const cloudEngine=require('./cloud-engine');


const app=express();


cloudEngine.initEngine(app, 3001);
  
function revokeUser(id) {
  setInterval(() => {
    cloudEngine.revokeAccess(id);
  }, 5000);
}
app.listen(3000,()=>console.log("HTTP Server running on Port 3000"));