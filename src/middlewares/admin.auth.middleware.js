import jwt from "jsonwebtoken";
import { config } from "../configs/config.js";

export const isAdmin = (req, res, next) => {
  try{
  const accessToken = req.cookies.accessToken;
  if (!accessToken)
    return res.status(400).json({
      success: false,
      message: "Invalid or expired token",
    });

  const decoded = jwt.verify(accessToken, config.JWT_SECRET);

  if (decoded.role != "admin")
    return res.status(403).json({
      success: false,
      message: "Access denied. Admins only.",
    });

  req.user = decoded
  next()
  
  }catch(error){
    return res.status(500).json({
      success:false,
      message:"Internal server error"+error.message
    })
  }
};
