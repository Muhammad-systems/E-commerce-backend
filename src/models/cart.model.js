import mongoose from "mongoose";

const cartSchema = mongoose.Schema({
  userId:{
    type:mongoose.Schema.Types.ObjectId,
    required:true,
    ref:"User"
  },
  items:[{
  product:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Product",
    required:true
  },
  quantity:{
    type:Number,
    default:1,
    min:[1,"Quantity can't be less than 1"]
  },
  price:{
    type:Number,
    required:true
  }}],
  bill:{
    type:Number,
    required:true,
    default:0
  }
}, { timestamps: true });

export const cartModel = mongoose.model("Cart", cartSchema);
