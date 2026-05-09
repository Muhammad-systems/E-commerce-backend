import express from 'express'
import * as userAuthcontrollers from '../controllers/user.auth.controller.js'
import rateLimit from 'express-rate-limit';

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 5, 
  message: {
    success: false,
    message: "Too many attempts, please try again after 15 minutes"
  }
});

export const userAuthrouter = express.Router()

userAuthrouter.post('/register',userAuthcontrollers.register)
userAuthrouter.post('/verify-user',authLimiter,userAuthcontrollers.verifyAndLogin)
userAuthrouter.post('/login',userAuthcontrollers.login)
userAuthrouter.post('/logout',userAuthcontrollers.logOut)
userAuthrouter.post('/logout-all',userAuthcontrollers.logoutToAll)
userAuthrouter.post('/refresh-token',userAuthcontrollers.generateAccessToken)

