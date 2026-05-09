import { userModel } from "../models/user.model.js";
import { sessionModel } from "../models/session.model.js";
import { registerValidate, loginValidate } from "../validations/validation.js";
import bcrypt from "bcrypt";
import { generateOtp } from "../utils/utils.js";
import { sendOTP, sendWelcomeEmail } from "../services/email.service.js";
import jwt from "jsonwebtoken";
import { config } from "../configs/config.js";
import crypto from "crypto";

export const verifyAndLogin = async (req, res) => {
  try {
    const { otp } = req.body;
    const { tempToken } = req.cookies;

    if (!tempToken) return res.status(400).json({ message: "Session expired" });
    const decoded = jwt.verify(tempToken, config.JWT_SECRET);
    const email = decoded.email;

    const user = await userModel.findOne({ email });

    if (!user || user.otp !== otp || user.otpExpiry < Date.now()) {
      return res
        .status(400)
        .json({ success: false, message: "Wrong or expired otp" });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    const session = await sessionModel.create({
      userId: user._id,
      refreshTokenHash: "pending",
      ip: req.ip,
      userAgent: req.headers["user-agent"],
    });

    const refreshToken = jwt.sign(
      { id: user._id, sessionId: session._id, role: user.role },
      config.JWT_SECRET,
      {
        expiresIn: "7d",
      },
    );
    const accessToken = jwt.sign(
      { id: user._id, sessionId: session._id, role: user.role },
      config.JWT_SECRET,
      {
        expiresIn: "15m",
      },
    );

    const refreshTokenHash = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");

    session.refreshTokenHash = refreshTokenHash;
    await session.save();

    console.log("Attempting to send welcome email to:", email);
    await sendWelcomeEmail(email, user.fullname.firstname);

    res
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "Strict",
      })
      .cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: "Strict",
      })
      .clearCookie("tempToken")
      .status(200)
      .json({
        success: true,
        message: "Registration successfull",
        user,
      });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const register = async (req, res) => {
  let user;
  try {
    const result = registerValidate.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error.issues[0].message,
      });
    }

    const { fullname, email, password } = result.data;

    const userExists = await userModel.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }

    const hashPass = await bcrypt.hash(password, 10);
    const otp = generateOtp();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

    user = await userModel.create({
      fullname: {
        firstname: fullname.firstname,
        lastname: fullname.lastname,
      },
      email,
      password: hashPass,
      otp,
      otpExpiry,
    });
    const emailRes = await sendOTP(email, otp, fullname.firstname);
    console.log(email, otp, fullname.firstname);

    if (!emailRes.success) {
      if (user) await userModel.findByIdAndDelete(user._id);
      return res.status(400).json({
        success: false,
        message: "Email sending failed. Please try again.",
      });
    }

    const tempToken = jwt.sign({ email: user.email }, config.JWT_SECRET, {
      expiresIn: "10m",
    });

    res.cookie("tempToken", tempToken, {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
      maxAge: 10 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: `OTP sent to ${email}`,
    });
  } catch (error) {
    if (user && user._id) {
      await userModel.findByIdAndDelete(user._id);
      console.log("Unverified user deleted due to email failure.");
    }
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const login = async (req, res) => {
  try {
    const result = loginValidate.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error.issues[0].message,
      });
    }
    const { email, password } = result.data;
    const user = await userModel.findOne({ email }).select("+password");
    if (!user)
      return res
        .status(400)
        .json({ success: false, message: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res
        .status(400)
        .json({ success: false, message: "Invalid email or password" });

    const session = await sessionModel.create({
      userId: user._id,
      ip: req.ip,
      refreshTokenHash: "pending",
      userAgent: req.headers["user-agent"],
    });

    const refreshToken = jwt.sign(
      { id: user._id, sessionId: session._id, role: user.role },
      config.JWT_SECRET,
      { expiresIn: "7d" },
    );

    const refreshTokenHash = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");

    const accessToken = jwt.sign(
      { id: user._id, sessionId: session._id, role: user.role },
      config.JWT_SECRET,
      { expiresIn: "15m" },
    );
    session.refreshTokenHash = refreshTokenHash;
    await session.save();

    res
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "Strict",
      })
      .cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: "Strict",
      });
    const userData = user.toObject();
    delete userData.password;
    return res.status(200).json({
      success: true,
      message: "Login successfully",
      user: userData,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error" + error.message,
    });
  }
};

export const logOut = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: "Refresh token not found",
      });
    }
    const decoded = jwt.verify(refreshToken, config.JWT_SECRET);
    if (!decoded)
      return res
        .status(400)
        .json({ success: false, message: "something went wrong" });

    const session = await sessionModel.findOne({ _id: decoded.sessionId });
    if (!session)
      return res
        .status(400)
        .json({ success: false, message: "Session invalid or expired" });

    session.revoked = true;
    await session.save();

    res.clearCookie("refreshToken").clearCookie("accessToken");
    return res.status(200).json({
      success: true,
      message: "Logout successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error: " + error.message,
    });
  }
};

export const generateAccessToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken)
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });

    const decoded = jwt.verify(refreshToken, config.JWT_SECRET);
    if (!decoded.sessionId)
      return res
        .status(401)
        .json({ success: false, message: "Invalid Token Structure" });

    const session = await sessionModel.findOne({
      _id: decoded.sessionId,
      revoked: false,
    });

    if (!session)
      return res
        .status(401)
        .json({ success: false, message: "Invalid Session" });

    const currentHash = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");
    if (currentHash !== session.refreshTokenHash)
      return res
        .status(401)
        .json({ success: false, message: "Token mismatch" });

    const accessToken = jwt.sign(
      { id: decoded.id, sessionId: session._id, role: decoded.role },
      config.JWT_SECRET,
      { expiresIn: "15m" },
    );
    const newRefreshToken = jwt.sign(
      { id: decoded.id, sessionId: session._id, role: decoded.role },
      config.JWT_SECRET,
      { expiresIn: "7d" },
    );

    session.refreshTokenHash = crypto
      .createHash("sha256")
      .update(newRefreshToken)
      .digest("hex");
    await session.save();

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      sameSite: "strict",
      secure: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      sameSite: "strict",
      secure: true,
      maxAge: 15 * 60 * 1000,
    });

    return res.status(200).json({ success: true, accessToken });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error" + error.message,
    });
  }
};

export const logoutToAll = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: "Refresh token not found",
      });
    }
    const decoded = jwt.verify(refreshToken, config.JWT_SECRET);
    await sessionModel.updateMany(
      {
        userId: decoded.id,
        revoked: false,
      },
      { revoked: true },
    );

    res.clearCookie("refreshToken");
    res.status(200).json({
      success: true,
      message: "logout from all devices",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal sever error" + error.message,
    });
  }
};
