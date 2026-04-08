const Room = require("../models/Room");
const client = require("../config/redis"); // only used locally

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

    // Invalidate Redis cache only if client exists
    if (client && client.isOpen) {
      try {
        await client.del("rooms");
      } catch (err) {
        console.log("Redis DEL error:", err);
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
    let rooms;

    // Try Redis only if client exists
    if (client && client.isOpen) {
      try {
        const cached = await client.get("rooms");
        if (cached) {
          console.log("From Redis (local only)");
          return res.json(JSON.parse(cached));
        }
      } catch (err) {
        console.log("Redis GET error:", err);
      }
    }

    // Fetch from MongoDB
    rooms = await Room.find();
    console.log("From DB:", rooms);

    // Cache in Redis if client exists
    if (client && client.isOpen) {
      try {
        await client.set("rooms", JSON.stringify(rooms), { EX: 60 });
      } catch (err) {
        console.log("Redis SET error:", err);
      }
    }

    res.json(rooms);
  } catch (err) {
    console.log("Error in getRooms:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateRoom = async (req, res) => {
  try {
    const room = await Room.findByIdAndUpdate(req.params.id, req.body, { new: true });

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