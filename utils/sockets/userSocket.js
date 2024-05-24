const User = require("../../models/user");

function userSocketHandler(io, socket) {
  socket.on("user online", () => {
    const user = socket.request.user;

    User.findByIdAndUpdate(user._id, { status: "Online" }, { new: true })
      .exec()
      .then((res) => {
        User.find({})
          .exec()
          .then((data) => {
            io.emit("usersResponse", data);
          });
      });
  });

  socket.on("user offline", () => {
    const user = socket.request.user;

    User.findByIdAndUpdate(user._id, { status: "Offline" }, { new: true })
      .exec()
      .then((res) => {
        User.find({})
          .exec()
          .then((data) => {
            io.emit("usersResponse", data);
          });
      });
  });
}

module.exports = {
  userSocketHandler,
};
