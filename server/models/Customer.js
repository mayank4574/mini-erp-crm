const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  customerName: {
    type: String,
    required: true,
  },
  mobileNumber: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    match: [/.+\@.+\..+/, 'Please fill a valid email address']
  },
  businessName: {
    type: String,
  },
  gstNumber: {
    type: String,
  },
  customerType: {
    type: String,
    enum: ['RETAIL', 'WHOLESALE', 'DISTRIBUTOR'],
    required: true,
  },
  address: {
    type: String,
  },
  status: {
    type: String,
    enum: ['LEAD', 'ACTIVE', 'INACTIVE'],
    default: 'LEAD',
  },
  followUpDate: {
    type: Date,
  },
  notes: {
    type: String,
  }
}, { timestamps: true });

module.exports = mongoose.model('Customer', customerSchema);
