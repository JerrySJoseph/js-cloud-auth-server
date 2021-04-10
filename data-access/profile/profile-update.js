
const ProfileModel=require('../../models/profile');
const profiledb=require('mongoose').connection.collection('profile_data');
const ObjectId =require('mongodb').ObjectId

const updateUser=(reqData)=>{
    return new Promise((resolve,reject)=>{
    
    const profile=parseDatafromRequestData(reqData)
    profiledb.updateOne({_id:ObjectId(reqData._id)},{$set:profile})
        .then((value)=>resolve(value))
        .catch((reason)=>reject(reason))
    })
}

const parseDatafromRequestData=(reqData)=>{
    return ProfileModel({
        name:reqData.name,
        email:reqData.email,
        designation:reqData.designation,
        createdAt:reqData.createdAt,
        isVerified:reqData.isVerified
    })
}
module.exports=updateUser;