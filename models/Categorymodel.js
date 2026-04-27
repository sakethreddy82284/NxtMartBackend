const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [50, "Name cannot exceed 50 characters"],
      unique: true
    },

    icon: {
      type: String,
      required: [true, "Category icon is required"],
      // you can store:
      // - image URL
      // - icon class (like fontawesome)
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Category", categorySchema);