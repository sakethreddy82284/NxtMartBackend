const mongoose = require('mongoose');
const User = require('./models/userModel');
const dotenv = require('dotenv');
dotenv.config();

const { DB_USER, DB_PASSWORD } = process.env;
const DB_URL = `mongodb+srv://${DB_USER}:${DB_PASSWORD}@cluster0.phmloij.mongodb.net/scholarspace_db`;

async function checkAdmin() {
  try {
    await mongoose.connect(DB_URL);
    const admin = await User.findOne({ email: 'admin@gmail.com' });
    if (admin) {
      console.log('✅ Admin user exists in DB:', admin.email, 'Role:', admin.role);
    } else {
      console.log('❌ Admin user NOT found in DB!');
    }
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkAdmin();
