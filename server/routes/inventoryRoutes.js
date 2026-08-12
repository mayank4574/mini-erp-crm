const express = require('express');
const router = express.Router();
const { getMovements, stockIn, stockOut } = require('../controllers/inventoryController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

router.get('/movements', authorize('ADMIN', 'WAREHOUSE', 'SALES'), getMovements);
router.post('/stock-in', authorize('ADMIN', 'WAREHOUSE'), stockIn);
router.post('/stock-out', authorize('ADMIN', 'WAREHOUSE'), stockOut);

module.exports = router;
