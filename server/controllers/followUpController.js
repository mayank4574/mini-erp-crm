const FollowUp = require('../models/FollowUp');
const Customer = require('../models/Customer');

// @desc    Get follow-ups for a customer
// @route   GET /api/customers/:customerId/follow-ups
// @access  Private (Admin, Sales)
exports.getFollowUps = async (req, res, next) => {
  try {
    const followUps = await FollowUp.find({ customer: req.params.customerId })
      .populate('createdBy', 'name')
      .sort('-createdAt');

    res.status(200).json({ success: true, count: followUps.length, data: followUps });
  } catch (error) {
    next(error);
  }
};

// @desc    Add follow-up to a customer
// @route   POST /api/customers/:customerId/follow-ups
// @access  Private (Admin, Sales)
exports.addFollowUp = async (req, res, next) => {
  try {
    req.body.customer = req.params.customerId;
    req.body.createdBy = req.user.id;

    const customer = await Customer.findById(req.params.customerId);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    const followUp = await FollowUp.create(req.body);

    // Update customer's next follow up date if provided
    if (req.body.followUpDate) {
      customer.followUpDate = req.body.followUpDate;
      await customer.save();
    }

    res.status(201).json({ success: true, data: followUp });
  } catch (error) {
    next(error);
  }
};
