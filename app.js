const express = require('express')
const app = express();
const cors = require("cors")
app.use(express.json());
const dotenv=require('dotenv')
dotenv.config()
const cookieParser = require("cookie-parser");


const{PORT,DB_USER,DB_PASSWORD}=process.env

const DB_URL=`mongodb+srv://${DB_USER}:${DB_PASSWORD}@cluster0.phmloij.mongodb.net/scholarspace_db`

const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:3000",
  "http://localhost:5174",
  "http://127.0.0.1:5174",
  "https://nxt-mart-frontend.vercel.app",
  "https://nxtmartfrontend.vercel.app"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    
    // Check if the origin matches local development or common deployment hosts
    const isAllowed = /^http:\/\/localhost:\d+$/.test(origin) || 
                      /^http:\/\/127\.0\.0\.1:\d+$/.test(origin) ||
                      origin.endsWith(".vercel.app") ||
                      origin.endsWith(".onrender.com") ||
                      origin.endsWith(".netlify.app") ||
                      origin.includes("nxtmart") ||
                      origin.includes("nxt-mart");
                      
    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(cookieParser());

const authRouter = require('./routes/authRouter');
const categoryRouter = require('./routes/categoryRouter');
const mongoose = require('mongoose');

app.use("/auth", authRouter);
app.use("/categories", categoryRouter);
app.use("/products", require("./routes/productRouter"));
app.use("/cart", require("./routes/cartRouter"));
app.use("/orders", require("./routes/orderRouter"));

mongoose.connect(DB_URL)
  .then(() => console.log("database connected successfully"))
  .catch((err) => console.log("DB ERROR:", err));

if (process.env.NODE_ENV !== 'production' || process.env.RENDER) {
  app.listen(PORT || 2000, () => {
    console.log(`app running at ${PORT || 2000}`);
  });
}

module.exports = app;