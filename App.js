import React, { useEffect, useState } from 'react';
import axios from 'axios';

function App() {
  const [books, setBooks] = useState([]);

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    const response = await axios.get('http://localhost:5000/books');
    setBooks(response.data);
  };

  const issueBook = async (id) => {
    await axios.put(`http://localhost:5000/books/${id}/issue`);
    fetchBooks();
  };

  const returnBook = async (id) => {
    await axios.put(`http://localhost:5000/books/${id}/return`);
    fetchBooks();
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center text-blue-700">
        🚗 Car Book Library
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {books.map((book) => (
          <div
            key={book.id}
            className="bg-white rounded shadow-lg overflow-hidden p-4 flex flex-col"
          >
            <img
              src={book.cover}
              alt={book.title}
              className="w-full h-60 object-contain mb-4"
            />

            <div className="flex-1">
              <h2 className="text-xl font-semibold">{book.title}</h2>
              <p className="text-gray-600 mb-1">by {book.author}</p>
              <p className="text-sm mb-2">
                Status:{' '}
                <span
                  className={book.issued ? 'text-red-500' : 'text-green-600'}
                >
                  {book.issued ? 'Issued' : 'Available'}
                </span>
              </p>
            </div>

            <div className="mt-auto">
              {book.issued ? (
                <button
                  onClick={() => returnBook(book.id)}
                  className="w-full py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Return
                </button>
              ) : (
                <button
                  onClick={() => issueBook(book.id)}
                  className="w-full py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  Issue
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
