//TODO implement real-time chat
const { Server } = require("socket.io");
const passport = require("passport");
require("dotenv").config();

const { userSocketHandler } = require("./sockets/userSocket");

function initSocket(http) {
  const io = new Server(http, {
    allowEIO3: true,
    cors: { credentials: true, origin: process.env.SOCKET_CLIENT_URL },
  });

  io.engine.use((req, res, next) => {
    const isHandshake = req._query.sid === undefined;
    if (isHandshake) {
      passport.authenticate("jwt", { session: false })(req, res, next);
    } else {
      next();
    }
  });
  io.on("connection", (socket) => {
    console.log(`⚡: ${socket.id} user just connected!`);

    userSocketHandler(io, socket);

    socket.on("disconnect", () => {
      console.log("🔥: A user disconnected");

      //TODO remove user from active user list

      //Sends the list of users to the client
      //io.emit("newUserResponse", users);
      socket.disconnect();
    });
  });
}

module.exports = {
  initSocket,
};
