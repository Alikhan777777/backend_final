const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true }, // Relation
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } // Who wrote it
  },
  { timestamps: true }
);

module.exports = mongoose.model('Review', ReviewSchema);

