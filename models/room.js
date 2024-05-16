const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const RoomSchema = new Schema({
  room_name: { type: String, required: true },
  users: {
    type: [{ type: Schema.Types.ObjectId, ref: "User" }],
    validate: [arrayLimit, "{PATH} exceeds the limit of 5"],
  },
});

function arrayLimit(val) {
  return val.length <= 5;
}

module.exports = mongoose.model("Room", RoomSchema);
