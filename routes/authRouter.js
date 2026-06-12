const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { protect, restrictTo } = require("../middleware/authMiddleware");

router.post("/signup", authController.signup);
router.post("/signin", authController.signin);
router.post("/logout", authController.logout);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);

router.get("/me", protect, authController.getMe);
router.put("/update-profile", protect, authController.updateProfile);

// --- Admin User Management ---
router.get("/users", protect, restrictTo('admin'), authController.getAllUsers);
router.put("/update-role", protect, restrictTo('admin'), authController.updateUserRole);

// --- Helper for Managers ---
router.get("/partners", protect, restrictTo('manager', 'admin'), authController.getDeliveryPartners);

module.exports = router;