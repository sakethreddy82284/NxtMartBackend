const express = require("express");
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
} = require("../controllers/cartController.js");
const { protect } = require("../middleware/authMiddleware");
console.log("Protect middleware in cartRouter:", protect);

const router = express.Router();

// All routes are protected
router.use(protect);

// GET cart
router.get("/", getCart);

// ADD item
router.post("/add", addToCart);

// UPDATE quantity
router.put("/update", updateCartItem);

// REMOVE item
router.delete("/remove/:productId", removeFromCart);

// CLEAR cart
router.delete("/clear", clearCart);

module.exports = router;