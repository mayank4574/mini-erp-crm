const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  productName: {
    type: String,
    required: true,
  },
  sku: {
    type: String,
    required: true,
    unique: true,
  },
  category: {
    type: String,
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  currentStock: {
    type: Number,
    default: 0,
    min: 0,
  },
  minimumStockAlertQuantity: {
    type: Number,
    default: 0,
    min: 0,
  },
  warehouseLocation: {
    type: String,
  },
  image: {
    type: String,
  }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
