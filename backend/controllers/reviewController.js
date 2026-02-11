const Review = require('../models/Review');

exports.getReviews = async (req, res) => {
  try {
    // Find reviews for a specific book
    const reviews = await Review.find({ book: req.params.bookId }).populate('user', 'username');
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addReview = async (req, res) => {
  try {
    const review = new Review({
      ...req.body,
      book: req.params.bookId,
      user: req.user._id // From JWT
    });
    await review.save();
    res.status(201).json(review);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

