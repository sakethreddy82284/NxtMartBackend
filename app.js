const express = require('express')
const app = express();
const cors = require("cors")
app.use(express.json());
const dotenv=require('dotenv')
dotenv.config()
const cookieParser = require("cookie-parser");


const{PORT,DB_USER,DB_PASSWORD}=process.env

const DB_URL=`mongodb+srv://${DB_USER}:${DB_PASSWORD}@cluster0.phmloij.mongodb.net/scholarspace_db`

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));
app.use(require("cookie-parser")());

const authRouter = require('./routes/authRouter');
const categoryRouter = require('./routes/categoryRouter')
const { default: mongoose } = require('mongoose');

app.use("/auth",authRouter)
app.use("/categories",categoryRouter)
app.use("/products", require("./routes/productRouter"));
app.use("/cart", require("./routes/cartRouter"));
app.use("/orders", require("./routes/orderRouter"));



mongoose.connect(DB_URL)
.then(() => {
  console.log("database connected successfully");
  app.listen(PORT, () => {
    console.log(`app running at ${PORT}`);
  });
})
.catch((err) => {
  console.log("DB ERROR:", err);
});