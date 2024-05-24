const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const RoomSchema = new Schema({
  room_name: { type: String, required: true },
});

module.exports = mongoose.model("Room", RoomSchema);
