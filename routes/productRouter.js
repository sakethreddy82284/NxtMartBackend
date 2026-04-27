const express = require("express");
const router = express.Router();
const verifyManager = require("../middleware/Role");

const {
  createProduct,
  getProducts,
  getProductsByCategory,
  getSingleProduct,
  updateProduct,
  deleteProduct
} = require("../controllers/productController");

// ✅ ALL ROUTES

router.post("/",verifyManager, createProduct);
router.get("/", getProducts);

// 🔥 IMPORTANT (you are using this in frontend)
router.get("/category/:categoryId", getProductsByCategory);

router.get("/single/:id", getSingleProduct);

router.put("/:id",verifyManager, updateProduct);

// 🔥 DELETE
router.delete("/:id",verifyManager, deleteProduct);

module.exports = router;