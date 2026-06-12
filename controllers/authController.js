const crypto = require('crypto');
const User = require('../models/authModel');
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// Generate JWT
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

const createPasswordResetToken = () => {
  const resetToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");
  return { resetToken, hashedToken };
};

// Sign up
const signup = async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    // Check existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    // Password will be hashed by pre-save hook in authModel

    // Create user
    const user = await User.create({
      name,
      email,
      password, // Plain text here, hashed in pre-save hook
      phone,
      role: role || "customer",
    });

    // Generate token
    const token = generateToken(user);

    // Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: true, // Must be true for sameSite: 'none'
      sameSite: "none", // Allows cross-origin sharing
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      success: true,
      message: "User registered & logged in",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
      },
    });

  } catch (err) {
    console.error("Signup error:", err);
    
    // Handle Mongoose Validation Errors
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: messages[0], // Return the first validation error message
        errors: err.errors
      });
    }

    res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

// Sign in
const signin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Compare password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Generate token
    const token = generateToken(user);

    // Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: true, // Must be true for sameSite: 'none'
      sameSite: "none", // Allows cross-origin sharing
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
      },
    });

  } catch (err) {
    console.error("Signin error:", err);
    res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

// Get current user
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user,
    });

  } catch (err) {
    console.error("GetMe error:", err);
    res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

// Update profile
const updateProfile = async (req, res) => {
  try {
    const { name, email, phone, address } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (name) user.name = name;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (address) user.address = address;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address
      }
    });
  } catch (err) {
    console.error("UpdateProfile error:", err);
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

// Log out
const logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: true,
    sameSite: "none"
  });
  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};

// Forgot password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "No account found with this email" });
    }

    const { resetToken, hashedToken } = createPasswordResetToken();
    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save({ validateBeforeSave: false });

    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
    const resetUrl = `${clientUrl}/auth/reset?token=${resetToken}`;
    console.log(`Password reset URL for ${email}: ${resetUrl}`);

    res.status(200).json({
      success: true,
      message: "Password reset link created. Use the token to reset your password.",
      resetToken,
      resetUrl,
    });
  } catch (err) {
    console.error("ForgotPassword error:", err);
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

// Reset password
const resetPassword = async (req, res) => {
  try {
    const { token, password, confirmPassword } = req.body;
    if (!token || !password || !confirmPassword) {
      return res.status(400).json({ success: false, message: "Token, password and confirm password are required" });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: "Passwords do not match" });
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid or expired reset token" });
    }

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    const jwtToken = generateToken(user);
    res.cookie("token", jwtToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({ success: true, message: "Password reset successful", user: { id: user._id, email: user.email, name: user.name, role: user.role } });
  } catch (err) {
    console.error("ResetPassword error:", err);
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

// Admin: Get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.status(200).json({ success: true, users });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching users" });
  }
};

// Admin: Update user role
const updateUserRole = async (req, res) => {
  try {
    const { userId, role } = req.body;
    const user = await User.findByIdAndUpdate(userId, { role }, { new: true });
    res.status(200).json({ success: true, message: `User role updated to ${role}`, user });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to update role" });
  }
};

// Get delivery partners
const getDeliveryPartners = async (req, res) => {
  try {
    const partners = await User.find({ role: 'delivery' }).select("name email phone");
    res.status(200).json({ success: true, partners });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching delivery partners" });
  }
};

module.exports = {
  signup,
  signin,
  logout,
  forgotPassword,
  resetPassword,
  getMe,
  updateProfile,
  getAllUsers,
  updateUserRole,
  getDeliveryPartners
};