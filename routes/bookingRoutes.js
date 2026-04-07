const router = require("express").Router();
const ctrl = require("../controllers/bookingController");
const auth = require("../middleware/authMiddleware");

router.post("/", auth, ctrl.createBooking);
router.get("/", auth, ctrl.getBookings);
router.put("/:id", auth, ctrl.updateBooking);
router.delete("/:id", auth, ctrl.deleteBooking);

module.exports = router;
