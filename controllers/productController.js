// controllers/productController.js
const Product = require("../models/productModel");
const mongoose = require("mongoose");

// Create Product (Admin)
exports.createProduct = async (req, res) => {
  try {
    const { name, price, category, stock, image, description } = req.body;

    // Validation
    if (!name || !price || !category) {
      return res.status(400).json({
        success: false,
        message: "Name, price and category are required",
      });
    }

    // Check valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(category)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID",
      });
    }

    const product = await Product.create({
      name,
      price,
      category,
      stock,
      image,
      ingredients:description,
    });

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to create product",
      error: err.message,
    });
  }
};



// Get All Products (with filters, search, pagination)
exports.getProducts = async (req, res) => {
  try {
    let { page = 1, limit = 10, search, category, sort } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);

    const query = {};

    // 🔍 Search by name
    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    // 📂 Filter by category
    if (category && mongoose.Types.ObjectId.isValid(category)) {
      query.category = category;
    }

    // 🔄 Sorting
    let sortOption = {};
    if (sort === "price_asc") sortOption.price = 1;
    if (sort === "price_desc") sortOption.price = -1;
    if (sort === "new") sortOption.createdAt = -1;

    const total = await Product.countDocuments(query);

    const products = await Product.find(query)
      .populate("category", "name icon")
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      success: true,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: products,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch products",
      error: err.message,
    });
  }
};



// Get Products by Category
exports.getProductsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID",
      });
    }

    const products = await Product.find({ category: categoryId })
      .populate("category", "name icon");

    res.json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch category products",
      error: err.message,
    });
  }
};



// Get Single Product
exports.getSingleProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const product = await Product.findById(id).populate("category");

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.json({
      success: true,
      data: product,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch product",
      error: err.message,
    });
  }
};



// Update Product
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.json({
      success: true,
      message: "Product updated",
      data: product,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to update product",
      error: err.message,
    });
  }
};



// Delete Product
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.json({
      success: true,
      message: "Product deleted",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to delete product",
      error: err.message,
    });
  }
};