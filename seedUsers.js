const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/authModel");

const DB_URL = "mongodb+srv://SAKETH:saketh123@cluster0.phmloij.mongodb.net/scholarspace_db";

const seed = async () => {
  try {
    console.log("⏳ Connecting to DB...");
    await mongoose.connect(DB_URL);
    
    console.log("🗑️ Clearing existing users...");
    await User.deleteMany();

    console.log("🌱 Seeding new users...");

    const users = [
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

    await User.insertMany(users);

    console.log("✅ All roles seeded successfully!");
    console.log("--------------------------------");
    console.log("Admin:    admin@gmail.com    / Admin@123");
    console.log("Manager:  manager@gmail.com  / Manager@123");
    console.log("Delivery: delivery@gmail.com / Delivery@123");
    console.log("Customer: customer@gmail.com / Customer@123");
    console.log("--------------------------------");
    
    process.exit();

  } catch (err) {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  }
};

seed();