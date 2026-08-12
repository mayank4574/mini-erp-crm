const mongoose = require('mongoose');

const challanItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  productNameSnapshot: {
    type: String,
    required: true,
  },
  skuSnapshot: {
    type: String,
    required: true,
  },
  unitPriceSnapshot: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  subtotal: {
    type: Number,
    required: true,
  }
});

const salesChallanSchema = new mongoose.Schema({
  challanNumber: {
    type: String,
    required: true,
    unique: true,
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
  },
  items: [challanItemSchema],
  totalQuantity: {
    type: Number,
    required: true,
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['DRAFT', 'CONFIRMED', 'CANCELLED'],
    default: 'DRAFT',
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  }
}, { timestamps: true });

module.exports = mongoose.model('SalesChallan', salesChallanSchema);
