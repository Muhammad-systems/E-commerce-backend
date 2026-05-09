/** Configuration module - loads environment variables */
import dotenv from "dotenv";
import { check } from "../utils/utils.js";

dotenv.config();

const PORT = process.env.PORT;
const JWT_SECRET = process.env.JWT_SECRET;
const DB_URI = process.env.DB_URI;
const EMAIL_API = process.env.EMAIL_API;
const FROM_EMAIL = process.env.FROM_EMAIL;
const IMG_KIT_PRIV_KEY = process.env.IMG_KIT_PRIV_KEY;

check("JWT_SECRET", JWT_SECRET);
check("DB_URI", DB_URI);
check("EMAIL_API", EMAIL_API);
check("FROM_EMAIL", FROM_EMAIL);
check('IMG_KIT_PRIV_KEY',IMG_KIT_PRIV_KEY)

/** Application configuration object */
export const config = {
  port: PORT || 3000,
  JWT_SECRET: JWT_SECRET,
  DB_URI: DB_URI,
  EMAIL_API: EMAIL_API,
  FROM_EMAIL: FROM_EMAIL,
  IMG_KIT_PRIV_KEY:IMG_KIT_PRIV_KEY
};
