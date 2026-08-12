const express = require('express');
const router = express.Router();
const { 
  getCustomers, 
  getCustomer, 
  createCustomer, 
  updateCustomer, 
  deleteCustomer 
} = require('../controllers/customerController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const followUpRoutes = require('./followUpRoutes');

// Re-route into other resource routers
router.use('/:customerId/follow-ups', followUpRoutes);

router.use(protect);

router.route('/')
  .get(authorize('ADMIN', 'SALES', 'ACCOUNTS'), getCustomers)
  .post(authorize('ADMIN', 'SALES'), createCustomer);

router.route('/:id')
  .get(authorize('ADMIN', 'SALES', 'ACCOUNTS'), getCustomer)
  .put(authorize('ADMIN', 'SALES'), updateCustomer)
  .delete(authorize('ADMIN'), deleteCustomer);

module.exports = router;
