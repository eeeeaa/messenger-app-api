//TODO implement real-time chat
function initSocket(http) {
  const io = require("socket.io")(http);

  io.on("connection", (socket) => {
    socket.on("connectRoom", ({ name, room }, callback) => {
      const { user, error } = addUser(socket.id, name, room);
      if (error) return callback(error);
      socket.join(user.room);
      socket.in(room).emit("notification", {
        title: "Someone's here",
        description: `${user.name} just entered the room`,
      });
      io.in(room).emit("users", getUsers(room));
      callback();
    });

    socket.on("sendMessage", (message) => {
      const user = getUser(socket.id);
      io.in(user.room).emit("message", { user: user.name, text: message });
    });

    socket.on("disconnectRoom", () => {
      console.log("User disconnected");
      const user = deleteUser(socket.id);
      if (user) {
        io.in(user.room).emit("notification", {
          title: "Someone just left",
          description: `${user.name} just left the room`,
        });
        io.in(user.room).emit("users", getUsers(user.room));
      }
    });
  });
}

function getActiveRooms(io) {
  // Convert map into 2D list:
  // ==> [['4ziBKG9XFS06NdtVAAAH', Set(1)], ['room1', Set(2)], ...]
  const arr = Array.from(io.sockets.adapter.rooms);
  // Filter rooms whose name exist in set:
  // ==> [['room1', Set(2)], ['room2', Set(2)]]
  const filtered = arr.filter((room) => !room[1].has(room[0]));
  // Return only the room name:
  // ==> ['room1', 'room2']
  const res = filtered.map((i) => i[0]);
  return res;
}

module.exports = {
  initSocket,
  getActiveRooms,
};
