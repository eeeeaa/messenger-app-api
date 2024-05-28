const User = require("../../models/user");
const Message = require("../../models/message");
const Room = require("../../models/room");

function roomSocketHandler(io, socket) {
  socket.on("join room", (roomid) => {
    console.log(`a user join room ${roomid}`);
    const user = socket.request.user;
    socket.join(roomid);
    Message.find({ room: roomid })
      .populate("user", "username display_name")
      .exec()
      .then((res) => {
        io.to(roomid).emit("onJoinRoom", user);
        io.to(roomid).emit("messageResponse", res);
      });
  });

  socket.on("leaves room", (roomid) => {
    console.log(`a user leaves room ${roomid}`);
    const user = socket.request.user;
    socket.leave(roomid);
    Message.find({ room: roomid })
      .populate("user", "username display_name")
      .exec()
      .then((res) => {
        io.to(roomid).emit("onLeaveRoom", user);
        io.to(roomid).emit("messageResponse", res);
      });
  });

  socket.on("send message", ({ roomid, message }) => {
    const user = socket.request.user;
    const obj = new Message({
      user: user._id,
      room: roomid,
      message_content: message,
    });

    obj.save().then(() => {
      Message.find({ room: roomid })
        .populate("user", "username display_name")
        .exec()
        .then((res) => {
          io.to(roomid).emit("messageResponse", res);
        });
    });
  });
}

module.exports = {
  roomSocketHandler,
};
