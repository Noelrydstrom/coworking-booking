const mongoose = require("mongoose");
const Booking = require("../models/Booking");
const Room = require("../models/Room"); // ✅ Importera Room

// Funktion för att kolla om ett rum är tillgängligt
const isAvailable = async (roomId, startTime, endTime) => {
  const conflict = await Booking.findOne({
    roomId,
    startTime: { $lt: endTime },
    endTime: { $gt: startTime },
  });
  return !conflict;
};

exports.createBooking = async (req, res) => {
  try {
    const { roomId, startTime, endTime } = req.body;

    // Kolla att roomId är valid
    if (!mongoose.Types.ObjectId.isValid(roomId)) {
      return res.status(400).json({ message: "Invalid room ID" });
    }

    // Kolla tider
    if (new Date(startTime) >= new Date(endTime)) {
      return res.status(400).json({ message: "Invalid time range" });
    }

    // Kolla att rummet finns
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    // Kolla om rummet redan är bokat
    const available = await isAvailable(roomId, startTime, endTime);
    if (!available) {
      return res.status(400).json({ message: "Room already booked" });
    }

    const booking = await Booking.create({
      roomId,
      userId: req.user.id,
      startTime,
      endTime,
    });

    // Skicka event via socket.io
    req.app.get("io").emit("booking_created", booking);

    console.log("Booking created Successfully");

    res.json(booking);

  } catch (err) {
    console.log(err); // Viktigt för felsökning
    res.status(500).json({ message: err.message });
  }
};

exports.updateBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Not found" });
    }

    // RBAC: Endast admin eller ägare kan uppdatera
    if (
      booking.userId.toString() !== req.user.id &&
      req.user.role !== "Admin"
    ) {
      return res.status(403).json({ message: "Not allowed" });
    }

    const updated = await Booking.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    req.app.get("io").emit("booking_updated", updated);

    console.log("Booking Updated Successfully");

    res.json(updated);

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Not found" });
    }

    // RBAC: Endast admin eller ägare kan ta bort
    if (
      booking.userId.toString() !== req.user.id &&
      req.user.role !== "Admin"
    ) {
      return res.status(403).json({ message: "Not allowed" });
    }

    await booking.deleteOne();

    req.app.get("io").emit("booking_deleted", booking);

    res.json({ message: "Deleted" });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user.id });
    res.json(bookings);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
};