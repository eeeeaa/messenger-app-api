const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const RoomSchema = new Schema({
  room_name: { type: String, required: true },
  users: { type: [Schema.Types.ObjectId], ref: "User" },
});

module.exports = mongoose.model("Room", RoomSchema);
