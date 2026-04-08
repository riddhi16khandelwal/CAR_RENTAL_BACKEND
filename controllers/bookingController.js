// import Booking from "../models/Booking.js";
// import Car from "../models/Car.js";
// import QRCode from "qrcode";
// import { v4 as uuidv4 } from "uuid";

// // 🔍 Check Availability
// const checkAvailability = async (car, pickupDate, returnDate) => {
//   const bookings = await Booking.find({
//     car,
//     pickupDate: { $lte: returnDate },
//     returnDate: { $gte: pickupDate },
//   });
//   return bookings.length === 0;
// };

// // 🚗 CHECK AVAILABLE CARS
// export const checkAvailabilityOfCar = async (req, res) => {
//   try {
//     const { location, pickupDate, returnDate } = req.body;

//     const cars = await Car.find({ location, isAvailable: true });

//     const availableCarsPromises = cars.map(async (car) => {
//       const isAvailable = await checkAvailability(
//         car._id,
//         pickupDate,
//         returnDate
//       );
//       return { ...car._doc, isAvailable };
//     });

//     let availableCars = await Promise.all(availableCarsPromises);

//     availableCars = availableCars.filter(
//       (car) => car.isAvailable === true
//     );

//     res.json({ success: true, availableCars });

//   } catch (error) {
//     res.json({ success: false, message: error.message });
//   }
// };

// // 🧾 CREATE BOOKING + QR
// export const createBooking = async (req, res) => {
//   try {
//     const { _id } = req.user;
//     const { car, pickupDate, returnDate } = req.body;

//     if (!car || !pickupDate || !returnDate) {
//       return res.json({ success: false, message: "All fields required" });
//     }

//     const isAvailable = await checkAvailability(car, pickupDate, returnDate);

//     if (!isAvailable) {
//       return res.json({ success: false, message: "Car not available" });
//     }

//     const carData = await Car.findById(car);

//     if (!carData) {
//       return res.json({ success: false, message: "Car not found" });
//     }

//     const picked = new Date(pickupDate);
//     const returned = new Date(returnDate);

//     if (returned <= picked) {
//       return res.json({ success: false, message: "Invalid dates" });
//     }

//     const days = Math.ceil((returned - picked) / (1000 * 60 * 60 * 24));
//     const price = carData.pricePerDay * days;

//     const bookingId = "BOOK_" + uuidv4().slice(0, 8);

//     await Booking.create({
//       car,
//       owner: carData.owner,
//       user: _id,
//       pickupDate,
//       returnDate,
//       price,
//       bookingId,
//       paymentStatus: "pending",
//       status: "pending",
//     });

//     const upiLink = `upi://pay?pa=yourupi@upi&pn=CarRental&am=${price}&cu=INR&tn=${bookingId}`;
//     const qr = await QRCode.toDataURL(upiLink);

//     res.json({
//       success: true,
//       bookingId,
//       qr,
//       amount: price,
//     });

//   } catch (error) {
//     console.log(error);
//     res.json({ success: false, message: error.message });
//   }
// };

// // 💳 VERIFY PAYMENT
// export const verifyPayment = async (req, res) => {
//   try {
//     const { bookingId, transactionId } = req.body;

//     if (!bookingId || !transactionId) {
//       return res.json({ success: false, message: "Missing details" });
//     }

//     if (transactionId.length < 5) {
//       return res.json({ success: false, message: "Invalid Transaction ID" });
//     }

//     const booking = await Booking.findOne({ bookingId });

//     if (!booking) {
//       return res.json({ success: false, message: "Booking not found" });
//     }

//     if (booking.paymentStatus === "completed") {
//       return res.json({ success: false, message: "Already paid" });
//     }

//     booking.paymentStatus = "completed";
//     booking.transactionId = transactionId;
//     booking.status = "confirmed";

//     await booking.save();

//     res.json({ success: true, message: "Booking Confirmed ✅" });

//   } catch (error) {
//     res.json({ success: false, message: error.message });
//   }
// };

// // 📄 USER BOOKINGS
// export const getUserBookings = async (req, res) => {
//   try {
//     const { _id } = req.user;

//     const bookings = await Booking.find({ user: _id })
//       .populate("car")
//       .sort({ createdAt: -1 });

//     res.json({ success: true, bookings });

//   } catch (error) {
//     res.json({ success: false, message: error.message });
//   }
// };

// // 👑 OWNER BOOKINGS
// export const getOwnerBookings = async (req, res) => {
//   try {
//     if (req.user.role !== "owner") {
//       return res.json({ success: false, message: "Unauthorized" });
//     }

//     const bookings = await Booking.find({ owner: req.user._id })
//       .populate("car user")
//       .select("-user.password")
//       .sort({ createdAt: -1 });

//     res.json({ success: true, bookings });

//   } catch (error) {
//     res.json({ success: false, message: error.message });
//   }
// };

// // 🔄 CHANGE STATUS
// export const changeBookingStatus = async (req, res) => {
//   try {
//     const { _id } = req.user;
//     const { bookingId, status } = req.body;

//     const booking = await Booking.findById(bookingId);

//     if (!booking || booking.owner.toString() !== _id.toString()) {
//       return res.json({ success: false, message: "Unauthorized" });
//     }

//     booking.status = status;
//     await booking.save();

