const Book = require('../models/Book');

// Public: Get All
exports.getAllBooks = async (req, res) => {
  try {
    // Backward-compatible behavior:
    // - If no query params are used, return raw array (old behavior)
    // - If query params are used, return { items, pagination }
    const { search, sort, page, limit } = req.query;

    const hasQuery =
      typeof search !== 'undefined' ||
      typeof sort !== 'undefined' ||
      typeof page !== 'undefined' ||
      typeof limit !== 'undefined';

    const filter = {};
    if (search && String(search).trim()) {
      filter.name = { $regex: String(search).trim(), $options: 'i' };
    }

    // Sorting
    const sortMap = {
      newest: { createdAt: -1 },
      name_asc: { name: 1 },
      name_desc: { name: -1 },
      author_asc: { author: 1 },
      author_desc: { author: -1 },
      price_asc: { cost: 1 },
      price_desc: { cost: -1 }
    };
    const sortSpec = sortMap[sort] || { createdAt: -1 };

    if (!hasQuery) {
      const books = await Book.find().sort({ createdAt: -1 });
      return res.json(books);
    }

    const safeLimit = Math.min(Math.max(parseInt(limit, 10) || 9, 1), 48);
    const safePage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (safePage - 1) * safeLimit;

    const [items, total] = await Promise.all([
      Book.find(filter).sort(sortSpec).skip(skip).limit(safeLimit),
      Book.countDocuments(filter)
    ]);

    res.json({
      items,
      pagination: {
        total,
        page: safePage,
        limit: safeLimit,
        totalPages: Math.max(1, Math.ceil(total / safeLimit))
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Public: Get One
exports.getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: 'Book not found' });
    res.json(book);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Admin Only: Create
exports.createBook = async (req, res) => {
  try {
    const book = new Book(req.body);
    await book.save();
    res.status(201).json(book);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Admin Only: Update
exports.updateBook = async (req, res) => {
  try {
    const book = await Book.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    res.json(book);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Admin Only: Delete
exports.deleteBook = async (req, res) => {
  try {
    await Book.findByIdAndDelete(req.params.id);
    res.json({ message: 'Book deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

