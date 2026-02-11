const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const { authenticate, authorizeAdmin } = require('../middleware/authMiddleware');

// Public Routes
router.get('/', bookController.getAllBooks);
router.get('/:id', bookController.getBookById);

// Protected Admin Routes
router.post('/', authenticate, authorizeAdmin, bookController.createBook);
router.put('/:id', authenticate, authorizeAdmin, bookController.updateBook);
router.delete('/:id', authenticate, authorizeAdmin, bookController.deleteBook);

module.exports = router;

