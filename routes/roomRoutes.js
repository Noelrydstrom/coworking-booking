const router = require("express").Router();
const ctrl = require("../controllers/roomController");
const auth = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");

router.post("/", auth, admin, ctrl.createRoom);
router.get("/", auth, ctrl.getRooms);
router.put("/:id", auth, admin, ctrl.updateRoom);
router.delete("/:id", auth, admin, ctrl.deleteRoom);

module.exports = router;
