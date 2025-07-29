 import React, { useEffect, useState } from 'react';
import axios from 'axios';

function App() {
  // Authentication States
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userToken, setUserToken] = useState(localStorage.getItem('token') || null);
  const [currentUsername, setCurrentUsername] = useState(localStorage.getItem('username') || null);

  // Login Form States
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Book Data & UI States
  const [books, setBooks] = useState([]);
  const [searchTitle, setSearchTitle] = useState('');
  const [searchAuthor, setSearchAuthor] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [reviewInputs, setReviewInputs] = useState({});
  const [theme, setTheme] = useState('light');
  const [favorites, setFavorites] = useState([]); // Client-side favorites

  // New Book Form States
  const [newBookTitle, setNewBookTitle] = useState('');
  const [newBookAuthor, setNewBookAuthor] = useState('');
  const [newBookCategory, setNewBookCategory] = useState('');
  const [newBookCover, setNewBookCover] = useState('');
  const [notificationEmail, setNotificationEmail] = useState('');

  // Tailwind CSS helper for input fields
  const inputClass = (lightBorder, darkBorder) =>
    `w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-400 ${
      theme === 'dark'
        ? `bg-gray-700 text-white border-${darkBorder}`
        : `bg-white text-gray-900 border-${lightBorder}`
    }`;

  // --- Auth Handlers ---
  useEffect(() => {
    // Check if token exists on mount, try to fetch books
    if (userToken) {
      setIsLoggedIn(true);
      fetchBooks();
    }
  }, [userToken]); // Depend on userToken to re-run when token changes

  const handleLogin = async (e) => {
    e.preventDefault(); // Prevent default form submission
    setLoginError(''); // Clear previous errors
    try {
      const response = await axios.post('http://localhost:5000/api/login', {
        username: loginUsername,
        password: loginPassword,
      });
      const { token, user } = response.data;
      localStorage.setItem('token', token); // Store token in local storage
      localStorage.setItem('username', user.username); // Store username
      setUserToken(token);
      setCurrentUsername(user.username);
      setIsLoggedIn(true);
      setLoginUsername(''); // Clear form
      setLoginPassword(''); // Clear form
      // fetchBooks() will be called by the useEffect after setUserToken
    } catch (error) {
      console.error('Login error:', error);
      setLoginError(error.response?.data?.message || 'Login failed. Please try again.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setUserToken(null);
    setCurrentUsername(null);
    setIsLoggedIn(false);
    setBooks([]); // Clear books on logout
    alert('You have been logged out.');
  };

  // --- Axios Instance with Auth Header ---
  // Create an Axios instance that always sends the token if available
  const authAxios = axios.create({
    baseURL: 'http://localhost:5000',
  });

  // Request interceptor to add the Authorization header
  authAxios.interceptors.request.use(
    (config) => {
      if (userToken) {
        config.headers.Authorization = `Bearer ${userToken}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor to handle 401 Unauthorized errors
  authAxios.interceptors.response.use(
    (response) => response,
    (error) => {
      // If a 401 Unauthorized response is received, log out the user
      if (error.response && error.response.status === 401) {
        console.error("Unauthorized: Token expired or invalid. Logging out.");
        handleLogout(); // Automatically log out if token is invalid/expired
      }
      return Promise.reject(error);
    }
  );

  // --- Book Management Handlers (Modified to use authAxios) ---

  const fetchBooks = async () => {
    try {
      // Use authAxios for protected routes
      const response = await authAxios.get('/books', {
        params: {
          title: searchTitle,
          author: searchAuthor,
          category: selectedCategory,
        },
      });
      setBooks(response.data);
    } catch (error) {
      console.error('Error fetching books:', error);
      // Only show alert if it's not a 401 (which is handled by interceptor)
      if (error.response && error.response.status !== 401) {
          alert('Failed to fetch books. Please log in or check your connection.');
      }
    }
  };

  const addNewBook = async () => {
    if (!newBookTitle || !newBookAuthor || !newBookCategory || !newBookCover) {
      alert('Please fill in all book details!');
      return;
    }

    try {
      // Use authAxios for protected routes
      await authAxios.post('/books', {
        title: newBookTitle,
        author: newBookAuthor,
        category: newBookCategory,
        cover: newBookCover,
        notificationEmail: notificationEmail, // Send email from frontend input
      });
      alert('Book added successfully!');
      // Clear the form fields
      setNewBookTitle('');
      setNewBookAuthor('');
      setNewBookCategory('');
      setNewBookCover('');
      setNotificationEmail('');
      fetchBooks(); // Refresh the book list
    } catch (error) {
      console.error('Error adding new book:', error);
      alert('Failed to add book. Check console for details.');
    }
  };

  const issueBook = async (id) => {
    try {
      // Use authAxios for protected routes
      await authAxios.put(`/books/${id}/issue`);
      fetchBooks();
    } catch (error) {
      console.error('Error issuing book:', error);
      alert('Failed to issue book.');
    }
  };

  const returnBook = async (id) => {
    try {
      // Use authAxios for protected routes
      await authAxios.put(`/books/${id}/return`);
      fetchBooks();
    } catch (error) {
      console.error('Error returning book:', error);
      alert('Failed to return book.');
    }
  };

  const handleReviewChange = (bookId, field, value) => {
    setReviewInputs((prev) => ({
      ...prev,
      [bookId]: {
        ...prev[bookId],
        [field]: value,
      },
    }));
  };

  const submitReview = async (bookId) => {
    const { rating, comment } = reviewInputs[bookId] || {};
    if (!rating || !comment) {
      alert('Please fill in rating and comment!');
      return;
    }

    try {
      // Use authAxios for protected routes
      await authAxios.post(`/books/${bookId}/review`, {
        // 'user' field is now automatically populated on the backend from the JWT token
        rating,
        comment,
      });
      alert('Review added successfully!');
      setReviewInputs((prev) => ({ ...prev, [bookId]: {} })); // Clear review form
      fetchBooks(); // Refresh books to show new review
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review.');
    }
  };

  // --- Favorite/Wishlist Toggle (client-side only for now) ---
  const toggleFavorite = (bookId) => {
    setFavorites((prevFavorites) =>
      prevFavorites.includes(bookId)
        ? prevFavorites.filter((id) => id !== bookId)
        : [...prevFavorites, bookId]
    );
  };

  // --- Main Render Logic ---
  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <header className={`p-4 shadow-lg flex flex-col sm:flex-row justify-between items-center ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
        <h1 className="text-4xl font-extrabold text-red-800 dark:text-red-400 mb-4 sm:mb-0">
          My Mini Library
        </h1>
        <div className="flex items-center space-x-4">
          {isLoggedIn && (
            <span className="text-lg font-medium">Welcome, {currentUsername}!</span>
          )}
          <button
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
          >
            {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
          </button>
          {isLoggedIn && (
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
            >
              Logout
            </button>
          )}
        </div>
      </header>

      {!isLoggedIn ? (
        // --- Login Form ---
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <form onSubmit={handleLogin} className={`p-8 rounded-lg shadow-xl w-full max-w-md ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
            <h2 className="text-3xl font-bold mb-6 text-center text-red-700 dark:text-red-400">Login</h2>
            {loginError && <p className="text-red-500 text-center mb-4">{loginError}</p>}
            <div className="mb-4">
              <label htmlFor="username" className="block text-sm font-medium mb-2">Username:</label>
              <input
                type="text"
                id="username"
                placeholder="Enter username (e.g., admin)"
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                className={inputClass('red-300', 'red-400')}
                required
              />
            </div>
            <div className="mb-6">
              <label htmlFor="password" className="block text-sm font-medium mb-2">Password:</label>
              <input
                type="password"
                id="password"
                placeholder="Enter password (e.g., admin123)"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className={inputClass('red-300', 'red-400')}
                required
              />
            </div>
            <button
              type="submit"
              className="w-full px-4 py-3 bg-red-700 text-white font-semibold rounded-lg hover:bg-red-800 transition"
            >
              Login
            </button>
            <p className="text-center text-gray-500 text-sm mt-4">
                Hint: Default user is **admin** with password **admin123**
            </p>
          </form>
        </div>
      ) : (
        // --- Main App Content (visible only when logged in) ---
        <>
          {/* Search and Filter Section */}
          <div className="p-6 mb-8 flex flex-col sm:flex-row gap-4 justify-center items-center">
            <input
              type="text"
              placeholder="Search by Title"
              value={searchTitle}
              onChange={(e) => setSearchTitle(e.target.value)}
              className={inputClass('gray-300', 'gray-400')}
            />
            <input
              type="text"
              placeholder="Search by Author"
              value={searchAuthor}
              onChange={(e) => setSearchAuthor(e.target.value)}
              className={inputClass('gray-300', 'gray-400')}
            />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className={inputClass('gray-300', 'gray-400')}
            >
              <option value="">All Categories</option>
              <option value="Automobile">Automobile</option>
              <option value="Train">Train</option>
              <option value="Flight">Flight</option>
            </select>
            <button
              onClick={fetchBooks}
              className="px-6 py-2 bg-red-700 text-white font-semibold rounded-lg hover:bg-red-800 transition w-full sm:w-auto"
            >
              Apply Filter
            </button>
          </div>

          {/* New Book Addition Section */}
          <div className={`p-6 mb-8 rounded-xl shadow-md mx-6 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
            <h2 className="text-2xl font-bold mb-4 text-red-700 dark:text-red-300">Add New Book</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              <input
                type="text"
                placeholder="Book Title"
                value={newBookTitle}
                onChange={e => setNewBookTitle(e.target.value)}
                className={inputClass('gray-300', 'gray-400')}
              />
              <input
                type="text"
                placeholder="Book Author"
                value={newBookAuthor}
                onChange={e => setNewBookAuthor(e.target.value)}
                className={inputClass('gray-300', 'gray-400')}
              />
              <input
                type="text"
                placeholder="Book Category (e.g., Automobile, Train, Flight)"
                value={newBookCategory}
                onChange={e => setNewBookCategory(e.target.value)}
                className={inputClass('gray-300', 'gray-400')}
              />
              <input
                type="text"
                placeholder="Book Cover URL (e.g., https://via.placeholder.com/150)"
                value={newBookCover}
                onChange={e => setNewBookCover(e.target.value)}
                className={inputClass('gray-300', 'gray-400')}
              />
               <input
                type="email"
                placeholder="Email to notify (optional)"
                value={notificationEmail}
                onChange={e => setNotificationEmail(e.target.value)}
                className={inputClass('red-300', 'red-400')}
              />
            </div>
            <button
              onClick={addNewBook}
              className="px-6 py-3 bg-red-700 text-white font-semibold rounded-lg hover:bg-red-800 transition w-full"
            >
              Add Book to Library
            </button>
          </div>

          {/* Book List Display */}
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {books.map((book) => (
              <div
                key={book.id}
                className={`relative rounded-xl shadow-md overflow-hidden ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}
              >
                <img
                  src={book.cover}
                  alt={book.title}
                  className="w-full h-48 object-cover object-center"
                />
                {favorites.includes(book.id) && (
                  <div className="absolute top-2 right-2 text-yellow-500 text-2xl">❤️</div>
                )}
                <div className="p-4">
                  <h3 className="text-xl font-bold mb-1">{book.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">by {book.author}</p>
                  <p className="text-sm font-medium text-red-600 dark:text-red-300 mb-3">
                    Category: {book.category}
                  </p>
                  <p
                    className={`text-md font-semibold ${
                      book.issued ? 'text-red-500' : 'text-green-500'
                    }`}
                  >
                    Status: {book.issued ? 'Issued' : 'Available'}
                  </p>
                  <div className="flex space-x-2 mt-4">
                    <button
                      onClick={() => issueBook(book.id)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={book.issued}
                    >
                      Issue Book
                    </button>
                    <button
                      onClick={() => returnBook(book.id)}
                      className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={!book.issued}
                    >
                      Return Book
                    </button>
                    <button
                      onClick={() => toggleFavorite(book.id)}
                      className={`px-4 py-2 ${
                        favorites.includes(book.id) ? 'bg-red-600' : 'bg-gray-400'
                      } text-white rounded-lg hover:bg-red-700 transition`}
                    >
                      {favorites.includes(book.id) ? 'Unfavorite' : 'Favorite'}
                    </button>
                  </div>

                  {/* Reviews Section */}
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <h4 className="text-lg font-bold mb-2">Reviews:</h4>
                    {book.reviews.length > 0 ? (
                      book.reviews.map((review, index) => (
                        <div key={index} className="mb-2 p-2 bg-gray-100 dark:bg-gray-700 rounded-md">
                          <p className="font-semibold">{review.user}</p>
                          <div className="flex items-center text-yellow-500">
                            {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                          </div>
                          <p className="text-sm text-gray-700 dark:text-gray-300">{review.comment}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500 dark:text-gray-400">No reviews yet.</p>
                    )}

                    {/* Add Review Form */}
                    <div className="mt-4">
                      <h5 className="font-semibold mb-2">Add Your Review ({currentUsername}):</h5>
                      <div className="flex items-center mb-2">
                        <span className="mr-2 text-sm font-medium">Rating:</span>
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
                        className={inputClass('gray-300', 'gray-600')}
                      />
                      <button
                        onClick={() => submitReview(book.id)}
                        className="mt-2 px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                      >
                        Submit Review
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default App;


