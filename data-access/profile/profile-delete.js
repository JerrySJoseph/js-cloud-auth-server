
const profiledb=require('mongoose').connection.collection('profile_data');
const {ObjectId}= require('mongodb')

const deleteUser=(reqData)=>{
    return new Promise((resolve,reject)=>{
    profiledb.findOneAndDelete({_id:ObjectId(reqData._id)})
        .then((value)=>resolve(value))
        .catch((reason)=>reject(reason))
    })
}

module.exports=deleteUser;