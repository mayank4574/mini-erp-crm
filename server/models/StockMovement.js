const mongoose = require('mongoose');

const stockMovementSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  quantityChanged: {
    type: Number,
    required: true,
  },
  movementType: {
    type: String,
    enum: ['IN', 'OUT'],
    required: true,
  },
  reason: {
    type: String,
    required: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  }
}, { timestamps: true });

module.exports = mongoose.model('StockMovement', stockMovementSchema);
