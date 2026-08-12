const SalesChallan = require('../models/SalesChallan');
const Product = require('../models/Product');
const StockMovement = require('../models/StockMovement');
const mongoose = require('mongoose');

// Generate Challan Number
const generateChallanNumber = async () => {
  const date = new Date();
  const year = date.getFullYear();
  
  const lastChallan = await SalesChallan.findOne({
    challanNumber: new RegExp(`^SC-${year}-`)
  }).sort({ createdAt: -1 });

  let sequence = 1;
  if (lastChallan) {
    const lastSequence = parseInt(lastChallan.challanNumber.split('-')[2], 10);
    sequence = lastSequence + 1;
  }

  return `SC-${year}-${sequence.toString().padStart(6, '0')}`;
};

// @desc    Get all challans
// @route   GET /api/challans
// @access  Private
exports.getChallans = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;

    const query = {};

    if (req.query.search) {
      query.challanNumber = { $regex: req.query.search, $options: 'i' };
    }
    if (req.query.status) {
      query.status = req.query.status;
    }
    if (req.query.customer) {
      query.customer = req.query.customer;
    }
    
    // For Sales role, maybe restrict to their own created challans or allow all?
    // User requested: "SALES: View own/relevant challans". We'll allow all for now for simplicity, or filter by createdBy if role is SALES.
    if (req.user.role === 'SALES' && !req.query.all) {
      // Assuming business logic allows sales to see all challans they created
      query.createdBy = req.user.id;
    }

    const total = await SalesChallan.countDocuments(query);
    const challans = await SalesChallan.find(query)
      .populate('customer', 'customerName businessName')
      .populate('createdBy', 'name')
      .sort('-createdAt')
      .skip(startIndex)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: challans.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: challans
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single challan
// @route   GET /api/challans/:id
// @access  Private
exports.getChallan = async (req, res, next) => {
  try {
    const challan = await SalesChallan.findById(req.params.id)
      .populate('customer')
      .populate('createdBy', 'name')
      .populate('items.product', 'image warehouseLocation currentStock');

    if (!challan) {
      return res.status(404).json({ success: false, message: 'Challan not found' });
    }

    res.status(200).json({ success: true, data: challan });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new challan
// @route   POST /api/challans
// @access  Private (Admin, Sales)
exports.createChallan = async (req, res, next) => {
  try {
    const { customer, items, status } = req.body;
    
    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'At least one item is required' });
    }

    // Prepare items with snapshot
    let totalQuantity = 0;
    let totalAmount = 0;
    const challanItems = [];

    for (let item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ success: false, message: `Product ${item.product} not found` });
      }

      if (item.quantity <= 0) {
        return res.status(400).json({ success: false, message: 'Quantity must be > 0' });
      }

      const subtotal = product.unitPrice * item.quantity;
      
      challanItems.push({
        product: product._id,
        productNameSnapshot: product.productName,
        skuSnapshot: product.sku,
        unitPriceSnapshot: product.unitPrice,
        quantity: item.quantity,
        subtotal
      });

      totalQuantity += item.quantity;
      totalAmount += subtotal;
    }

    const challanNumber = await generateChallanNumber();

    const challanData = {
      challanNumber,
      customer,
      items: challanItems,
      totalQuantity,
      totalAmount,
      status: status === 'CONFIRMED' ? 'DRAFT' : 'DRAFT', // Always create as draft first if via POST
      createdBy: req.user.id
    };

    const challan = await SalesChallan.create(challanData);

    res.status(201).json({ success: true, data: challan });
  } catch (error) {
    next(error);
  }
};

// @desc    Update challan (Confirm/Cancel)
// @route   PUT /api/challans/:id
// @access  Private (Admin, Sales)
exports.updateChallan = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const challan = await SalesChallan.findById(req.params.id).session(session);

    if (!challan) {
      return res.status(404).json({ success: false, message: 'Challan not found' });
    }

    if (challan.status !== 'DRAFT') {
      return res.status(400).json({ success: false, message: `Cannot modify a ${challan.status} challan` });
    }

    const newStatus = req.body.status;

    if (newStatus === 'CONFIRMED') {
      // Check stock and deduct
      const stockMovements = [];
      const updatedProducts = [];

      for (let item of challan.items) {
        const product = await Product.findById(item.product).session(session);
        if (!product) {
          throw new Error(`Product ${item.productNameSnapshot} no longer exists`);
        }

        if (product.currentStock < item.quantity) {
          // IMPORTANT BUSINESS RULE: Reject entire operation if any product has insufficient stock
          const error = new Error(`Insufficient stock for ${product.productName}. Required: ${item.quantity}, Available: ${product.currentStock}`);
          error.status = 400;
          throw error;
        }

        product.currentStock -= item.quantity;
        updatedProducts.push(product);

        stockMovements.push({
          product: product._id,
          quantityChanged: item.quantity,
          movementType: 'OUT',
          reason: `Sales Challan ${challan.challanNumber}`,
          createdBy: req.user.id
        });
      }

      // Save all updated products
      for (let prod of updatedProducts) {
        await prod.save({ session });
      }

      // Create stock movements
      if (stockMovements.length > 0) {
        await StockMovement.insertMany(stockMovements, { session });
      }
    }

    challan.status = newStatus;
    await challan.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({ success: true, data: challan });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    
    // Pass specific error to middleware
    if (error.status === 400) {
      return res.status(400).json({ success: false, message: error.message });
    }
    
    next(error);
  }
};
