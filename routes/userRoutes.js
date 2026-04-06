import express from "express";
import { loginUser, registerUser, getUserData } from "../controllers/userController.js";
import { protect } from "../middleware/auth.js"; 
import { getCars } from "../controllers/userController.js";
const userRouter = express.Router();

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.get("/data", protect, getUserData); 
userRouter.get("/cars", getCars);
export default userRouter;