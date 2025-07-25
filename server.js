 const express = require('express');
const cors = require('cors');

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

// 🚗 Car-related books
let books = [
  { id: 1, title: 'The Car Book 2024', author: 'Jack Gillis', issued: false },
  { id: 2, title: 'How Cars Work', author: 'Tom Newton', issued: false },
  { id: 3, title: 'The Complete Car Manual', author: 'Haynes Publishing', issued: false },
  { id: 4, title: 'Drive: The Definitive History of Driving', author: 'DK Publishing', issued: false },
  { id: 5, title: 'Classic Cars: A Century of Masterpieces', author: 'Giles Chapman', issued: false },
];

// Get book list
app.get('/books', (req, res) => {
  res.json(books);
});

// Issue a book
app.put('/books/:id/issue', (req, res) => {
  const book = books.find(b => b.id === parseInt(req.params.id));
  if (book && !book.issued) {
    book.issued = true;
    res.json({ message: 'Book issued', book });
  } else {
    res.status(400).json({ message: 'Book not available' });
  }
});

// Return a book
app.put('/books/:id/return', (req, res) => {
  const book = books.find(b => b.id === parseInt(req.params.id));
  if (book && book.issued) {
    book.issued = false;
    res.json({ message: 'Book returned', book });
  } else {
    res.status(400).json({ message: 'Book not issued' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
