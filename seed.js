const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Category = require('./models/categoryModel');
const Product = require('./models/productModel');
const User = require('./models/authModel'); // Added User model
const bcrypt = require('bcryptjs'); // Added bcrypt for passwords

dotenv.config();

const { DB_USER, DB_PASSWORD } = process.env;
const DB_URL = `mongodb+srv://${DB_USER}:${DB_PASSWORD}@cluster0.phmloij.mongodb.net/scholarspace_db`;

const categoriesData = [
  { name: "Fruits & Vegetables", icon: "https://cdn-icons-png.flaticon.com/512/3194/3194591.png" },
  { name: "Dairy, Bread & Eggs", icon: "https://cdn-icons-png.flaticon.com/512/3050/3050158.png" },
  { name: "Atta, Rice, Oil & Dals", icon: "https://cdn-icons-png.flaticon.com/512/2600/2600260.png" },
  { name: "Meat, Fish & Eggs", icon: "https://cdn-icons-png.flaticon.com/512/706/706164.png" },
  { name: "Masala & Dry Fruits", icon: "https://cdn-icons-png.flaticon.com/512/2909/2909761.png" },
  { name: "Breakfast & Sauces", icon: "https://cdn-icons-png.flaticon.com/512/4669/4669353.png" },
  { name: "Packaged Food", icon: "https://cdn-icons-png.flaticon.com/512/2553/2553691.png" },
  { name: "Zepto Cafe", icon: "https://cdn-icons-png.flaticon.com/512/3121/3121557.png" },
  { name: "Tea, Coffee & More", icon: "https://cdn-icons-png.flaticon.com/512/3121/3121557.png" },
  { name: "Ice Creams & More", icon: "https://cdn-icons-png.flaticon.com/512/938/938063.png" },
  { name: "Frozen Food", icon: "https://cdn-icons-png.flaticon.com/512/2362/2362313.png" }
];

const usersData = async () => [
  {
    name: "Super Admin",
    email: "admin@gmail.com",
    password: await bcrypt.hash("Admin@123", 10),
    role: "admin",
    phone: "9876543210",
    isVerified: true
  },
  {
    name: "Store Manager",
    email: "manager@gmail.com",
    password: await bcrypt.hash("Manager@123", 10),
    role: "manager",
    phone: "9000000002",
    isVerified: true
  },
  {
    name: "Delivery Partner",
    email: "delivery@gmail.com",
    password: await bcrypt.hash("Delivery@123", 10),
    role: "delivery",
    phone: "9111111111",
    isVerified: true
  },
  {
    name: "Loyal Customer",
    email: "customer@gmail.com",
    password: await bcrypt.hash("Customer@123", 10),
    role: "customer",
    phone: "9222222222",
    isVerified: true
  }
];

const generateProducts = (categories) => {
  const products = [];
  const baseImages = [
    "https://images.unsplash.com/photo-1553279768-865429fa0078", // Mango
    "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578", // Avocado
    "https://images.unsplash.com/photo-1563636619-e9107da4a1bb", // Milk
    "https://images.unsplash.com/photo-1585478259715-876a23f1ffbb", // Bread
    "https://images.unsplash.com/photo-1566478989037-eec170784d0b", // Chips
    "https://images.unsplash.com/photo-1517701604599-bb29b565090c", // Coffee
    "https://images.unsplash.com/photo-1485921325833-c519f76c4927", // Salmon
    "https://images.unsplash.com/photo-1508061461508-cb18c242f556", // Almonds
    "https://images.unsplash.com/photo-1603006905003-be475563bc59", // Candle
    "https://images.unsplash.com/photo-1620916566398-39f1143ab7be"  // Serum
  ];

  categories.forEach(cat => {
    for (let i = 1; i <= 10; i++) {
      products.push({
        name: `${cat.name} Product ${i}`,
        price: Math.floor(Math.random() * 500) + 50,
        mrp: Math.floor(Math.random() * 300) + 600,
        categoryName: cat.name,
        stock: Math.floor(Math.random() * 100) + 10,
        image: `${baseImages[i % 10]}?auto=format&fit=crop&q=80&w=800`,
        packSize: i % 2 === 0 ? "500g" : "1 kg",
        rating: (4 + Math.random()).toFixed(1),
        reviews: (Math.floor(Math.random() * 20) + 1) + "k"
      });
    }
  });
  return products;
};

async function seedDB() {
  try {
    await mongoose.connect(DB_URL);
    console.log("Connected to DB for seeding...");

    await Category.deleteMany({});
    await Product.deleteMany({});
    await User.deleteMany({}); // Added
    console.log("Cleared existing data.");

    const createdCategories = await Category.insertMany(categoriesData);
    console.log(`Inserted ${createdCategories.length} categories.`);

    const productsData = generateProducts(categoriesData);
    const productsToInsert = productsData.map(p => {
      const cat = createdCategories.find(c => c.name === p.categoryName);
      return { ...p, category: cat._id };
    });

    await Product.insertMany(productsToInsert);
    console.log(`Inserted ${productsToInsert.length} products.`);

    // Seed Users
    const finalUsers = await usersData();
    await User.insertMany(finalUsers);
    console.log(`Inserted ${finalUsers.length} role-based users.`);

    console.log("Database Fully Re-Seeded! 🚀");
    process.exit();
  } catch (err) {
    console.error("Seeding Error:", err);
    process.exit(1);
  }
}

seedDB();
