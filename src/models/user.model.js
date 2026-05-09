import mongoose from 'mongoose'

const userSchema = mongoose.Schema({
  fullname:{
    firstname:{
      type:String,
      required:[true,'Firstname is required'],
    },
    lastname:{
      type:String,
    }

  },

  email:{
    type:String,
    required:true,
    unique:true
  },

  password:{
    type:String,
    select:false
  },

  role:{
    type:String,
    enum:['admin','user'],
    default:'user'
  },

  isVerified:{
    type:Boolean,
    default: false
  },

  otp:{
    type:String,
    default:null
  },
  
  otpExpiry:{
    type:Date,
    default:null
  }
},{timestamps:true})

export const userModel = mongoose.model('User',userSchema);