//     res.json({ success: true, message: "Status Updated" });

//   } catch (error) {
//     res.json({ success: false, message: error.message });
//   }
// };

import Booking from "../models/Booking.js";
import Car from "../models/Car.js";
import QRCode from "qrcode";
import { v4 as uuidv4 } from "uuid";

// 🔍 Check Availability
const checkAvailability = async (car, pickupDate, returnDate) => {
  const bookings = await Booking.find({
    car,
    pickupDate: { $lte: returnDate },
    returnDate: { $gte: pickupDate },
  });
  return bookings.length === 0;
};

// 🚗 CHECK AVAILABLE CARS
export const checkAvailabilityOfCar = async (req, res) => {
  try {
    const { location, pickupDate, returnDate } = req.body;

    const cars = await Car.find({ location, isAvailable: true });

    const availableCarsPromises = cars.map(async (car) => {
      const isAvailable = await checkAvailability(
        car._id,
        pickupDate,
        returnDate
      );
      return { ...car._doc, isAvailable };
    });

    let availableCars = await Promise.all(availableCarsPromises);

    availableCars = availableCars.filter(
      (car) => car.isAvailable === true
    );

    res.json({ success: true, availableCars });

  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// 🧾 CREATE BOOKING (NO QR HERE)
export const createBooking = async (req, res) => {
  try {
     const userId = req.user.id;
    const { car, pickupDate, returnDate } = req.body;

    if (!car || !pickupDate || !returnDate) {
      return res.json({ success: false, message: "All fields required" });
    }

    const isAvailable = await checkAvailability(car, pickupDate, returnDate);

    if (!isAvailable) {
      return res.json({ success: false, message: "Car not available" });
    }

    const carData = await Car.findById(car);

    if (!carData) {
      return res.json({ success: false, message: "Car not found" });
    }

    const picked = new Date(pickupDate);
    const returned = new Date(returnDate);

    if (returned <= picked) {
      return res.json({ success: false, message: "Invalid dates" });
    }

    const days = Math.ceil((returned - picked) / (1000 * 60 * 60 * 24));
    const price = carData.pricePerDay * days;

    const bookingId = "BOOK_" + uuidv4().slice(0, 8);

    await Booking.create({
      car,
      owner: carData.owner,
      user: _id,
      pickupDate,
      returnDate,
      price,
      bookingId,
      paymentStatus: "pending",
      status: "pending",
    });

    res.json({
      success: true,
      message: "Booking Created (Pending Approval)",
      bookingId,
    });

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// 💳 GENERATE QR (AFTER CONFIRM)
export const generateQR = async (req, res) => {
  try {
    const { bookingId } = req.body;

    const booking = await Booking.findOne({ bookingId });

    if (!booking) {
      return res.json({ success: false, message: "Booking not found" });
    }

    if (booking.status !== "confirmed") {
      return res.json({
        success: false,
        message: "Booking not confirmed yet",
      });
    }

    const upiLink = `upi://pay?pa=8394819963@ibl&pn=CarRental&am=${booking.price}&cu=INR&tn=${bookingId}`;

    const qr = await QRCode.toDataURL(upiLink);

    res.json({
      success: true,
      qr,
    });

  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// 💳 VERIFY PAYMENT
export const verifyPayment = async (req, res) => {
  try {
    const { bookingId, transactionId } = req.body;

    if (!bookingId || !transactionId) {
      return res.json({ success: false, message: "Missing details" });
    }

    const booking = await Booking.findOne({ bookingId });

    if (!booking) {
      return res.json({ success: false, message: "Booking not found" });
    }

    booking.paymentStatus = "completed";
    booking.transactionId = transactionId;

    await booking.save();

    res.json({ success: true, message: "Payment Verified ✅" });

  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// 📄 USER BOOKINGS
export const getUserBookings = async (req, res) => {
  try {
    const { _id } = req.user;

    const bookings = await Booking.find({ user: _id })
      .populate("car")
      .sort({ createdAt: -1 });

    res.json({ success: true, bookings });

  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// 👑 OWNER BOOKINGS
export const getOwnerBookings = async (req, res) => {
  try {
    if (req.user.role !== "owner") {
      return res.json({ success: false, message: "Unauthorized" });
    }

    const bookings = await Booking.find({
      owner: req.user._id,
    })
      .populate("car user")
      .select("-user.password")
      .sort({ createdAt: -1 });

    res.json({ success: true, bookings });

  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// 🔄 CHANGE STATUS (🔥 FIXED)
export const changeBookingStatus = async (req, res) => {
  try {
    const { _id } = req.user;
    const { bookingId, status } = req.body;

    const booking = await Booking.findOne({ bookingId }); // ✅ FIX

    if (!booking || booking.owner.toString() !== _id.toString()) {
      return res.json({ success: false, message: "Unauthorized" });
    }

    booking.status = status;
    await booking.save();

    res.json({ success: true, message: "Status Updated" });

  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const deleteBooking = async (req, res) => {
  try {
    const { bookingId } = req.body;

    const booking = await Booking.findOne({ bookingId });

    if (!booking) {
      return res.json({ success: false, message: "Booking not found" });
    }

    await Booking.deleteOne({ bookingId });

    res.json({ success: true, message: "Booking deleted ✅" });

  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};