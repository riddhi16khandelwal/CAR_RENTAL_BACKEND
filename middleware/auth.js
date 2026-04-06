import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.json({ success: false, message: "not authorized" });
    }

    // ✅ Bearer hatao
    const token = authHeader.split(" ")[1];

    // ✅ verify (NOT decode)
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded?.id) {
      return res.json({ success: false, message: "not authorized" });
    }

    // ✅ user attach karo
    req.user = await User.findById(decoded.id).select("-password");

    next();
  } catch (error) {
    console.log("Auth error:", error.message);
    return res.json({ success: false, message: "not authorized" });
  }
};