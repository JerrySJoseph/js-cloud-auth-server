const db = require("./db/dynamicDB-database");
const dbHandler = require("./handlers/db-request-handler");

let io = null;
let invokes = [];
let count = 0;

async function begin(_io) {
  io = _io;
  registerEvents(io);
  db.ConnectToDb().then(() => {
    console.log("Connected to dynamic db");
  });

  return io;
}

function registerEvents(io) {
  //Listening to events
  io.on("connection", (socket) => {
    socket.on("js-cloud-dynamic-db-insert-one", (data, ack) => {
      handleInsertOne(data, ack);
    });
    socket.on("js-cloud-dynamic-db-insert-all", (data, ack) => {
      handleInsertAll(data, ack);
    });
    socket.on("js-cloud-dynamic-db-read", (data, ack) => {
      handleRead(data, ack);
    });
    socket.on("js-cloud-dynamic-db-observe", (data, ack) => {
      handleObserve(data, ack, socket);
    });
  });
}

function handleInsertOne(data, ack) {
  dbHandler.insertOne(data, ack);
}
function handleInsertAll(data, ack) {
  dbHandler.insertAll(data, ack);
}
function handleRead(data, ack) {
  dbHandler.read(data, ack);
}
function handleObserve(data, ack, socket) {
  try {
    const roomName = `${data}-observe-room`;

    if (!socket.rooms.has(roomName)) {
      socket.join(roomName);
      console.log("joined to room : " + roomName);
      dbHandler.watch(data, (next) => {
        const { operationType, fullDocument } = next;
        console.log(operationType);

        const reponseobject = {
          observeType: operationType,
          collectionName: data,
          result: fullDocument,
        };
        io.to(roomName).emit(
          `${data}-onchange-event`,
          true,
          data,
          JSON.stringify(reponseobject)
        );
      });
    }

    ack(true, "observe event registered", `${data}-onchange-event`);
  } catch (error) {
    ack(false, error.message, null);
  }
}

module.exports = { begin };
