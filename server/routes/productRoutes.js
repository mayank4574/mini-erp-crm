const express = require('express');
const router = express.Router();
const { 
  getProducts, 
  getProduct, 
  createProduct, 
  updateProduct, 
  deleteProduct 
} = require('../controllers/productController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

router.route('/')
  .get(getProducts) // Accessible by all roles
  .post(authorize('ADMIN', 'WAREHOUSE'), createProduct);

router.route('/:id')
  .get(getProduct) // Accessible by all roles
  .put(authorize('ADMIN', 'WAREHOUSE'), updateProduct)
  .delete(authorize('ADMIN'), deleteProduct);

module.exports = router;
