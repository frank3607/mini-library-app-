 import React, { useEffect, useState } from 'react';
import axios from 'axios';

function App() {
  const [books, setBooks] = useState([]);
  const [searchTitle, setSearchTitle] = useState('');
  const [searchAuthor, setSearchAuthor] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [reviewInputs, setReviewInputs] = useState({});
  const [theme, setTheme] = useState('light');
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const response = await axios.get('http://localhost:5000/books', {
        params: {
          title: searchTitle,
          author: searchAuthor,
          category: selectedCategory,
        },
      });
      setBooks(response.data);
    } catch (error) {
      console.error('Error fetching books:', error);
    }
  };

  const issueBook = async (id) => {
    try {
      await axios.put(`http://localhost:5000/books/${id}/issue`);
      fetchBooks();
    } catch (error) {
      console.error('Error issuing book:', error);
    }
  };

  const returnBook = async (id) => {
    try {
      await axios.put(`http://localhost:5000/books/${id}/return`);
      fetchBooks();
    } catch (error) {
      console.error('Error returning book:', error);
    }
  };

  const handleReviewChange = (bookId, field, value) => {
    setReviewInputs(prev => ({
      ...prev,
      [bookId]: {
        ...prev[bookId],
        [field]: value,
      },
    }));
  };

  const submitReview = async (bookId) => {
    const review = reviewInputs[bookId];
    if (!review || !review.rating || !review.comment) return;

    try {
      await axios.post(`http://localhost:5000/books/${bookId}/review`, {
        user: 'Guest',
        rating: review.rating,
        comment: review.comment,
      });

      setReviewInputs(prev => ({
        ...prev,
        [bookId]: { rating: '', comment: '' },
      }));

      fetchBooks();
    } catch (error) {
      console.error('Error submitting review:', error);
    }
  };

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const toggleFavorite = (id) => {
    setFavorites(prev =>
      prev.includes(id)
        ? prev.filter(favId => favId !== id)
        : [...prev, id]
    );
  };

  const inputClass = (borderColor, ringColor) =>
    `px-4 py-2 border rounded-lg shadow-sm w-full sm:w-1/4 focus:outline-none focus:ring-2 ${
      theme === 'dark'
        ? `bg-gray-800 text-white border-${borderColor} focus:ring-${ringColor}`
        : `bg-white text-gray-900 border-${borderColor} focus:ring-${ringColor}`
    }`;

  return (
    <div
      className={`${theme === 'dark' ? 'bg-slate-900 text-white' : 'bg-white text-gray-900'} min-h-screen p-6 transition-colors duration-300`}
    >
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-extrabold text-center w-full text-green-900 dark:text-green-300 drop-shadow">
          📚 Multi-Category Book Library
        </h1>
        <button
          onClick={toggleTheme}
          className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 dark:bg-white dark:text-black dark:hover:bg-gray-200 transition"
        >
          {theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode'}
        </button>
      </div>

      <div className="mb-8 flex flex-col sm:flex-row gap-4 justify-center items-center">
        <input
          type="text"
          placeholder="Search by title"
          value={searchTitle}
          onChange={e => setSearchTitle(e.target.value)}
          className={inputClass('blue-300', 'blue-400')}
        />
        <input
          type="text"
          placeholder="Search by author"
          value={searchAuthor}
          onChange={e => setSearchAuthor(e.target.value)}
          className={inputClass('purple-300', 'purple-400')}
        />
        <select
          value={selectedCategory}
          onChange={e => setSelectedCategory(e.target.value)}
          className={inputClass('green-300', 'green-400')}
        >
          <option value="">All Categories</option>
          <option value="Automobile">🚘 Automobile</option>
          <option value="Train">🚆 Train</option>
          <option value="Flight">✈️ Flight</option>
        </select>
        <button
          onClick={fetchBooks}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Search
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {books.map(book => (
          <div
            key={book.id}
            className={`rounded-xl shadow-md hover:shadow-xl transform hover:scale-105 transition-all duration-300 overflow-hidden p-5 flex flex-col ${
              theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-900'
            }`}
          >
            <img
              src={book.cover || 'https://via.placeholder.com/300x200?text=No+Image'}
              alt={book.title}
              className="w-full h-60 object-contain mb-4 rounded bg-gray-100 dark:bg-gray-700"
            />

            <div className="flex-1">
              <h2 className="text-xl font-bold">{book.title}</h2>
              <p className="mb-1 italic">by {book.author}</p>
              <p className="text-sm mb-2 text-indigo-600 dark:text-indigo-300 font-medium">
                Category: {book.category}
              </p>
              <p className="text-sm mb-2">
                Status:{' '}
                <span className={book.issued ? 'text-red-500' : 'text-green-600'}>
                  {book.issued ? 'Issued' : 'Available'}
                </span>
              </p>
            </div>

            <div className="mt-auto mb-4 flex gap-2">
              {book.issued ? (
                <button
                  onClick={() => returnBook(book.id)}
                  className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                >
                  Return
                </button>
              ) : (
                <button
                  onClick={() => issueBook(book.id)}
                  className="w-full py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                >
                  Issue
                </button>
              )}
              <button
                onClick={() => toggleFavorite(book.id)}
                className={`px-3 py-2 rounded-lg ${
                  favorites.includes(book.id) ? 'bg-yellow-400' : 'bg-gray-300'
                } text-black hover:scale-105 transition`}
              >
                {favorites.includes(book.id) ? '💛 Wishlisted' : '🤍 Wishlist'}
              </button>
            </div>

            <div className="mt-2">
              <h3 className="text-md font-semibold mb-2 text-purple-700 dark:text-purple-300">
                Reviews:
              </h3>
              {book.reviews && book.reviews.length > 0 ? (
                book.reviews.map((r, i) => (
                  <div key={i} className="text-sm mb-1 flex items-center gap-2">
                    <strong>{r.user}</strong>:
                    <span className="text-yellow-500">
                      {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                    </span>
                    – {r.comment}
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">No reviews yet.</p>
              )}

              <div className="mt-3 space-y-2">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(star => (
                    <span
                      key={star}
                      onClick={() => handleReviewChange(book.id, 'rating', star)}
                      className={`cursor-pointer text-xl ${
                        reviewInputs[book.id]?.rating >= star
                          ? 'text-yellow-500'
                          : 'text-gray-300'
                      }`}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Comment"
                  value={reviewInputs[book.id]?.comment || ''}
                  onChange={e => handleReviewChange(book.id, 'comment', e.target.value)}
                  className={`w-full px-3 py-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 ${
                    theme === 'dark'
                      ? 'bg-gray-700 text-white border-gray-600'
                      : 'bg-white text-gray-900 border-gray-300'
                  }`}
                />
                <button
                  onClick={() => submitReview(book.id)}
                  className="px-3 py-1 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition"
                >
                  Submit Review
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;

