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
    fetchBooks(); // refresh after update
  };

  const returnBook = async (id) => {
    await axios.put(`http://localhost:5000/books/${id}/return`);
    fetchBooks(); // refresh after update
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">🚗 Car Book Library</h1>
      <ul className="space-y-4">
        {books.map(book => (
          <li
            key={book.id}
            className="p-4 bg-white rounded shadow flex justify-between items-center"
          >
            <div>
              <h2 className="text-xl font-semibold">{book.title}</h2>
              <p className="text-gray-600">by {book.author}</p>
              <p className="text-sm">
                Status:{" "}
                <span className={book.issued ? "text-red-500" : "text-green-500"}>
                  {book.issued ? "Issued" : "Available"}
                </span>
              </p>
            </div>
            <div>
              {book.issued ? (
                <button
                  onClick={() => returnBook(book.id)}
                  className="px-4 py-2 bg-blue-500 text-white rounded"
                >
                  Return
                </button>
              ) : (
                <button
                  onClick={() => issueBook(book.id)}
                  className="px-4 py-2 bg-green-500 text-white rounded"
                >
                  Issue
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
