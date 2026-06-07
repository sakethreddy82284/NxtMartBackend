const mongoose = require("mongoose");
const bcrypt = require('bcryptjs');

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

    walletBalance: {
      type: Number,
      default: 0,
    },

    transactionHistory: [
      {
        amount: Number,
        type: { type: String, enum: ["credit", "debit"] },
        description: String,
        date: { type: Date, default: Date.now },
      },
    ],

    isVerified: {
      type: Boolean,
      default: false,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
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
    },
    address: {
      type: String,
      trim: true,
      maxlength: [200, "Address cannot exceed 200 characters"],
      default: ""
    }
  },
  {
    timestamps: true, 
  }
);

// 🔒 Pre-save hook to hash password
userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// 🔓 Method to compare passwords
userSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};



module.exports = mongoose.model("User", userSchema);