import mongoose from "mongoose";

/** Order schema - stores purchase orders with items and payment details */
const orderSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true },
        title: { type: String },
      },
    ],
    fullname: {
      firstname: {
        type: String,
        required: [true, "firstname is required"],
      },
      lastname: {
        type: String,
      },
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
    },
    address: {
      type: String,
      required: [true, "Address is required"],
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ["COD", "Online"],
    },
    status: {
      type: String,
      enum: ["pending", "paid", "shipped", "delivered"],
      default: "pending",
    },
    bill: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { timestamps: true },
);

/** Auto-calculates total bill before saving */
orderSchema.pre("save", function (next) {
  this.bill = this.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  next();
});

export const orderModel = mongoose.model("Order", orderSchema);
