const Cart = require("../models/cartModel.js");
const Product = require("../models/productModel.js");

// ➤ GET CART
const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id }).populate(
      "items.productId"
    );

    if (!cart) {
      return res.json({ items: [], totalAmount: 0 });
    }

    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ➤ ADD TO CART
const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    let cart = await Cart.findOne({ userId: req.user.id });

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (!cart) {
      cart = new Cart({
        userId: req.user.id,
        items: [],
        totalAmount: 0
      });
    }

    const existingItem = cart.items.find(
      (item) => item.productId.toString() === productId
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({
        productId,
        quantity,
        price: product.price
      });
    }

    // ➤ Recalculate total
    cart.totalAmount = cart.items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );

    await cart.save();
    const populatedCart = await Cart.findById(cart._id).populate("items.productId");
    res.json(populatedCart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ➤ UPDATE QUANTITY
const updateCartItem = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const item = cart.items.find(
      (i) => i.productId.toString() === productId
    );
    if (!item) return res.status(404).json({ message: "Item not found" });

    item.quantity = quantity;
    cart.totalAmount = cart.items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );

    await cart.save();
    const populatedCart = await Cart.findById(cart._id).populate("items.productId");
    res.json(populatedCart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ➤ REMOVE ITEM
const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;
    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items = cart.items.filter(
      (item) => item.productId.toString() !== productId
    );

    cart.totalAmount = cart.items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );

    await cart.save();
    const populatedCart = await Cart.findById(cart._id).populate("items.productId");
    res.json(populatedCart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ➤ CLEAR CART
const clearCart = async (req, res) => {
  try {
    await Cart.findOneAndDelete({ userId: req.user.id });
    res.json({ message: "Cart cleared" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
};