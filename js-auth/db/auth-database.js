const mongoose= require('mongoose');
const config = require("../helpers/config-parser");

const DEFAULT_CONN_STRING = config.getValue(
  "DB_CONNECTION_STRING",
  "mongodb://localhost:27017/js-auth-db"
);

// A Promise to connect TO MongoDB
const ConnectToDb=(connectionString=DEFAULT_CONN_STRING)=>{
    return new Promise((resolve,reject)=>{
        mongoose.connect(connectionString,{useNewUrlParser:true,useUnifiedTopology:true},
            (err)=>{
                if(err)
                  return reject(err)
                return resolve();
            })
    })
}


module.exports={ConnectToDb};