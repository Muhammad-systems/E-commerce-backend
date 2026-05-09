import { config } from "../configs/config.js";
import mongoose from "mongoose";

export const dbConnect = async()=>{
  try {
    mongoose.connect(config.DB_URI);
    console.log('[DB connected]');
  } catch (error) {
    throw new Error("Db connection error" + error); 
  }
}