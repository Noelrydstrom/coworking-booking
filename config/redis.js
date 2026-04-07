/*let client = null;

try {
  const { createClient } = require("redis");

  client = createClient({
    url: "redis://localhost:6379"
  });

  client.on("error", (err) => console.log("Redis error", err));

  (async () => {
    await client.connect();
    console.log("Redis connected");
  })();

} catch (err) {
  console.log("Redis not installed, skipping...");
}

module.exports = client;*/