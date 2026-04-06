const QRCode = require("qrcode");
const { v4: uuidv4 } = require("uuid");
const Booking = require("../models/Booking");

// CREATE BOOKING + QR
exports.createBooking = async (req, res) => {
  const { userId, carId, amount } = req.body;

  const bookingId = "BOOK_" + uuidv4().slice(0, 8);

  const booking = await Booking.create({
    userId,
    carId,
    amount,
    bookingId,
  });

  const upiLink = `upi://pay?pa=yourupi@upi&pn=CarRental&am=${amount}&cu=INR&tn=${bookingId}`;

  const qr = await QRCode.toDataURL(upiLink);

  res.json({
    bookingId,
    qr,
  });
};

// VERIFY PAYMENT
exports.verifyPayment = async (req, res) => {
  const { bookingId, transactionId } = req.body;

  const booking = await Booking.findOne({ bookingId });

  if (!booking) {
    return res.status(404).json({ message: "Booking not found" });
  }

  booking.paymentStatus = "completed";
  booking.transactionId = transactionId;

  await booking.save();

  res.json({ message: "Payment verified & booking confirmed" });
};