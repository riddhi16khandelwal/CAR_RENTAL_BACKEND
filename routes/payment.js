const express = require("express");
const router = express.Router();

const {
  createBooking,
  verifyPayment,
} = require("../controllers/paymentController");

router.post("/create-booking", createBooking);
router.post("/verify-payment", verifyPayment);

module.exports = router;