 const express = require('express');
const cors = require('cors');

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

// 🧑‍💼 Admin credentials (simple demo)
const admin = {
  username: 'admin',
  password: 'admin123',
};

// 📚 Book list with categories
let books = [
  {
    id: 1,
    title: 'The Automobile Handbook 2024',
    author: 'Jack Gillis',
    category: 'Automobile',
    issued: false,
    cover: 'https://placehold.co/300x200?text=Automobile+Handbook',
    reviews: [],
  },
  {
    id: 2,
    title: 'Understanding Automobiles',
    author: 'Tom Newton',
    category: 'Automobile',
    issued: false,
    cover: 'https://placehold.co/300x200?text=Understanding+Automobiles',
    reviews: [],
  },
  {
    id: 3,
    title: 'The Complete Train Manual',
    author: 'Rail Works',
    category: 'Train',
    issued: false,
    cover: 'https://placehold.co/300x200?text=Train+Manual',
    reviews: [],
  },
  {
    id: 4,
    title: 'Flight Engineering Basics',
    author: 'Aero Tech',
    category: 'Flight',
    issued: false,
    cover: 'https://placehold.co/300x200?text=Flight+Engineering',
    reviews: [],
  },
  {
    id: 5,
    title: 'Classic Automobiles: A Century of Innovation',
    author: 'Giles Chapman',
    category: 'Automobile',
    issued: false,
    cover: 'https://placehold.co/300x200?text=Classic+Automobiles',
    reviews: [],
  },
  {
    id: 6,
    title: 'Electric Vehicles Explained',
    author: 'John Doe',
    category: 'Automobile',
    issued: false,
    cover: 'https://placehold.co/300x200?text=Electric+Vehicles',
    reviews: [],
  },
  {
    id: 7,
    title: 'Train Safety Systems',
    author: 'Safe Rails',
    category: 'Train',
    issued: false,
    cover: 'https://placehold.co/300x200?text=Train+Safety',
    reviews: [],
  },
  {
    id: 8,
    title: 'Flight Navigation Guide',
    author: 'Sky Maps',
    category: 'Flight',
    issued: false,
    cover: 'https://placehold.co/300x200?text=Flight+Navigation',
    reviews: [],
  },
  {
    id: 9,
    title: 'Automobile Design Trends',
    author: 'Lisa Sketch',
    category: 'Automobile',
    issued: false,
    cover: 'https://placehold.co/300x200?text=Design+Trends',
    reviews: [],
  },
  {
    id: 10,
    title: 'Hybrid Vehicles Guide',
    author: 'Eco Drive',
    category: 'Automobile',
    issued: false,
    cover: 'https://placehold.co/300x200?text=Hybrid+Vehicles',
    reviews: [],
  },
  {
    id: 11,
    title: 'Flight Mechanics Explained',
    author: 'Jet Logic',
    category: 'Flight',
    issued: false,
    cover: 'https://placehold.co/300x200?text=Flight+Mechanics',
    reviews: [],
  },
];

// 🔍 GET books with optional search and category filter
app.get('/books', (req, res) => {
  const { title, author, category } = req.query;
  let filteredBooks = books;

  if (title) {
    filteredBooks = filteredBooks.filter(book =>
      book.title.toLowerCase().includes(title.toLowerCase())
    );
  }

  if (author) {
    filteredBooks = filteredBooks.filter(book =>
      book.author.toLowerCase().includes(author.toLowerCase())
    );
  }

  if (category) {
    filteredBooks = filteredBooks.filter(book =>
      book.category.toLowerCase() === category.toLowerCase()
    );
  }

  res.json(filteredBooks.slice(0, 10));
});

// 📚 GET books grouped by category
app.get('/books/grouped', (req, res) => {
  const grouped = {};

  books.forEach((book) => {
    const category = book.category || 'Uncategorized';
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push(book);
  });

  res.json(grouped);
});

// ➕ POST a new book
app.post('/books', (req, res) => {
  const { title, author, category, cover } = req.body;

  if (!title || !author || !category || !cover) {
    return res.status(400).json({ message: 'Missing book fields' });
  }

  const newBook = {
    id: books.length + 1,
    title,
    author,
    category,
    cover,
    issued: false,
    reviews: [],
  };

  books.push(newBook);
  res.status(201).json({ message: 'Book added', book: newBook });
});

// 📦 Issue a book
app.put('/books/:id/issue', (req, res) => {
  const book = books.find((b) => b.id === parseInt(req.params.id));

  if (book && !book.issued) {
    book.issued = true;
    res.json({ message: 'Book issued', book });
  } else {
    res.status(400).json({ message: 'Book not available' });
  }
});

// 📦 Return a book
app.put('/books/:id/return', (req, res) => {
  const book = books.find((b) => b.id === parseInt(req.params.id));

  if (book && book.issued) {
    book.issued = false;
    res.json({ message: 'Book returned', book });
  } else {
    res.status(400).json({ message: 'Book not issued' });
  }
});

// ⭐ POST a review
app.post('/books/:id/review', (req, res) => {
  const book = books.find((b) => b.id === parseInt(req.params.id));
  if (!book) return res.status(404).json({ message: 'Book not found' });

  const { user, rating, comment } = req.body;
  if (!user || !rating || !comment) {
    return res.status(400).json({ message: 'Missing review fields' });
  }

  book.reviews.push({ user, rating, comment });
  res.json({ message: 'Review added', reviews: book.reviews });
});

// ⭐ GET reviews for a book
app.get('/books/:id/reviews', (req, res) => {
  const book = books.find((b) => b.id === parseInt(req.params.id));
  if (!book) return res.status(404).json({ message: 'Book not found' });

  res.json(book.reviews);
});

// 🔐 Admin login route
app.post('/admin/login', (req, res) => {
  const { username, password } = req.body;
  if (username === admin.username && password === admin.password) {
    res.json({ message: 'Login successful', role: 'admin' });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

app.listen(port, () => {
  console.log(`🚀 Backend running on http://localhost:${port}`);
});
