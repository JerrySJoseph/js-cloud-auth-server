const dbConnection = require("mongoose").connection;

const watchStore = [];

function insertOne(collectionName, object) {
  return dbConnection.collection(collectionName).insertOne(object);
}
function insertAll(collectionName, object) {
  return dbConnection.collection(collectionName).insertMany(object);
}
function read(
  collectionName,
  filterQuery = {},
  selectionQuery = {},
  limit = 0
) {
  watch(collectionName);
  return dbConnection
    .collection(collectionName)
    .find(filterQuery)
    .project(selectionQuery)
    .limit(limit)
    .toArray();
}

function watch(collectionName, callback) {
  if (watchStore.includes(collectionName)) return;
  watchStore.push(collectionName);
  const changeStream = dbConnection
    .collection(collectionName)
    .watch([], { fullDocument: "updateLookup" });
  changeStream.on("change", (next) => callback(next));
}

module.exports = { insertOne, insertAll, read, watch };
