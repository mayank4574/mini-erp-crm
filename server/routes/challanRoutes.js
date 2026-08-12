const express = require('express');
const router = express.Router();
const { 
  getChallans, 
  getChallan, 
  createChallan, 
  updateChallan 
} = require('../controllers/challanController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

router.route('/')
  .get(getChallans)
  .post(authorize('ADMIN', 'SALES'), createChallan);

router.route('/:id')
  .get(getChallan)
  .put(authorize('ADMIN', 'SALES'), updateChallan);

module.exports = router;
