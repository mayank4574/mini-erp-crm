require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const Customer = require('../models/Customer');
const Product = require('../models/Product');
const StockMovement = require('../models/StockMovement');
const SalesChallan = require('../models/SalesChallan');

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB Connected for Seeding'))
  .catch(err => console.error(err));

const seedData = async () => {
  try {
    await User.deleteMany();
    await Customer.deleteMany();
    await Product.deleteMany();
    await StockMovement.deleteMany();
    await SalesChallan.deleteMany();

    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash('password123', salt);

    const users = await User.insertMany([
      { name: 'Admin User', email: 'admin@minierp.com', password, role: 'ADMIN' },
      { name: 'Sales User', email: 'sales@minierp.com', password, role: 'SALES' },
      { name: 'Warehouse User', email: 'warehouse@minierp.com', password, role: 'WAREHOUSE' },
      { name: 'Accounts User', email: 'accounts@minierp.com', password, role: 'ACCOUNTS' },
    ]);

    const adminId = users[0]._id;

    const customers = await Customer.insertMany([
      { customerName: 'Acme Corp', mobileNumber: '1234567890', email: 'contact@acme.com', businessName: 'Acme Corporation', customerType: 'WHOLESALE', status: 'ACTIVE' },
      { customerName: 'Global Dist', mobileNumber: '0987654321', email: 'info@globaldist.com', businessName: 'Global Distributors', customerType: 'DISTRIBUTOR', status: 'LEAD' },
    ]);

    const products = await Product.insertMany([
      { productName: 'Laptop Pro 15', sku: 'LPT-PRO-15', category: 'Electronics', unitPrice: 1200, currentStock: 50, minimumStockAlertQuantity: 10, warehouseLocation: 'A1' },
      { productName: 'Wireless Mouse', sku: 'WLM-01', category: 'Electronics', unitPrice: 25, currentStock: 200, minimumStockAlertQuantity: 50, warehouseLocation: 'B2' },
      { productName: 'Mechanical Keyboard', sku: 'MKB-02', category: 'Electronics', unitPrice: 85, currentStock: 15, minimumStockAlertQuantity: 20, warehouseLocation: 'C3' },
    ]);

    console.log('Data Seeded Successfully');
    process.exit();
  } catch (error) {
    console.error('Error with data import', error);
    process.exit(1);
  }
};

seedData();
