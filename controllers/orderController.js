const Order = require('../models/orderModel');
const Cart = require('../models/cartModel');
const Product = require('../models/productModel');
const User = require('../models/authModel'); // Added for auto-assignment

// Create a new order from the current cart
exports.createOrder = async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Get the current cart
    const cart = await Cart.findOne({ userId }).populate('items.productId');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // 2. Prepare order items (filtering out any orphaned items)
    const validItems = cart.items.filter(item => item.productId);
    
    let itemTotal = 0;
    const orderItems = validItems.map(item => {
      const p = item.productId;
      const subtotal = p.price * item.quantity;
      itemTotal += subtotal;

      return {
        productId: p._id,
        name: p.name,
        price: p.price,
        quantity: item.quantity,
        image: p.image
      };
    });

    const deliveryFee = itemTotal > 299 ? 0 : 40;
    const handlingFee = 5;
    const totalPayable = itemTotal + deliveryFee + handlingFee;

    // 3. Check and Update Stock
    for (const item of validItems) {
      const product = await Product.findById(item.productId._id);
      if (product.stock < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
      }
      product.stock -= item.quantity;
      await product.save();
    }

    // --- OPEN POOL LOGIC (No Auto-Assignment) ---
    // Orders start as 'pending' and unassigned so they appear in the "Available Feed"
    let assignedTo = null;
    let status = 'pending';

    // --- PAYMENT HANDLING ---
    const { paymentMethod = 'COD' } = req.body;
    let paymentStatus = 'pending';

    if (paymentMethod === 'wallet') {
      const user = await User.findById(userId);
      if (user.walletBalance < totalPayable) {
        return res.status(400).json({ message: "Insufficient wallet balance" });
      }
      user.walletBalance -= totalPayable;
      user.transactionHistory.push({
        amount: totalPayable,
        type: 'debit',
        description: `Paid for Order #${Date.now().toString().slice(-6)}`
      });
      await user.save();
      paymentStatus = 'paid';
    } else if (paymentMethod === 'online') {
      paymentStatus = 'paid'; // Simulated success
    }

    // 4. Create the Order
    const newOrder = new Order({
      userId,
      items: orderItems,
      billDetails: {
        itemTotal,
        deliveryFee,
        handlingFee,
        totalPayable
      },
      status,
      assignedTo,
      paymentMethod,
      paymentStatus
    });

    await newOrder.save();

    // 5. Clear the Cart
    cart.items = [];
    await cart.save();

    res.status(201).json({ 
      message: paymentMethod === 'wallet' ? "Order placed using Wallet!" : "Order placed successfully", 
      orderId: newOrder._id,
      order: newOrder
    });

  } catch (err) {
    console.error("Order creation error:", err);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: Object.values(err.errors)[0].message });
    }
    res.status(500).json({ message: err.message || "Internal server error" });
  }
};

// Get all orders for the logged-in user
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Error fetching orders" });
  }
};

// Admin: Get all orders across platform
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('userId', 'name email phone')
      .populate('assignedTo', 'name phone')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Error fetching all orders" });
  }
};

// Manager: Assign order to delivery partner
exports.assignOrder = async (req, res) => {
  try {
    const { orderId, partnerId } = req.body;
    const order = await Order.findByIdAndUpdate(
      orderId,
      { assignedTo: partnerId, status: 'confirmed' },
      { new: true }
    );
    res.json({ message: "Order assigned successfully", order });
  } catch (err) {
    res.status(500).json({ message: "Assignment failed" });
  }
};

// Update status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const updateData = { status };
    
    if (status === 'delivered') {
      updateData.deliveredAt = new Date();
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    res.json({ message: `Status updated to ${status}`, order });
  } catch (err) {
    res.status(500).json({ message: "Status update failed" });
  }
};

// Delivery: Get my tasks
exports.getDeliveryTasks = async (req, res) => {
  try {
    const orders = await Order.find({ 
      assignedTo: req.user.id,
      status: { $in: ['confirmed', 'packing', 'ready', 'out-for-delivery'] }
    }).populate('userId', 'name phone address');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Error fetching tasks" });
  }
};

// Delivery: Get all unassigned pending orders (Open Pool)
exports.getUnassignedOrders = async (req, res) => {
  try {
    const orders = await Order.find({ 
      status: 'pending',
      assignedTo: null 
    }).populate('userId', 'name phone address');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Error fetching unassigned orders" });
  }
};

// Delivery: Claim an unassigned order
exports.claimOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const partnerId = req.user.id;

    // Check if order is still unassigned
    const order = await Order.findById(orderId);
    if (!order || order.assignedTo) {
      return res.status(400).json({ message: "Order already claimed or not found" });
    }

    order.assignedTo = partnerId;
    order.status = 'confirmed';
    await order.save();

    res.json({ message: "Order claimed successfully", order });
  } catch (err) {
    res.status(500).json({ message: "Failed to claim order" });
  }
};

// Admin: Get global stats
exports.getAdminStats = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const totalRevenue = await Order.aggregate([
      { $match: { status: 'delivered' } },
      { $group: { _id: null, total: { $sum: "$billDetails.totalPayable" } } }
    ]);

    const activeDeliveries = await Order.countDocuments({ 
      status: { $in: ['confirmed', 'packing', 'ready', 'out-for-delivery'] } 
    });

    res.json({
      totalOrders,
      revenue: totalRevenue[0]?.total || 0,
      activeDeliveries
    });
  } catch (err) {
    res.status(500).json({ message: "Error fetching stats" });
  }
};

// Admin: Get advanced BI stats
exports.getAdvancedStats = async (req, res) => {
  try {
    // 1. Revenue Growth (Last 30 days)
    const revenueGrowth = await Order.aggregate([
      { $match: { status: 'delivered' } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          revenue: { $sum: "$billDetails.totalPayable" }
        }
      },
      { $sort: { "_id": 1 } },
      { $limit: 30 }
    ]);

    // 2. Category Performance
    const categoryStats = await Order.aggregate([
      { $unwind: "$items" },
      {
        $lookup: {
          from: "products",
          localField: "items.productId",
          foreignField: "_id",
          as: "productInfo"
        }
      },
      { $unwind: "$productInfo" },
      {
        $lookup: {
          from: "categories",
          localField: "productInfo.category",
          foreignField: "_id",
          as: "categoryInfo"
        }
      },
      { $unwind: "$categoryInfo" },
      {
        $group: {
          _id: "$categoryInfo.name",
          value: { $sum: "$items.quantity" }
        }
      },
      { $sort: { value: -1 } },
      { $limit: 5 }
    ]);

    // 3. Delivery Performance (Average time in minutes)
    const deliveryPerformance = await Order.aggregate([
      { $match: { status: 'delivered', deliveredAt: { $ne: null } } },
      {
        $project: {
          day: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          timeTaken: {
            $divide: [
              { $subtract: ["$deliveredAt", "$createdAt"] },
              60000 // Convert ms to minutes
            ]
          }
        }
      },
      {
        $group: {
          _id: "$day",
          avgTime: { $avg: "$timeTaken" }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    res.json({
      revenueGrowth,
      categoryStats,
      deliveryPerformance
    });

  } catch (err) {
    console.error("BI Stats Error:", err);
    res.status(500).json({ message: "Error fetching BI stats" });
  }
};
