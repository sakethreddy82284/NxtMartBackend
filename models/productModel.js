// models/Product.js
const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    price: {
      type: Number,
      required: true,
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    stock: {
      type: Number,
      default: 0,
    },

    image: String,
     ingredients: {
      type: String, // or Array (see below)
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);