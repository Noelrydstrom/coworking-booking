require("dotenv").config();
const http = require("http");
const app = require("./app");
const mongoose = require("mongoose");

const server = http.createServer(app);

// Socket.IO
const io = require("socket.io")(server, {
  cors: { origin: "*" },
});

app.set("io", io);

// 🔥 STARTA SERVER DIREKT
server.listen(process.env.PORT || 3000, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});

// 🔥 CONNECT DB SEPARAT
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch(err => {
    console.log("MongoDB connection error:", err);
  });