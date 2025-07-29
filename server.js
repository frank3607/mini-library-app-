  // backend/server.js
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs'); // For password hashing
const jwt = require('jsonwebtoken'); // For JSON Web Tokens

// Assuming you have dotenv set up as discussed before
// Ensure your .env file is in the backend directory
require('dotenv').config({ path: __dirname + '/.env' });

// Import your emailService if you implemented it
const { sendNewBookNotification } = require('./utils/emailService');

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

// --- JWT Secret (VERY IMPORTANT: Use a strong, random secret in production) ---
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey'; // Get from .env or use a fallback

// --- In-memory User Storage (for demo purposes, replace with a database) ---
// In a real app, users would be stored in MongoDB, PostgreSQL, etc.
let users = [];

// Add a default admin user if no users exist
if (users.length === 0) {
  bcrypt.hash('admin123', 10, (err, hash) => {
    if (err) {
      console.error('Error hashing default admin password:', err);
      return;
    }
    users.push({ id: 1, username: 'admin', password: hash });
    console.log('Default admin user created: admin/admin123');
    // console.log('Current users:', users); // For debugging: view hashed password
  });
}

// 📚 Book list with categories (from your original code)
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
    title: 'Flight Basics for Beginners',
    author: 'Amelia Earhart',
    category: 'Flight',
    issued: false,
    cover: 'https://placehold.co/300x200?text=Flight+Basics',
    reviews: [],
  },
  {
    id: 5,
    title: 'The Art of Flight',
    author: 'Leonardo da Vinci',
    category: 'Flight',
    issued: false,
    cover: 'https://placehold.co/300x200?text=Art+of+Flight',
    reviews: [],
  },
];

// --- Middleware to verify JWT token ---
const verifyToken = (req, res, next) => {
  const token = req.header('Authorization'); // Get token from Authorization header

  if (!token) {
    return res.status(401).json({ message: 'Access Denied: No token provided' });
  }

  try {
    // Tokens are usually 'Bearer <token>', so we split it
    const tokenValue = token.split(' ')[1];
    if (!tokenValue) {
        return res.status(401).json({ message: 'Access Denied: Token format invalid' });
    }
    const verified = jwt.verify(tokenValue, JWT_SECRET);
    req.user = verified; // Add user payload to request
    next(); // Proceed to the next middleware/route handler
  } catch (err) {
    res.status(400).json({ message: 'Invalid Token' });
  }
};


// --- Auth Routes ---

// ➡️ POST /api/register (Optional: User Registration)
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  const userExists = users.some(u => u.username === username);
  if (userExists) {
    return res.status(409).json({ message: 'User already exists' });
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = { id: users.length + 1, username, password: hashedPassword };
    users.push(newUser);
    res.status(201).json({ message: 'User registered successfully!' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});


// ➡️ POST /api/login (User Login)
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  const user = users.find(u => u.username === username);
  if (!user) {
    return res.status(400).json({ message: 'Invalid credentials' });
  }

  try {
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: '1h' } // Token expires in 1 hour
    );

    res.json({ message: 'Logged in successfully', token, user: { id: user.id, username: user.username } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});


// --- Protected Routes (All book-related routes now use verifyToken middleware) ---

// 📖 GET all books (now requires login)
app.get('/books', verifyToken, (req, res) => {
  const { title, author, category } = req.query;
  let filteredBooks = books;

  if (title) {
    filteredBooks = filteredBooks.filter((book) =>
      book.title.toLowerCase().includes(title.toLowerCase())
    );
  }
  if (author) {
    filteredBooks = filteredBooks.filter((book) =>
      book.author.toLowerCase().includes(author.toLowerCase())
    );
  }
  if (category) {
    filteredBooks = filteredBooks.filter((book) =>
      book.category.toLowerCase() === category.toLowerCase()
    );
  }

  res.json(filteredBooks);
});

// ➕ POST a new book (now requires login)
app.post('/books', verifyToken, (req, res) => {
  const { title, author, category, cover, notificationEmail } = req.body;

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

  // Send email notification if an email was provided
  if (notificationEmail && sendNewBookNotification) {
    sendNewBookNotification(notificationEmail, newBook.title, newBook.author, newBook.category);
  } else if (!sendNewBookNotification) {
      console.warn("Email service not available. Did you set up utils/emailService.js correctly?");
  } else {
      console.log('No notification email provided for this book addition.');
  }


  res.status(201).json({ message: 'Book added', book: newBook });
});

// 🔖 PUT issue a book (now requires login)
app.put('/books/:id/issue', verifyToken, (req, res) => {
  const book = books.find((b) => b.id === parseInt(req.params.id));

  if (book && !book.issued) {
    book.issued = true;
    res.json({ message: 'Book issued', book });
  } else {
    res.status(400).json({ message: 'Book already issued or not found' });
  }
});

// ↩️ PUT return a book (now requires login)
app.put('/books/:id/return', verifyToken, (req, res) => {
  const book = books.find((b) => b.id === parseInt(req.params.id));

  if (book && book.issued) {
    book.issued = false;
    res.json({ message: 'Book returned', book });
  } else {
    res.status(400).json({ message: 'Book not issued' });
  }
});

// ⭐ POST a review (now requires login)
app.post('/books/:id/review', verifyToken, (req, res) => {
  const book = books.find((b) => b.id === parseInt(req.params.id));
  if (!book) return res.status(404).json({ message: 'Book not found' });

  // req.user is populated by verifyToken middleware
  const { rating, comment } = req.body;
  const user = req.user.username; // Use username from token as reviewer

  if (!user || !rating || !comment) {
    return res.status(400).json({ message: 'Missing review fields' });
  }

  book.reviews.push({ user, rating, comment });
  res.json({ message: 'Review added', reviews: book.reviews });
});

// ⭐ GET reviews for a book (now requires login)
app.get('/books/:id/reviews', verifyToken, (req, res) => {
  const book = books.find((b) => b.id === parseInt(req.params.id));
  if (!book) return res.status(404).json({ message: 'Book not found' });

  res.json(book.reviews);
});

// 🔑 Admin login (Simple demo, this is replaced by the new /api/login)
// app.post('/api/admin-login', (req, res) => {
//   const { username, password } = req.body;
//   if (username === admin.username && password === admin.password) {
//     res.json({ message: 'Admin login successful' });
//   } else {
//     res.status(401).json({ message: 'Invalid credentials' });
//   }
// });

// Server listen
app.listen(port, () => {
  console.log(`🚀 Backend running on http://localhost:${port}`);
});
