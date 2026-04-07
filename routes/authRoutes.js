const router = require("express").Router();
const { register, login } = require("../controllers/authController");
const { getUsers, deleteUser } = require("../controllers/authController");

router.post("/register", register);
router.post("/login", login);
router.get("/users", getUsers);
router.delete("/users/:id", deleteUser);

module.exports = router;
