const express = require('express');
const router = express.Router({ mergeParams: true });
const { getFollowUps, addFollowUp } = require('../controllers/followUpController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);
router.use(authorize('ADMIN', 'SALES'));

router.route('/')
  .get(getFollowUps)
  .post(addFollowUp);

module.exports = router;
