
const ProfileModel=require('../../models/profile');
const profiledb=require('mongoose').connection.collection('profile_data');

const createUser=(reqData)=>{
    return new Promise((resolve,reject)=>{
    
    const profile=parseDatafromRequestData(reqData)
    profiledb.insertOne(profile)
        .then((value)=>resolve({result:value.result,profile:value.ops[0]}))
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
module.exports=createUser;