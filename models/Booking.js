const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: "Room" },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  startTime: Date,
  endTime: Date,
});

module.exports = mongoose.model("Booking", bookingSchema);
