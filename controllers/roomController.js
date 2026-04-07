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

  if (client) {
  await client.del("rooms");
}

  res.json(room);
  } catch (err) {
  res.status(500).json({ message: "Server error" });
  }
};

exports.getRooms = async (req, res) => {
  try {

    if (client) {
      const cached = await client.get("rooms");

      if (cached) {
        console.log("From Redis");
        return res.json(JSON.parse(cached));
      }
    }

    const rooms = await Room.find();

    if (client) {
      await client.set("rooms", JSON.stringify(rooms), {
        EX: 60
      });
    }

    console.log("From DB");

    res.json(rooms);

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateRoom = async (req, res) => {
  try {
    const room = await Room.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (client) {
      await client.del("rooms");
    }

    res.json(room);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteRoom = async (req, res) => {
  try {
    await Room.findByIdAndDelete(req.params.id);

    if (client) {
      await client.del("rooms");
    }

    res.json({ message: "Room deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
