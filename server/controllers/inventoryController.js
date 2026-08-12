const Product = require('../models/Product');
const StockMovement = require('../models/StockMovement');
const mongoose = require('mongoose');

// @desc    Get stock movements
// @route   GET /api/inventory/movements
// @access  Private (Admin, Warehouse)
exports.getMovements = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;

    const query = {};
    if (req.query.product) {
      query.product = req.query.product;
    }
    if (req.query.movementType) {
      query.movementType = req.query.movementType;
    }

    const total = await StockMovement.countDocuments(query);
    const movements = await StockMovement.find(query)
      .populate('product', 'productName sku')
      .populate('createdBy', 'name')
      .sort('-createdAt')
      .skip(startIndex)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: movements.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: movements
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Stock IN
// @route   POST /api/inventory/stock-in
// @access  Private (Admin, Warehouse)
exports.stockIn = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { product, quantity, reason } = req.body;

    if (!product || !quantity || quantity <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid product or quantity' });
    }

    const prod = await Product.findById(product).session(session);
    if (!prod) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Update stock
    prod.currentStock += quantity;
    await prod.save({ session });

    // Create movement
    const movement = await StockMovement.create([{
      product,
      quantityChanged: quantity,
      movementType: 'IN',
      reason: reason || 'Stock In',
      createdBy: req.user.id
    }], { session });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({ success: true, data: movement[0] });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
};

// @desc    Stock OUT
// @route   POST /api/inventory/stock-out
// @access  Private (Admin, Warehouse)
exports.stockOut = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { product, quantity, reason } = req.body;

    if (!product || !quantity || quantity <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid product or quantity' });
    }

    const prod = await Product.findById(product).session(session);
    if (!prod) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (prod.currentStock < quantity) {
      return res.status(400).json({ success: false, message: 'Insufficient stock' });
    }

    // Update stock
    prod.currentStock -= quantity;
    await prod.save({ session });

    // Create movement
    const movement = await StockMovement.create([{
      product,
      quantityChanged: quantity,
      movementType: 'OUT',
      reason: reason || 'Stock Out',
      createdBy: req.user.id
    }], { session });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({ success: true, data: movement[0] });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
};
