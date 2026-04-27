const Order = require('../models/orderModel');
const Cart = require('../models/cartModel');
const Product = require('../models/productModel');

// Create a new order from the current cart
exports.createOrder = async (req, res) => {
  try {
    const userId = req.user._id;

    // 1. Get the current cart
    const cart = await Cart.findOne({ userId }).populate('items.productId');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // 2. Prepare order items and calculate totals
    let itemTotal = 0;
    const orderItems = cart.items.map(item => {
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
    for (const item of cart.items) {
      const product = await Product.findById(item.productId._id);
      if (product.stock < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
      }
      product.stock -= item.quantity;
      await product.save();
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
      }
    });

    await newOrder.save();

    // 5. Clear the Cart
    cart.items = [];
    await cart.save();

    res.status(201).json({ 
      message: "Order placed successfully", 
      orderId: newOrder._id,
      order: newOrder
    });

  } catch (err) {
    console.error("Order creation error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get all orders for the logged-in user
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Error fetching orders" });
  }
};

// 🔥 [ADMIN] Get all orders across platform
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

// 🔥 [MANAGER] Assign order to delivery partner
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

// 🔥 [GENERAL] Update status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    res.json({ message: `Status updated to ${status}`, order });
  } catch (err) {
    res.status(500).json({ message: "Status update failed" });
  }
};

// 🔥 [DELIVERY] Get my tasks
exports.getDeliveryTasks = async (req, res) => {
  try {
    const orders = await Order.find({ 
      assignedTo: req.user._id,
      status: { $in: ['confirmed', 'packing', 'ready', 'out-for-delivery'] }
    }).populate('userId', 'name phone address');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Error fetching tasks" });
  }
};

// 🔥 [ADMIN] Get global stats
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
