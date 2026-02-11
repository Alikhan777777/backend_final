const express = require('express');
const router = express.Router({ mergeParams: true }); // Allows access to :bookId
const reviewController = require('../controllers/reviewController');
const { authenticate } = require('../middleware/authMiddleware');

router.get('/', reviewController.getReviews);
router.post('/', authenticate, reviewController.addReview); // Any logged in user can review

module.exports = router;

