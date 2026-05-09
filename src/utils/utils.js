import crypto from "crypto";

/**
 * @param {string} argName - Environment variable name
 * @param {any} value - Value to check
 * @throws {Error} If value is missing
 */
export const check = (argName, value) => {
  if (!value) {
    throw new Error(`Configuration Error: ${argName} not found in .env file`);
  }
};

/**
 * @returns {string} 6-digit OTP
 */
export const generateOtp = () => {
  return crypto.randomInt(100000, 999999).toString();
};
