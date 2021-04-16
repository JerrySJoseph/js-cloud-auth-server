const socketio = require("socket.io");

let http = null;
let io = null;

const initConnection = (app, PORT) => {
  return new Promise((resolve, reject) => {
    try {
      //Create socket
      http = require("http").Server(app);
      io = socketio(http);

      //listen for events in socket
      http.listen(PORT, () => console.log("Socket listening on port: " + PORT));

      //resolve io instance
      resolve(io);
    } 
    catch (e) 
    {
      reject(e);
    }
  });
};

module.exports = { initConnection };
