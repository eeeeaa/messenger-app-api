const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const MessageSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  room: { type: Schema.Types.ObjectId, ref: "Room", required: true },
  message_content: { type: String, default: "", maxLength: 200 },
  image_url: { type: String },
  created_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Message", MessageSchema);
