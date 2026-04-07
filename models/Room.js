const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({
  name: String,
  capacity: Number,
  type: { type: String, enum: ["workspace", "conference"] },
});

module.exports = mongoose.model("Room", roomSchema);
