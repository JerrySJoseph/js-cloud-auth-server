const dbHandler = require("../data-access/db-functions");

async function insertOne(data, ack) {
  try {
    const { collectionName, object } = JSON.parse(data);
    const result = await dbHandler.insertOne(collectionName, object);
    ack(true, "Data inserted successfully", JSON.stringify(result.ops[0]));
  } catch (error) {
    ack(false, error.message, null);
  }
}

async function insertAll(data, ack) {
  try {
    const { collectionName, object } = JSON.parse(data);
    const result = await dbHandler.insertAll(collectionName, object);
    ack(true, "Data inserted successfully", JSON.stringify(result.ops));
  } catch (error) {
    ack(false, error.message, null);
  }
}

async function read(data, ack) {
  try {
    const { collectionName, filterQuery, selectionQuery, limit } = JSON.parse(
      data
    );
    const result = await dbHandler.read(
      collectionName,
      JSON.parse(filterQuery),
      JSON.parse(selectionQuery),
      limit
    );
    //console.log(result);
    ack(true, "Data fetched successfully", JSON.stringify(result));
  } catch (error) {
    ack(false, error.message, null);
  }
}

async function watch(collectionName, callback) {
  return dbHandler.watch(collectionName, callback);
}
module.exports = { insertOne, insertAll, read, watch };
