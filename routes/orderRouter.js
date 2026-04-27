const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

// All order routes require authentication
router.use(protect);

// --- Customer Routes ---
router.post('/create', orderController.createOrder);
router.get('/my-orders', orderController.getMyOrders);

// --- Admin Routes ---
router.get('/all', restrictTo('admin'), orderController.getAllOrders);
router.get('/stats', restrictTo('admin'), orderController.getAdminStats);

// --- Manager Routes ---
router.put('/assign', restrictTo('manager', 'admin'), orderController.assignOrder);

// --- Delivery Routes ---
router.get('/tasks', restrictTo('delivery'), orderController.getDeliveryTasks);

// --- General Status Update ---
router.put('/:id/status', restrictTo('manager', 'delivery', 'admin'), orderController.updateOrderStatus);

module.exports = router;
