const mongoose= require('mongoose');

//Change Database name if you want to 
const DB_NAME='js_cloud_auth_db';

const DEFAULT_CONN_STRING=`mongodb://localhost:27017/${DB_NAME}`

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