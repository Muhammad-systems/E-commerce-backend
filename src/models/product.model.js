import mongoose from "mongoose";
import { string } from "zod";

const productSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      minlength: [3, "Title must be 3 characters long"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    category: {
      type: String,
      required: true,
      enum: ["Electronics", "Fashion", "Home", "Beauty"],
    },
    price: {
      type: Number,
      required: true,
      min: [0, "Price cannot be negative"],
    },
    stock: {
      type: Number,
      required: true,
      default: 0,
    },
    images: [
      {url:{
        type: String,
        required: true,
      },
      fileId:{
        type:String,
        required:true,
      }
    }

    ],
  },
  { timestamps: true },
);

export const productModel = mongoose.model("Product", productSchema);
