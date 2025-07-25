 const express = require('express');
const cors = require('cors');

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

// ✅ Car-related books with working image links
let books = [
  {
    id: 1,
    title: 'The Car Book 2024',
    author: 'Jack Gillis',
    issued: false,
    cover: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Car_blue.svg/512px-Car_blue.svg.png',
  },
  {
    id: 2,
    title: 'How Cars Work',
    author: 'Tom Newton',
    issued: false,
    cover: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f7/Automobile_icon_4.png/512px-Automobile_icon_4.png',
  },
  {
    id: 3,
    title: 'The Complete Car Manual',
    author: 'Haynes Publishing',
    issued: false,
    cover: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Car_icon_black.svg/480px-Car_icon_black.svg.png',
  },
  {
    id: 4,
    title: 'Drive: The Definitive History of Driving',
    author: 'DK Publishing',
    issued: false,
    cover: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Car_red.svg/480px-Car_red.svg.png',
  },
  {
    id: 5,
    title: 'Classic Cars: A Century of Masterpieces',
    author: 'Giles Chapman',
    issued: false,
    cover: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/61/Sedan_car_icon.png/480px-Sedan_car_icon.png',
  },
];

// GET all books
app.get('/books', (req, res) => {
  res.json(books);
});

// Issue a book
app.put('/books/:id/issue', (req, res) => {
  const book = books.find((b) => b.id === parseInt(req.params.id));
  if (book && !book.issued) {
    book.issued = true;
    res.json({ message: 'Book issued', book });
  } else {
    res.status(400).json({ message: 'Book not available' });
  }
});

// Return a book
app.put('/books/:id/return', (req, res) => {
  const book = books.find((b) => b.id === parseInt(req.params.id));
  if (book && book.issued) {
    book.issued = false;
    res.json({ message: 'Book returned', book });
  } else {
    res.status(400).json({ message: 'Book not issued' });
  }
});

app.listen(port, () => {
  console.log(`🚀 Backend running on http://localhost:${port}`);
});
