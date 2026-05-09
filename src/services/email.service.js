import resend from "../configs/resend.config.js";
import { config } from "../configs/config.js";

const FROM_EMAIL = config.FROM_EMAIL.trim();

/**
 * @param {string} email - Recipient email
 * @param {string} otp - One-time password
 * @param {string} firstname - User's first name
 * @returns {Promise<{success: boolean, id?: string}>}
 */
export const sendOTP = async (email, otp, firstname = "User") => {
  try {
    console.log("SENDING TO:", email);
    console.log("USING FROM:", config.FROM_EMAIL);
    console.log("OTP VALUE:", otp);
    const { data, error } = await resend.emails.send({
      from: `FieldAbuser <${FROM_EMAIL}>`,
      to: [email.trim()],
      subject: "Your Verification Code",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333;">Hello ${firstname},</h2>
          <p>Your verification code is:</p>
          <div style="background: #f0f0f0; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
            <h1 style="color: #4F46E5; font-size: 36px; letter-spacing: 8px; margin: 0;">${otp}</h1>
          </div>
          <p style="color: #666;">This code will expire in <strong>10 minutes</strong>.</p>
          <p style="color: #999; font-size: 12px;">If you didn't request this, please ignore this email.</p>
        </div>
      `,
    });

    if (error) throw error;
    return { success: true, id: data?.id };
  } catch (err) {
    console.log("FULL RESEND ERROR:", JSON.stringify(err, null, 2));
    return { success: false };
  }
};

/**
 * @param {string} email - Recipient email
 * @param {string} firstname - User's first name
 * @returns {Promise<{success: boolean, id?: string}>}
 */
export const sendWelcomeEmail = async (email, firstname) => {
  try {
    console.log("SENDING TO:", email);
    console.log("USING FROM:", config.FROM_EMAIL);
    const { data, error } = await resend.emails.send({
      from: `FieldsAbuser <${FROM_EMAIL}>`,
      to: [email.trim()],
      subject: "Welcome to FieldAbuser!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #4F46E5;">Welcome, ${firstname}! 🎉</h1>
          <p>Your account has been successfully created.</p>
          <p>Start exploring our products and enjoy shopping!</p>
          <a href="${process.env.FRONTEND_URL}/products" 
             style="display: inline-block; background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 10px;">
            Browse Products
          </a>
        </div>
      `,
    });

    if (error) throw error;
    return { success: true, id: data?.id };
  } catch (err) {
    console.error("Welcome Email Error:", err);
    return { success: false, error: err.message };
  }
};

/**
 * @param {Object} email - Recipient email(s)
 * @param {Object} order - Order object with items and details
 * @returns {Promise<{success: boolean, id?: string}>}
 */
export const sendOrderConfirmation = async (email, order) => {
  const itemsList = order.items
    .map(
      (item) => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.title}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">Rs ${item.price}</td>
    </tr>
  `,
    )
    .join("");

  try {
    const { data, error } = await resend.emails.send({
      from: `YourApp <${FROM_EMAIL}>`,
      to: email,
      subject: `Order Confirmed #${order._id.toString().slice(-6)}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #4F46E5;">Order Confirmed! 📦</h1>
          <p>Thank you for your order. Here are the details:</p>
          
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <thead>
              <tr style="background: #f8f8f8;">
                <th style="padding: 10px; text-align: left;">Product</th>
                <th style="padding: 10px; text-align: center;">Qty</th>
                <th style="padding: 10px; text-align: right;">Price</th>
              </tr>
            </thead>
            <tbody>${itemsList}</tbody>
          </table>
          
          <div style="background: #f0f0f0; padding: 15px; border-radius: 8px; text-align: right;">
            <h3 style="margin: 0;">Total: Rs ${order.totalPrice}</h3>
          </div>
          
          <p style="margin-top: 20px; color: #666;">Status: <strong>${order.orderState}</strong></p>
        </div>
      `,
    });

    if (error) throw error;
    return { success: true, id: data?.id };
  } catch (err) {
    console.error("Order Email Error:", err);
    return { success: false, error: err.message };
  }
};

/**
 * @param {string} email - Recipient email
 * @param {string} resetLink - Password reset link
 * @param {string} firstname - User's first name
 * @returns {Promise<{success: boolean, id?: string}>}
 */
export const sendPasswordReset = async (email, resetLink, firstname) => {
  try {
    const { data, error } = await resend.emails.send({
      from: `YourApp <${FROM_EMAIL}>`,
      to: email,
      subject: "Password Reset Request",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333;">Hello ${firstname},</h2>
          <p>We received a request to reset your password.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" 
               style="background: #EF4444; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">This link will expire in 15 minutes.</p>
          <p style="color: #999; font-size: 12px;">If you didn't request this, please ignore.</p>
        </div>
      `,
    });

    if (error) throw error;
    return { success: true, id: data?.id };
  } catch (err) {
    console.error("Reset Email Error:", err);
    return { success: false, error: err.message };
  }
};
