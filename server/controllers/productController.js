const Product = require('../models/Product');

// @desc    Get all products
// @route   GET /api/products
// @access  Private
exports.getProducts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;

    const query = {};

    // Search
    if (req.query.search) {
      query.$or = [
        { productName: { $regex: req.query.search, $options: 'i' } },
        { sku: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    // Filter by category
    if (req.query.category) {
      query.category = req.query.category;
    }

    // Low stock filter
    if (req.query.lowStock === 'true') {
      query.$expr = { $lte: ['$currentStock', '$minimumStockAlertQuantity'] };
    }

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort('-createdAt')
      .skip(startIndex)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: products.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: products
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Private
exports.getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.status(200).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new product
// @route   POST /api/products
// @access  Private (Admin, Warehouse)
exports.createProduct = async (req, res, next) => {
  try {
    // Check if SKU exists
    const skuExists = await Product.findOne({ sku: req.body.sku });
    if (skuExists) {
      return res.status(400).json({ success: false, message: 'SKU already exists' });
    }

    const product = await Product.create(req.body);
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private (Admin, Warehouse)
exports.updateProduct = async (req, res, next) => {
  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Check SKU conflict
    if (req.body.sku && req.body.sku !== product.sku) {
      const skuExists = await Product.findOne({ sku: req.body.sku });
      if (skuExists) {
        return res.status(400).json({ success: false, message: 'SKU already exists' });
      }
    }

    // Do not allow updating currentStock through this route directly
    delete req.body.currentStock;

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private (Admin)
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    await product.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};
