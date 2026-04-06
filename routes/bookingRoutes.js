import express from "express";
import {
  changeBookingStatus,
  checkAvailabilityOfCar,
  createBooking,
  getOwnerBookings,
  getUserBookings,
  verifyPayment,
} from "../controllers/bookingController.js";
import { generateQR } from "../controllers/bookingController.js";

import { protect } from "../middleware/auth.js";
import { deleteBooking } from "../controllers/bookingController.js";
const bookingRouter = express.Router();

bookingRouter.post("/check-availability", checkAvailabilityOfCar);

bookingRouter.post("/create", protect, createBooking);

bookingRouter.get("/user", protect, getUserBookings);

bookingRouter.get("/owner", protect, getOwnerBookings);

bookingRouter.post("/change-status", protect, changeBookingStatus);

bookingRouter.post("/verify-payment", protect, verifyPayment);
bookingRouter.post("/generate-qr", protect, generateQR);
bookingRouter.post("/delete", protect, deleteBooking);
export default bookingRouter;