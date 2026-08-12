const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(morgan('dev'));

// Routes
const authRoutes = require('./routes/authRoutes');
const customerRoutes = require('./routes/customerRoutes');
const productRoutes = require('./routes/productRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const challanRoutes = require('./routes/challanRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const aiRoutes = require('./routes/aiRoutes');

// Basic health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Server is running normally' });
});

// One-time seed endpoint (visit in browser to seed database)
app.get('/api/seed-database', async (req, res) => {
  try {
    const bcrypt = require('bcrypt');
    const User = require('./models/User');
    const Customer = require('./models/Customer');
    const Product = require('./models/Product');

    // Check if already seeded
    const existingUsers = await User.countDocuments();
    if (existingUsers > 0) {
      return res.json({ success: true, message: 'Database already seeded', users: existingUsers });
    }

    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash('password123', salt);

    await User.insertMany([
      { name: 'Admin User', email: 'admin@minierp.com', password, role: 'ADMIN' },
      { name: 'Sales User', email: 'sales@minierp.com', password, role: 'SALES' },
      { name: 'Warehouse User', email: 'warehouse@minierp.com', password, role: 'WAREHOUSE' },
      { name: 'Accounts User', email: 'accounts@minierp.com', password, role: 'ACCOUNTS' },
    ]);

    await Customer.insertMany([
      { customerName: 'Acme Corp', mobileNumber: '1234567890', email: 'contact@acme.com', businessName: 'Acme Corporation', customerType: 'WHOLESALE', status: 'ACTIVE' },
      { customerName: 'Global Dist', mobileNumber: '0987654321', email: 'info@globaldist.com', businessName: 'Global Distributors', customerType: 'DISTRIBUTOR', status: 'LEAD' },
    ]);

    await Product.insertMany([
      { productName: 'Laptop Pro 15', sku: 'LPT-PRO-15', category: 'Electronics', unitPrice: 1200, currentStock: 50, minimumStockAlertQuantity: 10, warehouseLocation: 'A1' },
      { productName: 'Wireless Mouse', sku: 'WLM-01', category: 'Electronics', unitPrice: 25, currentStock: 200, minimumStockAlertQuantity: 50, warehouseLocation: 'B2' },
      { productName: 'Mechanical Keyboard', sku: 'MKB-02', category: 'Electronics', unitPrice: 85, currentStock: 15, minimumStockAlertQuantity: 20, warehouseLocation: 'C3' },
    ]);

    res.json({ success: true, message: 'Database seeded successfully! 4 users, 2 customers, 3 products created.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/products', productRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/challans', challanRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/ai', aiRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

module.exports = app;
