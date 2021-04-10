const profiledb=require('mongoose').connection.collection('profile_data');

const readAllUsers=()=>{
    return new  Promise(async(resolve,reject)=>{
        const all_data = [];
        const results=await profiledb.find({});
        await results.forEach(doc=>all_data.push(doc))
        if(results)
           return resolve(all_data)
        return reject("No User Found")
    })
}
const readUser=(reqData)=>{
    return new  Promise(async(resolve,reject)=>{
        const all_data = [];
        console.log()
        const results=await profiledb.find(reqData);
        await results.forEach(doc=>all_data.push(doc))
        if(results)
           return resolve(all_data)
        return reject("No User Found")
    })
}

module.exports={readAllUsers,readUser};