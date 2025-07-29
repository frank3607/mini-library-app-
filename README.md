📚 Mini Library Management System
A full-stack web application for managing a multi-category book library, featuring user authentication, book management, reviews, and email notifications.

✨ Features
User Authentication: Secure login/logout functionality using JWT (JSON Web Tokens).

Book Listing: View all available books with details like title, author, category, and status.

Search & Filter: Easily search books by title or author, and filter by category.

Book Actions: Mark books as "Issued" or "Returned".

Book Reviews: Users can submit star ratings and comments for books.

Add New Books: Functionality to add new books to the library.

Email Notifications: Get an email notification when a new book is added (configurable via frontend input).

Theme Toggle: Switch between light and dark modes for a personalized experience.

Client-Side Favorites: Mark books as favorites/wishlisted (local to the browser for now).

Responsive Design: Optimized for various screen sizes using Tailwind CSS.

💻 Technologies Used
Frontend:

React.js: A JavaScript library for building user interfaces.

Axios: Promise-based HTTP client for making API requests.

Tailwind CSS: A utility-first CSS framework for rapid UI development.

Backend:

Node.js: JavaScript runtime environment.

Express.js: Fast, unopinionated, minimalist web framework for Node.js.

bcryptjs: Library for hashing passwords securely.

jsonwebtoken (JWT): For creating and verifying secure authentication tokens.

cors: Middleware to enable Cross-Origin Resource Sharing.

dotenv: To load environment variables from a .env file.

Nodemailer: Module for sending emails.
