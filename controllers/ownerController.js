import User from "../models/User.js";
import fs from "fs";
import ImageKit from "imagekit";
import Car from "../models/Car.js";
import Booking from "../models/Booking.js";

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

// 🔥 FIXED OWNER ID (Riddhi)
const OWNER_ID = "69d5f29074d724c9dd9805d8";


// ================= CHANGE ROLE (DISABLED) =================
export const changeRoleToOwner = async (req, res) => {
  return res.json({
    success: false,
    message: "Owner role cannot be changed",
  });
};


// ================= ADD CAR =================
export const addCar = async (req, res) => {
  try {

    const car = JSON.parse(req.body.carData);
    const imageFile = req.file;

    if (!imageFile) {
      return res.json({
        success: false,
        message: "Image required",
      });
    }

    const fileBuffer = fs.readFileSync(imageFile.path);

    const response = await imagekit.upload({
      file: fileBuffer,
      fileName: imageFile.originalname,
      folder: "/cars",
    });

    const optimizedImageURL = imagekit.url({
      path: response.filePath,
      transformation: [
        { width: "1280" },
        { quality: "auto" },
        { format: "webp" },
      ],
    });

    await Car.create({
      ...car,
      owner: OWNER_ID, // ✅ ALWAYS Riddhi
      image: optimizedImageURL,
    });

    res.json({
      success: true,
      message: "Car Added",
    });

  } catch (error) {
    console.log(error.message);

    res.json({
      success: false,
      message: error.message,
    });
  }
};


// ================= GET OWNER CARS =================
export const getOwnerCars = async (req, res) => {
  try {

    const cars = await Car.find({ owner: OWNER_ID });

    res.json({
      success: true,
      cars,
    });

  } catch (error) {
    console.log(error.message);

    res.json({
      success: false,
      message: error.message,
    });
  }
};


// ================= TOGGLE CAR AVAILABILITY =================
export const toggleCarAvailability = async (req, res) => {
  try {

    const { carId } = req.body;

    const car = await Car.findById(carId);

    if (car.owner.toString() !== OWNER_ID) {
      return res.json({
        success: false,
        message: "Unauthorized",
      });
    }

    car.isAvailable = !car.isAvailable;

    await car.save();

    res.json({
      success: true,
      message: "Availability Toggled",
    });

  } catch (error) {
    console.log(error.message);

    res.json({
      success: false,
      message: error.message,
    });
  }
};


// ================= DELETE CAR =================
export const deleteCar = async (req, res) => {
  try {

    const { carId } = req.body;

    const car = await Car.findById(carId);

    if (car.owner.toString() !== OWNER_ID) {
      return res.json({
        success: false,
        message: "Unauthorized",
      });
    }

    car.owner = null;
    car.isAvailable = false;

    await car.save();

    res.json({
      success: true,
      message: "Car removed",
    });

  } catch (error) {
    console.log(error.message);

    res.json({
      success: false,
      message: error.message,
    });
  }
};


// ================= DASHBOARD DATA =================
export const getDashboardData = async (req, res) => {
  try {

    const cars = await Car.find({ owner: OWNER_ID });

    const bookings = await Booking.find({ owner: OWNER_ID })
      .populate("car")
      .sort({ createdAt: -1 });

    const pendingBookings = await Booking.find({
      owner: OWNER_ID,
      status: "pending",
    });

    const completedBookings = await Booking.find({
      owner: OWNER_ID,
      status: "confirmed",
    });

    const monthlyRevenue = bookings
      .filter((booking) => booking.status === "confirmed")
      .reduce((total, booking) => total + booking.price, 0);

    const dashboardData = {
      totalCars: cars.length,
      totalBookings: bookings.length,
      pendingBookings: pendingBookings.length,
      completedBookings: completedBookings.length,
      recentBookings: bookings.slice(0, 3),
      monthlyRevenue,
    };

    res.json({
      success: true,
      dashboardData,
    });

  } catch (error) {
    console.log(error.message);

    res.json({
      success: false,
      message: error.message,
    });
  }
};


// ================= UPDATE PROFILE IMAGE =================
export const updateImage = async (req, res) => {
  try {

    const { _id } = req.user;

    const imageFile = req.file;

    if (!imageFile) {
      return res.json({
        success: false,
        message: "Image required",
      });
    }

    const fileBuffer = fs.readFileSync(imageFile.path);

    const response = await imagekit.upload({
      file: fileBuffer,
      fileName: imageFile.originalname,
      folder: "/users",
    });

    const imageUrl = imagekit.url({
      path: response.filePath,
      transformation: [
        { width: "500" },
        { quality: "auto" },
        { format: "webp" },
      ],
    });

    await User.findByIdAndUpdate(_id, { image: imageUrl });

    res.json({
      success: true,
      message: "Profile image updated",
      image: imageUrl,
    });

  } catch (error) {
    console.log(error.message);

    res.json({
      success: false,
      message: error.message,
    });
  }
};