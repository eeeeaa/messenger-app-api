const User = require("../../models/user");

function userSocketHandler(io, socket) {
  socket.on("fetch users", () => {
    User.find({})
      .exec()
      .then((res) => {
        if (res.length > 10) {
          io.emit("usersResponse", res.slice(0, 9));
        } else {
          io.emit("usersResponse", res);
        }
      });
  });
  socket.on("user online", () => {
    const user = socket.request.user;

    User.findByIdAndUpdate(user._id, { status: "Online" }, { new: true })
      .exec()
      .then((res) => {
        User.find({})
          .exec()
          .then((res) => {
            io.emit("usersResponse", res);
          });
      });
  });

  socket.on("user refresh", () => {
    User.find({})
      .exec()
      .then((res) => {
        io.emit("usersResponse", res);
      });
  });

  socket.on("user offline", () => {
    const user = socket.request.user;

    User.findByIdAndUpdate(user._id, { status: "Offline" }, { new: true })
      .exec()
      .then((res) => {
        User.find({})
          .exec()
          .then((res) => {
            io.emit("usersResponse", res);
          });
      });

    socket.disconnect();
  });

  socket.on("update profile", (user) => {
    io.emit("profileResponse", user);
  });
}

module.exports = {
  userSocketHandler,
};
