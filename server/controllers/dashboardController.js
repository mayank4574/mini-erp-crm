const Customer = require('../models/Customer');
const Product = require('../models/Product');
const SalesChallan = require('../models/SalesChallan');
const StockMovement = require('../models/StockMovement');

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private
exports.getDashboardStats = async (req, res, next) => {
  try {
    // Basic stats
    const totalCustomers = await Customer.countDocuments();
    const activeCustomers = await Customer.countDocuments({ status: 'ACTIVE' });
    
    const totalProducts = await Product.countDocuments();
    
    // Aggregate for total stock and low stock
    const products = await Product.find({}, 'currentStock minimumStockAlertQuantity');
    let totalStock = 0;
    let lowStockProducts = 0;
    
    products.forEach(p => {
      totalStock += p.currentStock;
      if (p.currentStock <= p.minimumStockAlertQuantity) {
        lowStockProducts++;
      }
    });

    const draftChallans = await SalesChallan.countDocuments({ status: 'DRAFT' });
    const confirmedChallans = await SalesChallan.countDocuments({ status: 'CONFIRMED' });

    // Recent Activity
    const recentCustomers = await Customer.find()
      .sort('-createdAt')
      .limit(5)
      .select('customerName customerType status createdAt');
      
    const recentChallans = await SalesChallan.find()
      .populate('customer', 'customerName')
      .sort('-createdAt')
      .limit(5)
      .select('challanNumber totalAmount status createdAt');

    const recentStockMovements = await StockMovement.find()
      .populate('product', 'productName')
      .sort('-createdAt')
      .limit(5);

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalCustomers,
          activeCustomers,
          totalProducts,
          lowStockProducts,
          totalStock,
          draftChallans,
          confirmedChallans
        },
        recent: {
          customers: recentCustomers,
          challans: recentChallans,
          stockMovements: recentStockMovements
        }
      }
    });
  } catch (error) {
    next(error);
  }
};
