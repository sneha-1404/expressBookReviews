const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
    return users.some(user => user.username === username);
}

const authenticatedUser = (username,password)=>{ //returns boolean
//write code to check if username and password match the one we have in records.
return users.some(user => user.username === username && user.password === password);
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  //Write your code here
  const { username, password } = req.body;

  // Check if username and password are provided
  if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required." });
  }

  // Validate user credentials
  if (!authenticatedUser(username, password)) {
      return res.status(401).json({ message: "Invalid username or password." });
  }

  // Generate JWT token
  const token = jwt.sign({ username }, "your_secret_key", { expiresIn: '1h' });

  return res.status(200).json({ message: "Login successful!", token });
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  //Write your code here
  const { isbn } = req.params;
  const { review } = req.body;
  const token = req.headers.authorization;

  // Check if the user is authenticated
  if (!token) {
      return res.status(401).json({ message: "Access denied. No token provided." });
  }

  try {
      // Verify token
      const decoded = jwt.verify(token, "your_secret_key");
      const username = decoded.username;

      // Ensure the book exists
      if (!books[isbn]) {
          return res.status(404).json({ message: "Book not found." });
      }

      // Add or update the review
      if (!books[isbn].reviews) {
          books[isbn].reviews = {};
      }
      books[isbn].reviews[username] = review;

      return res.status(200).json({ message: "Review added/updated successfully!", reviews: books[isbn].reviews });
  } catch (error) {
      return res.status(401).json({ message: "Invalid token." });
  }
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
    const { isbn } = req.params;
    const token = req.headers.authorization;

    // Check if the user is authenticated
    if (!token) {
        return res.status(401).json({ message: "Access denied. No token provided." });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, "your_secret_key");
        const username = decoded.username;

        // Ensure the book exists
        if (!books[isbn]) {
            return res.status(404).json({ message: "Book not found." });
        }

        // Ensure the book has reviews
        if (!books[isbn].reviews || !books[isbn].reviews[username]) {
            return res.status(404).json({ message: "No review found for this book under your account." });
        }

        // Delete the user's review
        delete books[isbn].reviews[username];

        return res.status(200).json({ message: "Review deleted successfully!", reviews: books[isbn].reviews });
    } catch (error) {
        return res.status(401).json({ message: "Invalid token." });
    }
});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
