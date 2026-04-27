const mongoose = require("mongoose");
const bcrypt = require('bcrypt')

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      minlength: [3, "Name must be at least 3 characters"],
      maxlength: [50, "Name cannot exceed 50 characters"],
      trim: true,
      match: [/^[A-Za-z\s]+$/, "Name must contain only letters"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please use a valid email address",
      ],
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      validate: {
        validator: function (value) {
          return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(
            value
          );
        },
        message:
          "Password must include uppercase, lowercase, number and special character",
      },
    },

    role: {
      type: String,
      enum: ["customer", "manager", "delivery", "admin"],
      default: "customer",
    },

    isVerified: {
      type: Boolean,
      default: false,
    },
    phone: {
    type: String,
    required: [true, "Phone number is required"],
    validate: {
      validator: function (v) {
        return /^[6-9]\d{9}$/.test(v); // Indian format
      },
      message: "Enter a valid 10-digit phone number"
    }
  }
  },
  {
    timestamps: true, 
  }
);



module.exports = mongoose.model("Users",userSchema)