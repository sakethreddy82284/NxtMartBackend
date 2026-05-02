const express = require("express");
const router = express.Router();
const { protect, restrictTo } = require("../middleware/authMiddleware");

const {
  createProduct,
  getProducts,
  getProductsByCategory,
  getSingleProduct,
  updateProduct,
  deleteProduct
} = require("../controllers/productController");

// ✅ PUBLIC ROUTES
router.get("/", getProducts);
router.get("/category/:categoryId", getProductsByCategory);
router.get("/single/:id", getSingleProduct);

// ✅ PROTECTED ROUTES (Manager/Admin Only)
router.use(protect);
router.use(restrictTo('manager', 'admin'));

router.post("/", createProduct);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);

module.exports = router;