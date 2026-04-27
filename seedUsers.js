const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/authModel");


const DB_URL = "mongodb+srv://SAKETH:saketh123@cluster0.phmloij.mongodb.net/scholarspace_db";

mongoose.connect(DB_URL);

const seed = async () => {
  try {
    await User.deleteMany(); // optional

    const users = [
     
      {
        name: "Manager",
        email: "manager@gmail.com",
        password: await bcrypt.hash("Manager@82284", 10),
        role: "manager",
        phone: "9000000002",
        isVerified: true
      },
     

    ];

    await User.insertMany(users);

    console.log("✅ Fake users added");
    process.exit();

  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seed();