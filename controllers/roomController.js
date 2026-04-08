const client = require("../config/redis");
const Room = require("../models/Room");

exports.createRoom = async (req, res) => {
  try {
    const { name, capacity, type } = req.body;

    if (!name || !capacity || !type) {
      return res.status(400).json({ message: "Missing fields" });
    }

    if (!["workspace", "conference"].includes(type)) {
      return res.status(400).json({ message: "Invalid type" });
    }

    const room = await Room.create(req.body);

    // Invalidate Redis cache
    if (client && client.isOpen) {
      try {
        await client.del("rooms");
      } catch (err) {
        console.log("Redis DEL error:", err); // log but don’t fail
      }
    }

    res.json(room);
  } catch (err) {
    console.log("Error in createRoom:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getRooms = async (req, res) => {
  try {
    console.log("req.user:", req.user); // optional: check which user is calling

    let rooms;

    // Try to get rooms from Redis first
    if (client && client.isOpen) {
      try {
        const cached = await client.get("rooms");
        if (cached) {
          console.log("From Redis");
          rooms = JSON.parse(cached);
          return res.json(rooms);
        }
      } catch (err) {
        console.log("Redis GET error:", err); // log Redis errors but don’t fail
      }
    }

    // Fetch rooms from MongoDB
    rooms = await Room.find();
    console.log("From DB:", rooms);

    // Cache rooms in Redis (non-blocking)
    if (client && client.isOpen) {
      try {
        await client.set("rooms", JSON.stringify(rooms), { EX: 60 }); // cache for 60 sec
      } catch (err) {
        console.log("Redis SET error:", err); // log but don’t fail
      }
    }

    res.json(rooms);
  } catch (err) {
    console.log("Error in getRooms:", err);
    res.status(500).json({ message: err.message }); // show actual error message
  }
};

exports.updateRoom = async (req, res) => {
  try {
    const room = await Room.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    // Invalidate Redis cache
    if (client && client.isOpen) {
      try {
        await client.del("rooms");
      } catch (err) {
        console.log("Redis DEL error:", err);
      }
    }

    res.json(room);
  } catch (err) {
    console.log("Error in updateRoom:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteRoom = async (req, res) => {
  try {
    await Room.findByIdAndDelete(req.params.id);

    // Invalidate Redis cache
    if (client && client.isOpen) {
      try {
        await client.del("rooms");
      } catch (err) {
        console.log("Redis DEL error:", err);
      }
    }

    res.json({ message: "Room deleted" });
  } catch (err) {
    console.log("Error in deleteRoom:", err);
    res.status(500).json({ message: "Server error" });
  }
};