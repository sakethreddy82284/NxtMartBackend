const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
      },
      name: String,
      price: Number,
      quantity: {
        type: Number,
        required: true
      },
      image: String
    }
  ],
  billDetails: {
    itemTotal: Number,
    deliveryFee: Number,
    handlingFee: Number,
    totalPayable: Number
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'packing', 'ready', 'out-for-delivery', 'delivered', 'cancelled'],
    default: 'pending'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  address: {
    type: String,
    default: "Home" // We can expand this later
  },
  paymentMethod: {
    type: String,
    default: "COD"
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Order', orderSchema);
