const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Category = require('./models/categoryModel');
const Product = require('./models/productModel');

dotenv.config();

const { DB_USER, DB_PASSWORD } = process.env;
const DB_URL = `mongodb+srv://${DB_USER}:${DB_PASSWORD}@cluster0.phmloij.mongodb.net/scholarspace_db`;

const categories = [
  { name: "Fruits & Vegetables", icon: "https://cdn-icons-png.flaticon.com/512/3194/3194591.png" },
  { name: "Dairy, Bread & Eggs", icon: "https://cdn-icons-png.flaticon.com/512/3050/3050158.png" },
  { name: "Snacks & Munchies", icon: "https://cdn-icons-png.flaticon.com/512/2553/2553691.png" },
  { name: "Cold Drinks & Juices", icon: "https://cdn-icons-png.flaticon.com/512/2405/2405479.png" },
  { name: "Meat, Fish & Eggs", icon: "https://cdn-icons-png.flaticon.com/512/706/706164.png" },
  { name: "Bakery & Biscuits", icon: "https://cdn-icons-png.flaticon.com/512/3014/3014530.png" },
  { name: "Breakfast & Instant Food", icon: "https://cdn-icons-png.flaticon.com/512/4669/4669353.png" },
  { name: "Tea, Coffee & Health Drinks", icon: "https://cdn-icons-png.flaticon.com/512/3121/3121557.png" },
  { name: "Personal Care", icon: "https://cdn-icons-png.flaticon.com/512/3120/3120150.png" },
  { name: "Home & Cleaning", icon: "https://cdn-icons-png.flaticon.com/512/2954/2954893.png" }
];

const productsData = [
  { 
    name: "Premium Alphonso Mango", 
    price: 499, 
    categoryName: "Fruits & Vegetables", 
    stock: 50, 
    image: "https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&q=80&w=800", 
    description: "Hand-picked Ratnagiri Alphonso Mangoes, the king of fruits." 
  },
  { 
    name: "Organic Hass Avocado", 
    price: 180, 
    categoryName: "Fruits & Vegetables", 
    stock: 40, 
    image: "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&q=80&w=800", 
    description: "Creamy, nutrient-rich organic Hass avocados." 
  },
  { 
    name: "Amul Gold Milk (1L)", 
    price: 66, 
    categoryName: "Dairy, Bread & Eggs", 
    stock: 200, 
    image: "https://images.unsplash.com/photo-1563636619-e9107da4a1bb?auto=format&fit=crop&q=80&w=800", 
    description: "Fresh, high-fat full cream milk." 
  },
  { 
    name: "Artisan Sourdough Bread", 
    price: 150, 
    categoryName: "Bakery & Biscuits", 
    stock: 20, 
    image: "https://images.unsplash.com/photo-1585478259715-876a23f1ffbb?auto=format&fit=crop&q=80&w=800", 
    description: "Freshly baked, crusty sourdough bread." 
  },
  { 
    name: "Lay's Classic Family Pack", 
    price: 50, 
    categoryName: "Snacks & Munchies", 
    stock: 300, 
    image: "https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&q=80&w=800", 
    description: "The world's favorite classic salted potato chips." 
  },
  { 
    name: "Cold Brew Coffee", 
    price: 199, 
    categoryName: "Tea, Coffee & Health Drinks", 
    stock: 60, 
    image: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&q=80&w=800", 
    description: "Smooth, 18-hour steeped cold brew coffee." 
  },
  { 
    name: "Wild Caught Salmon", 
    price: 899, 
    categoryName: "Meat, Fish & Eggs", 
    stock: 15, 
    image: "https://images.unsplash.com/photo-1485921325833-c519f76c4927?auto=format&fit=crop&q=80&w=800", 
    description: "Fresh, premium wild-caught Atlantic salmon." 
  },
  { 
    name: "Organic Almonds", 
    price: 450, 
    categoryName: "Breakfast & Instant Food", 
    stock: 100, 
    image: "https://images.unsplash.com/photo-1508061461508-cb18c242f556?auto=format&fit=crop&q=80&w=800", 
    description: "Crunchy, high-quality organic California almonds." 
  },
  { 
    name: "Luxury Soy Candle", 
    price: 599, 
    categoryName: "Home & Cleaning", 
    stock: 25, 
    image: "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&q=80&w=800", 
    description: "Hand-poured lavender scented soy candle." 
  },
  { 
    name: "Natural Face Serum", 
    price: 1200, 
    categoryName: "Personal Care", 
    stock: 30, 
    image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=800", 
    description: "Glow-enhancing natural face serum with Vitamin C." 
  }
];

async function seedDB() {
  try {
    await mongoose.connect(DB_URL);
    console.log("Connected to DB for seeding...");

    await Category.deleteMany({});
    await Product.deleteMany({});
    console.log("Cleared existing data.");

    const createdCategories = await Category.insertMany(categories);
    console.log(`Inserted ${createdCategories.length} categories.`);

    const productsToInsert = productsData.map(p => {
      const cat = createdCategories.find(c => c.name === p.categoryName);
      return { ...p, category: cat._id };
    });

    await Product.insertMany(productsToInsert);
    console.log(`Inserted ${productsToInsert.length} products.`);

    console.log("Database Re-Seeded with Ultra-Premium Images Successfully! 📸💎");
    process.exit();
  } catch (err) {
    console.error("Seeding Error:", err);
    process.exit(1);
  }
}

seedDB();
