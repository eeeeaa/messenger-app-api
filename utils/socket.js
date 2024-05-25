//TODO implement real-time chat
const { Server } = require("socket.io");
const passport = require("passport");
require("dotenv").config();

const { userSocketHandler, userLeaves } = require("./sockets/userSocket");
const { roomSocketHandler } = require("./sockets/roomSocket");

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
    roomSocketHandler(io, socket);

    socket.on("disconnect", () => {
      console.log("🔥: A user disconnected");
      const user = socket.request.user;
      userLeaves(io, user);
      socket.disconnect();
    });
  });
}

module.exports = {
  initSocket,
};
