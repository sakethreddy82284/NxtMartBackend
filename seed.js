const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Category = require('./models/categoryModel');
const Product = require('./models/productModel');
const User = require('./models/authModel');
const bcrypt = require('bcryptjs');

dotenv.config();

const { DB_USER, DB_PASSWORD } = process.env;
const DB_URL = `mongodb+srv://${DB_USER}:${DB_PASSWORD}@cluster0.phmloij.mongodb.net/scholarspace_db`;

const categoriesData = [
  { name: "Fruits & Vegetables", icon: "https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=400&auto=format" },
  { name: "Dairy, Bread & Eggs", icon: "https://images.unsplash.com/photo-1528750955925-53f5a1bc9d3e?w=400&auto=format" },
  { name: "Atta, Rice, Oil & Dals", icon: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&auto=format" },
  { name: "Meat, Fish & Eggs", icon: "https://images.unsplash.com/photo-1603048297172-c92544798d5e?w=400&auto=format" },
  { name: "Masala & Dry Fruits", icon: "https://images.unsplash.com/photo-1615485243382-998aa601fbf7?w=400&auto=format" },
  { name: "Breakfast & Sauces", icon: "https://images.unsplash.com/photo-1589113331515-996420556276?w=400&auto=format" },
  { name: "Packaged Food", icon: "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400&auto=format" },
  { name: "Zepto Cafe", icon: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=400&auto=format" },
  { name: "Tea, Coffee & More", icon: "https://images.unsplash.com/photo-1544787210-22bb840c5d6f?w=400&auto=format" },
  { name: "Ice Creams & More", icon: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&auto=format" },
  { name: "Frozen Food", icon: "https://images.unsplash.com/photo-1599490659223-930b447ffad6?w=400&auto=format" }
];

const usersData = async () => [
  { name: "Super Admin", email: "admin@gmail.com", password: await bcrypt.hash("Admin@123", 10), role: "admin", phone: "9876543210", isVerified: true },
  { name: "Store Manager", email: "manager@gmail.com", password: await bcrypt.hash("Manager@123", 10), role: "manager", phone: "9000000002", isVerified: true },
  { name: "Delivery Partner", email: "delivery@gmail.com", password: await bcrypt.hash("Delivery@123", 10), role: "delivery", phone: "9111111111", isVerified: true },
  { name: "Loyal Customer", email: "customer@gmail.com", password: await bcrypt.hash("Customer@123", 10), role: "customer", phone: "9222222222", isVerified: true }
];

const rawProducts = [
  // Fruits & Vegetables (10)
  { name: "Alphonso Mango", price: 349, mrp: 450, categoryName: "Fruits & Vegetables", image: "https://images.unsplash.com/photo-1553279768-865429fa0078", packSize: "1 kg" },
  { name: "Royal Gala Apple", price: 180, mrp: 220, categoryName: "Fruits & Vegetables", image: "https://images.unsplash.com/photo-1567306226416-28f0efdc88ce", packSize: "500g" },
  { name: "Banana Robusta", price: 40, mrp: 55, categoryName: "Fruits & Vegetables", image: "https://images.unsplash.com/photo-1528825831134-452600d86ad1", packSize: "6 pcs" },
  { name: "Fresh Broccoli", price: 89, mrp: 120, categoryName: "Fruits & Vegetables", image: "https://images.unsplash.com/photo-1453306458620-5bbef13a5bca", packSize: "250g" },
  { name: "Red Onions", price: 45, mrp: 60, categoryName: "Fruits & Vegetables", image: "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb", packSize: "1 kg" },
  { name: "Green Capsicum", price: 30, mrp: 40, categoryName: "Fruits & Vegetables", image: "https://images.unsplash.com/photo-1589605403259-7557eed943f6", packSize: "250g" },
  { name: "Fresh Carrots", price: 60, mrp: 80, categoryName: "Fruits & Vegetables", image: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37", packSize: "500g" },
  { name: "Sweet Potato", price: 70, mrp: 90, categoryName: "Fruits & Vegetables", image: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d", packSize: "500g" },
  { name: "Cherry Tomatoes", price: 50, mrp: 70, categoryName: "Fruits & Vegetables", image: "https://images.unsplash.com/photo-1590641329141-893ec1f14ec0", packSize: "200g" },
  { name: "Baby Spinach", price: 35, mrp: 45, categoryName: "Fruits & Vegetables", image: "https://images.unsplash.com/photo-1576045057995-568f588f82fb", packSize: "100g" },

  // Dairy, Bread & Eggs (10)
  { name: "Amul Butter", price: 255, mrp: 270, categoryName: "Dairy, Bread & Eggs", image: "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d", packSize: "500g" },
  { name: "Fresh Brown Eggs", price: 95, mrp: 110, categoryName: "Dairy, Bread & Eggs", image: "https://images.unsplash.com/photo-1498654077810-12c21d4d6dc3", packSize: "6 pcs" },
  { name: "Full Cream Milk", price: 33, mrp: 35, categoryName: "Dairy, Bread & Eggs", image: "https://images.unsplash.com/photo-1528750955925-53f5a1bc9d3e", packSize: "500ml" },
  { name: "Harvest Gold Bread", price: 40, mrp: 45, categoryName: "Dairy, Bread & Eggs", image: "https://images.unsplash.com/photo-1509440159596-0249088772ff", packSize: "400g" },
  { name: "Mother Dairy Paneer", price: 85, mrp: 90, categoryName: "Dairy, Bread & Eggs", image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7", packSize: "200g" },
  { name: "Amul Cheese Slices", price: 135, mrp: 140, categoryName: "Dairy, Bread & Eggs", image: "https://images.unsplash.com/photo-1486297678162-ad2a19b85f5d", packSize: "10 pcs" },
  { name: "Dahi (Curd)", price: 30, mrp: 32, categoryName: "Dairy, Bread & Eggs", image: "https://images.unsplash.com/photo-1485921325833-c519f76c4927", packSize: "400g" },
  { name: "Brown Bread", price: 50, mrp: 55, categoryName: "Dairy, Bread & Eggs", image: "https://images.unsplash.com/photo-1509440159596-0249088772ff", packSize: "400g" },
  { name: "Vanilla Greek Yogurt", price: 65, mrp: 75, categoryName: "Dairy, Bread & Eggs", image: "https://images.unsplash.com/photo-1516421350711-2c09192534f5", packSize: "150g" },
  { name: "Lassi Fresh", price: 25, mrp: 28, categoryName: "Dairy, Bread & Eggs", image: "https://images.unsplash.com/photo-1550583724-1255818c0ffb", packSize: "200ml" },

  // Atta, Rice, Oil & Dals (10)
  { name: "Aashirvaad Atta", price: 420, mrp: 460, categoryName: "Atta, Rice, Oil & Dals", image: "https://images.unsplash.com/photo-1509440159596-0249088772ff", packSize: "5 kg" },
  { name: "Fortune Soya Oil", price: 145, mrp: 165, categoryName: "Atta, Rice, Oil & Dals", image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5", packSize: "1 L" },
  { name: "Basmati Rice", price: 580, mrp: 650, categoryName: "Atta, Rice, Oil & Dals", image: "https://images.unsplash.com/photo-1586201375761-83865001e31c", packSize: "5 kg" },
  { name: "Tur Dal", price: 160, mrp: 180, categoryName: "Atta, Rice, Oil & Dals", image: "https://images.unsplash.com/photo-1516746853232-a526685712e0", packSize: "1 kg" },
  { name: "Chana Dal", price: 95, mrp: 110, categoryName: "Atta, Rice, Oil & Dals", image: "https://images.unsplash.com/photo-1626074353765-517a681e40be", packSize: "1 kg" },
  { name: "Moong Dal", price: 140, mrp: 160, categoryName: "Atta, Rice, Oil & Dals", image: "https://images.unsplash.com/photo-1615485243382-998aa601fbf7", packSize: "1 kg" },
  { name: "Sunflower Oil", price: 155, mrp: 175, categoryName: "Atta, Rice, Oil & Dals", image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5", packSize: "1 L" },
  { name: "Sugar Crystal", price: 48, mrp: 55, categoryName: "Atta, Rice, Oil & Dals", image: "https://images.unsplash.com/photo-1581448662191-7a1306362760", packSize: "1 kg" },
  { name: "Table Salt", price: 25, mrp: 28, categoryName: "Atta, Rice, Oil & Dals", image: "https://images.unsplash.com/photo-1518110925495-5fe2fda0442c", packSize: "1 kg" },
  { name: "Rajma Red", price: 180, mrp: 200, categoryName: "Atta, Rice, Oil & Dals", image: "https://images.unsplash.com/photo-1585998084532-66e7d6928923", packSize: "1 kg" },

  // Meat, Fish & Eggs (10)
  { name: "Chicken Breast", price: 280, mrp: 320, categoryName: "Meat, Fish & Eggs", image: "https://images.unsplash.com/photo-1604503468506-a8da13d82791", packSize: "500g" },
  { name: "Fresh Salmon", price: 850, mrp: 990, categoryName: "Meat, Fish & Eggs", image: "https://images.unsplash.com/photo-1485921325833-c519f76c4927", packSize: "250g" },
  { name: "Mutton Curry Cut", price: 750, mrp: 850, categoryName: "Meat, Fish & Eggs", image: "https://images.unsplash.com/photo-1603048297172-c92544798d5e", packSize: "500g" },
  { name: "Chicken Wings", price: 180, mrp: 220, categoryName: "Meat, Fish & Eggs", image: "https://images.unsplash.com/photo-1527477396000-e27163b481c2", packSize: "500g" },
  { name: "Basa Fish Fillet", price: 320, mrp: 380, categoryName: "Meat, Fish & Eggs", image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2", packSize: "500g" },
  { name: "Tiger Prawns", price: 550, mrp: 650, categoryName: "Meat, Fish & Eggs", image: "https://images.unsplash.com/photo-1565689157206-0fddef7589a2", packSize: "250g" },
  { name: "Chicken Lollipop", price: 160, mrp: 200, categoryName: "Meat, Fish & Eggs", image: "https://images.unsplash.com/photo-1562967914-608f82629710", packSize: "500g" },
  { name: "Whole Chicken", price: 220, mrp: 250, categoryName: "Meat, Fish & Eggs", image: "https://images.unsplash.com/photo-1587593817642-8b941de15da1", packSize: "1 kg" },
  { name: "Duck Eggs", price: 120, mrp: 150, categoryName: "Meat, Fish & Eggs", image: "https://images.unsplash.com/photo-1498654077810-12c21d4d6dc3", packSize: "6 pcs" },
  { name: "Crab Fresh", price: 450, mrp: 550, categoryName: "Meat, Fish & Eggs", image: "https://images.unsplash.com/photo-1559742811-822873691df8", packSize: "500g" },

  // Masala & Dry Fruits (10)
  { name: "Turmeric Powder", price: 45, mrp: 60, categoryName: "Masala & Dry Fruits", image: "https://images.unsplash.com/photo-1615485243382-998aa601fbf7", packSize: "100g" },
  { name: "Chilli Powder", price: 55, mrp: 70, categoryName: "Masala & Dry Fruits", image: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d", packSize: "100g" },
  { name: "Cashew Nuts", price: 280, mrp: 350, categoryName: "Masala & Dry Fruits", image: "https://images.unsplash.com/photo-1508061461508-cb18c242f556", packSize: "250g" },
  { name: "Almonds Premium", price: 250, mrp: 320, categoryName: "Masala & Dry Fruits", image: "https://images.unsplash.com/photo-1534431988102-1818817743b5", packSize: "250g" },
  { name: "Raisins Golden", price: 120, mrp: 150, categoryName: "Masala & Dry Fruits", image: "https://images.unsplash.com/photo-1592394933696-1200ae30294e", packSize: "250g" },
  { name: "Pistachios", price: 350, mrp: 450, categoryName: "Masala & Dry Fruits", image: "https://images.unsplash.com/photo-1591882006745-f09b23b5f903", packSize: "250g" },
  { name: "Walnuts Inshell", price: 450, mrp: 600, categoryName: "Masala & Dry Fruits", image: "https://images.unsplash.com/photo-1508061461508-cb18c242f556", packSize: "500g" },
  { name: "Dates Medjool", price: 650, mrp: 800, categoryName: "Masala & Dry Fruits", image: "https://images.unsplash.com/photo-1508061461508-cb18c242f556", packSize: "500g" },
  { name: "Garam Masala", price: 85, mrp: 110, categoryName: "Masala & Dry Fruits", image: "https://images.unsplash.com/photo-1615485243382-998aa601fbf7", packSize: "100g" },
  { name: "Cumin Seeds", price: 65, mrp: 80, categoryName: "Masala & Dry Fruits", image: "https://images.unsplash.com/photo-1615485243382-998aa601fbf7", packSize: "100g" },

  // Breakfast & Sauces (10)
  { name: "Ketchup Classic", price: 120, mrp: 145, categoryName: "Breakfast & Sauces", image: "https://images.unsplash.com/photo-1589113331515-996420556276", packSize: "500g" },
  { name: "Peanut Butter", price: 250, mrp: 300, categoryName: "Breakfast & Sauces", image: "https://images.unsplash.com/photo-1590301157890-4810ed352733", packSize: "350g" },
  { name: "Corn Flakes", price: 180, mrp: 210, categoryName: "Breakfast & Sauces", image: "https://images.unsplash.com/photo-1521483451569-e33803c0330c", packSize: "500g" },
  { name: "Honey Pure", price: 350, mrp: 400, categoryName: "Breakfast & Sauces", image: "https://images.unsplash.com/photo-1558642452-9d2a7deb7f62", packSize: "500g" },
  { name: "Muesli Fruit", price: 420, mrp: 500, categoryName: "Breakfast & Sauces", image: "https://images.unsplash.com/photo-1510130387422-82ea439b1a11", packSize: "500g" },
  { name: "Chocolate Spread", price: 320, mrp: 380, categoryName: "Breakfast & Sauces", image: "https://images.unsplash.com/photo-1512568400610-64da2d9b567e", packSize: "350g" },
  { name: "Jam Strawberry", price: 140, mrp: 160, categoryName: "Breakfast & Sauces", image: "https://images.unsplash.com/photo-1621245053457-3f339178972e", packSize: "500g" },
  { name: "Oats Quaker", price: 185, mrp: 210, categoryName: "Breakfast & Sauces", image: "https://images.unsplash.com/photo-1511117833452-c392b3a4369d", packSize: "1 kg" },
  { name: "Mayonnaise Eggless", price: 160, mrp: 190, categoryName: "Breakfast & Sauces", image: "https://images.unsplash.com/photo-1589113331515-996420556276", packSize: "500g" },
  { name: "Choco Muesli", price: 450, mrp: 550, categoryName: "Breakfast & Sauces", image: "https://images.unsplash.com/photo-1510130387422-82ea439b1a11", packSize: "500g" },

  // Packaged Food (10)
  { name: "Lay's Classic", price: 20, mrp: 20, categoryName: "Packaged Food", image: "https://images.unsplash.com/photo-1566478989037-eec170784d0b", packSize: "50g" },
  { name: "Oreo Biscuits", price: 30, mrp: 35, categoryName: "Packaged Food", image: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35", packSize: "120g" },
  { name: "Maggi Noodles", price: 96, mrp: 96, categoryName: "Packaged Food", image: "https://images.unsplash.com/photo-1612929633738-8fe44f7ec841", packSize: "560g" },
  { name: "Hide & Seek", price: 45, mrp: 50, categoryName: "Packaged Food", image: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35", packSize: "120g" },
  { name: "Dark Fantasy", price: 55, mrp: 60, categoryName: "Packaged Food", image: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35", packSize: "150g" },
  { name: "Kurkure Masala", price: 20, mrp: 20, categoryName: "Packaged Food", image: "https://images.unsplash.com/photo-1566478989037-eec170784d0b", packSize: "50g" },
  { name: "Doritos Nachos", price: 50, mrp: 50, categoryName: "Packaged Food", image: "https://images.unsplash.com/photo-1566478989037-eec170784d0b", packSize: "100g" },
  { name: "KitKat 4 Finger", price: 40, mrp: 40, categoryName: "Packaged Food", image: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35", packSize: "38g" },
  { name: "Snickers Bar", price: 50, mrp: 50, categoryName: "Packaged Food", image: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35", packSize: "50g" },
  { name: "Bingo Mad Angles", price: 20, mrp: 20, categoryName: "Packaged Food", image: "https://images.unsplash.com/photo-1566478989037-eec170784d0b", packSize: "50g" },

  // Zepto Cafe (10)
  { name: "Iced Americano", price: 149, mrp: 199, categoryName: "Zepto Cafe", image: "https://images.unsplash.com/photo-1517701604599-bb29b565090c", packSize: "300ml" },
  { name: "Classic Cappuccino", price: 169, mrp: 219, categoryName: "Zepto Cafe", image: "https://images.unsplash.com/photo-1534778101976-62847782c213", packSize: "250ml" },
  { name: "Hot Hazelnut Latte", price: 189, mrp: 249, categoryName: "Zepto Cafe", image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735", packSize: "250ml" },
  { name: "Paneer Tikka Roll", price: 129, mrp: 159, categoryName: "Zepto Cafe", image: "https://images.unsplash.com/photo-1628102478985-83cd8633c56d", packSize: "1 pc" },
  { name: "Chicken Tikka Roll", price: 149, mrp: 179, categoryName: "Zepto Cafe", image: "https://images.unsplash.com/photo-1604503468506-a8da13d82791", packSize: "1 pc" },
  { name: "Butter Croissant", price: 89, mrp: 119, categoryName: "Zepto Cafe", image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a", packSize: "1 pc" },
  { name: "Choco Chip Cookie", price: 49, mrp: 69, categoryName: "Zepto Cafe", image: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e", packSize: "1 pc" },
  { name: "Cold Coffee", price: 159, mrp: 209, categoryName: "Zepto Cafe", image: "https://images.unsplash.com/photo-1572286258217-40142c1c6a70", packSize: "300ml" },
  { name: "Masala Chai Hot", price: 49, mrp: 69, categoryName: "Zepto Cafe", image: "https://images.unsplash.com/photo-1544787210-22bb840c5d6f", packSize: "150ml" },
  { name: "Veg Puff", price: 39, mrp: 59, categoryName: "Zepto Cafe", image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a", packSize: "1 pc" },

  // Tea, Coffee & More (10)
  { name: "Tata Tea Gold", price: 145, mrp: 160, categoryName: "Tea, Coffee & More", image: "https://images.unsplash.com/photo-1544787210-22bb840c5d6f", packSize: "250g" },
  { name: "Nescafe Classic", price: 285, mrp: 310, categoryName: "Tea, Coffee & More", image: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e", packSize: "100g" },
  { name: "Bru Instant", price: 175, mrp: 195, categoryName: "Tea, Coffee & More", image: "https://images.unsplash.com/photo-1517701604599-bb29b565090c", packSize: "100g" },
  { name: "Green Tea Tulsi", price: 220, mrp: 250, categoryName: "Tea, Coffee & More", image: "https://images.unsplash.com/photo-1544787210-22bb840c5d6f", packSize: "25 pcs" },
  { name: "Taj Mahal Tea", price: 260, mrp: 290, categoryName: "Tea, Coffee & More", image: "https://images.unsplash.com/photo-1544787210-22bb840c5d6f", packSize: "500g" },
  { name: "Davidoff Coffee", price: 550, mrp: 650, categoryName: "Tea, Coffee & More", image: "https://images.unsplash.com/photo-1517701604599-bb29b565090c", packSize: "100g" },
  { name: "Chamomile Tea", price: 350, mrp: 400, categoryName: "Tea, Coffee & More", image: "https://images.unsplash.com/photo-1544787210-22bb840c5d6f", packSize: "20 pcs" },
  { name: "Lemon Tea Mix", price: 180, mrp: 210, categoryName: "Tea, Coffee & More", image: "https://images.unsplash.com/photo-1544787210-22bb840c5d6f", packSize: "500g" },
  { name: "Filter Coffee Mix", price: 120, mrp: 150, categoryName: "Tea, Coffee & More", image: "https://images.unsplash.com/photo-1517701604599-bb29b565090c", packSize: "200g" },
  { name: "Red Label Tea", price: 135, mrp: 150, categoryName: "Tea, Coffee & More", image: "https://images.unsplash.com/photo-1544787210-22bb840c5d6f", packSize: "250g" },

  // Ice Creams & More (10)
  { name: "Kwality Walls Choco", price: 199, mrp: 220, categoryName: "Ice Creams & More", image: "https://images.unsplash.com/photo-1563805042-7684c019e1cb", packSize: "700ml" },
  { name: "Amul Vanilla Tub", price: 150, mrp: 170, categoryName: "Ice Creams & More", image: "https://images.unsplash.com/photo-1570197781416-b39808821e82", packSize: "1 L" },
  { name: "Cornetto Choco", price: 40, mrp: 40, categoryName: "Ice Creams & More", image: "https://images.unsplash.com/photo-1557142046-c704a3adf364", packSize: "1 pc" },
  { name: "Magnum Truffle", price: 90, mrp: 90, categoryName: "Ice Creams & More", image: "https://images.unsplash.com/photo-1563805042-7684c019e1cb", packSize: "1 pc" },
  { name: "Oreo Ice Cream", price: 250, mrp: 280, categoryName: "Ice Creams & More", image: "https://images.unsplash.com/photo-1563805042-7684c019e1cb", packSize: "500ml" },
  { name: "Butterscotch Tub", price: 180, mrp: 210, categoryName: "Ice Creams & More", image: "https://images.unsplash.com/photo-1563805042-7684c019e1cb", packSize: "700ml" },
  { name: "Kulfi Stick", price: 30, mrp: 35, categoryName: "Ice Creams & More", image: "https://images.unsplash.com/photo-1563805042-7684c019e1cb", packSize: "1 pc" },
  { name: "Fruit Sorbet", price: 120, mrp: 150, categoryName: "Ice Creams & More", image: "https://images.unsplash.com/photo-1563805042-7684c019e1cb", packSize: "500ml" },
  { name: "Cassata Slice", price: 65, mrp: 80, categoryName: "Ice Creams & More", image: "https://images.unsplash.com/photo-1563805042-7684c019e1cb", packSize: "1 pc" },
  { name: "Moose Tracks", price: 320, mrp: 380, categoryName: "Ice Creams & More", image: "https://images.unsplash.com/photo-1563805042-7684c019e1cb", packSize: "1 L" },

  // Frozen Food (10)
  { name: "McCain Smiles", price: 145, mrp: 160, categoryName: "Frozen Food", image: "https://images.unsplash.com/photo-1599490659223-930b447ffad6", packSize: "400g" },
  { name: "Frozen Peas", price: 95, mrp: 120, categoryName: "Frozen Food", image: "https://images.unsplash.com/photo-1592394933696-1200ae30294e", packSize: "500g" },
  { name: "Veg Pizza Base", price: 65, mrp: 80, categoryName: "Frozen Food", image: "https://images.unsplash.com/photo-1513104890138-7c749659a591", packSize: "2 pcs" },
  { name: "Frozen Corn", price: 85, mrp: 110, categoryName: "Frozen Food", image: "https://images.unsplash.com/photo-1599490659223-930b447ffad6", packSize: "500g" },
  { name: "Paneer Nuggets", price: 180, mrp: 210, categoryName: "Frozen Food", image: "https://images.unsplash.com/photo-1599490659223-930b447ffad6", packSize: "400g" },
  { name: "Chicken Seekh", price: 250, mrp: 300, categoryName: "Frozen Food", image: "https://images.unsplash.com/photo-1599490659223-930b447ffad6", packSize: "500g" },
  { name: "Frozen Momos", price: 160, mrp: 190, categoryName: "Frozen Food", image: "https://images.unsplash.com/photo-1496116218417-1a781b1c416c", packSize: "10 pcs" },
  { name: "Aloo Tikki", price: 120, mrp: 150, categoryName: "Frozen Food", image: "https://images.unsplash.com/photo-1599490659223-930b447ffad6", packSize: "400g" },
  { name: "French Fries", price: 135, mrp: 160, categoryName: "Frozen Food", image: "https://images.unsplash.com/photo-1599490659223-930b447ffad6", packSize: "400g" },
  { name: "Spring Rolls", price: 190, mrp: 230, categoryName: "Frozen Food", image: "https://images.unsplash.com/photo-1599490659223-930b447ffad6", packSize: "500g" }
];

async function seedDB() {
  try {
    await mongoose.connect(DB_URL);
    console.log("Connected to DB for seeding...");

    await Category.deleteMany({});
    await Product.deleteMany({});
    await User.deleteMany({});
    console.log("Cleared existing data.");

    const createdCategories = await Category.insertMany(categoriesData);
    console.log(`Inserted ${createdCategories.length} categories.`);

    const productsToInsert = rawProducts.map(p => {
      const cat = createdCategories.find(c => c.name === p.categoryName);
      return { 
        ...p, 
        category: cat ? cat._id : null,
        stock: Math.floor(Math.random() * 100) + 20,
        rating: (4 + Math.random()).toFixed(1),
        reviews: (Math.floor(Math.random() * 20) + 1) + "k",
        image: `${p.image}?auto=format&fit=crop&q=80&w=800`
      };
    }).filter(p => p.category !== null);

    await Product.insertMany(productsToInsert);
    console.log(`Inserted ${productsToInsert.length} realistic products.`);

    const finalUsers = await usersData();
    await User.insertMany(finalUsers);
    console.log(`Inserted ${finalUsers.length} role-based users.`);

    console.log("Database Fully Re-Seeded with 110+ products! 🚀");
    process.exit();
  } catch (err) {
    console.error("Seeding Error:", err);
    process.exit(1);
  }
}

seedDB();
