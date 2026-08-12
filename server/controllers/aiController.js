const aiService = require('../services/aiService');
const Customer = require('../models/Customer');
const Product = require('../models/Product');
const SalesChallan = require('../models/SalesChallan');

// @desc    Chat with AI Assistant
// @route   POST /api/ai/chat
// @access  Private
exports.chatWithAI = async (req, res, next) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    // Determine what context to fetch based on simple keywords (basic RAG approach)
    let contextData = {};
    const lowerMessage = message.toLowerCase();

    // Fetch products if asked about stock, products, inventory
    if (lowerMessage.includes('stock') || lowerMessage.includes('product') || lowerMessage.includes('inventory')) {
      const products = await Product.find().select('productName sku currentStock minimumStockAlertQuantity unitPrice');
      contextData.products = products;
    }

    // Fetch customers if asked about customer, follow-up, crm
    if (lowerMessage.includes('customer') || lowerMessage.includes('follow') || lowerMessage.includes('lead')) {
      const customers = await Customer.find().select('customerName businessName status customerType followUpDate notes');
      contextData.customers = customers;
    }

    // Fetch challans if asked about challan, sale, order
    if (lowerMessage.includes('challan') || lowerMessage.includes('sale') || lowerMessage.includes('order')) {
      const challans = await SalesChallan.find()
        .populate('customer', 'customerName')
        .select('challanNumber totalAmount status createdAt')
        .sort('-createdAt')
        .limit(10); // Limit to recent 10 to avoid huge payload
      contextData.recentChallans = challans;
    }

    // If no specific keyword matched, fetch a basic summary
    if (Object.keys(contextData).length === 0) {
      contextData.summary = {
        totalCustomers: await Customer.countDocuments(),
        totalProducts: await Product.countDocuments(),
        recentChallansCount: await SalesChallan.countDocuments()
      };
    }

    // Call AI Service
    const aiResponse = await aiService.generateBusinessInsight(message, contextData);

    res.status(200).json({
      success: true,
      data: {
        reply: aiResponse
      }
    });

  } catch (error) {
    console.error('AI Controller Error:', error.message);
    
    let statusCode = 500;
    let message = 'AI service is temporarily unavailable.';

    if (error.message.includes('not configured')) {
      statusCode = 500;
      message = 'AI service is not configured.';
    }

    res.status(statusCode).json({
      success: false,
      message: message
    });
  }
};
