const express = require("express");
const router = express.Router();
const verifyManager = require("../middleware/Role");
const {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoryController");

router.post("/",verifyManager, createCategory);
router.get("/", getCategories);
router.get("/:id", getCategoryById);
router.put("/:id",verifyManager, updateCategory);
router.delete("/:id",verifyManager, deleteCategory);

module.exports = router;