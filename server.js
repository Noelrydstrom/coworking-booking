require("dotenv").config();
const http = require("http");
const app = require("./app");
const mongoose = require("mongoose");

const server = http.createServer(app);

// 🔥 skapa socket.io DIREKT
const io = require("socket.io")(server, {
  cors: { origin: "*" },
});

app.set("io", io);

// 🔥 connect DB sen starta server
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");

    server.listen(process.env.PORT, () => {
      console.log(`Server running on port ${process.env.PORT}`);
    });
  })
  .catch(err => console.log(err));