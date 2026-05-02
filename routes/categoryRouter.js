const express = require("express");
const router = express.Router();
const { protect, restrictTo } = require("../middleware/authMiddleware");
const {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoryController");

// ✅ PUBLIC
router.get("/", getCategories);
router.get("/:id", getCategoryById);

// ✅ PROTECTED (Manager/Admin Only)
router.use(protect);
router.use(restrictTo('manager', 'admin'));

router.post("/", createCategory);
router.put("/:id", updateCategory);
router.delete("/:id", deleteCategory);

module.exports = router;