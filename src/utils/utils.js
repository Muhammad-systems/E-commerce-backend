import crypto from 'crypto'

export const check = (argName, value) => {
  if (!value) {
    throw new Error(`Configuration Error: ${argName} not found in .env file`);
  }
};

export const generateOtp = ()=>{
  return crypto.randomInt(100000, 999999).toString();
}

