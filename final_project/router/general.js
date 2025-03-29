const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
    const { username, password } = req.body;

    // Check if username and password are provided
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required." });
    }

    // Check if username already exists
    if (users[username]) {
        return res.status(409).json({ message: "Username already exists. Please choose a different username." });
    }

    // Register new user
    users[username] = { password }; // Storing password (consider hashing in production)
    return res.status(201).json({ message: "User registered successfully!" });
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
    try {
        const response = await axios.get("http://localhost:5000/books");  // Example API call
        return res.status(200).json(response.data);
    } catch (error) {
        return res.status(500).json({ message: "Failed to fetch books", error });
    }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
    const isbn = req.params.isbn;

    new Promise((resolve, reject) => {
        const book = books[isbn];
        if (book) {
            resolve(book);
        } else {
            reject({ message: "Book not found" });
        }
    })
    .then(book => res.status(200).json(book))
    .catch(err => res.status(404).json(err));
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
    const author = req.params.author;

    new Promise((resolve, reject) => {
        const filteredBooks = Object.values(books).filter(book => book.author === author);
        if (filteredBooks.length > 0) {
            resolve(filteredBooks);
        } else {
            reject({ message: "No books found by this author" });
        }
    })
    .then(books => res.status(200).json(books))
    .catch(err => res.status(404).json(err));
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
    const title = req.params.title;

    new Promise((resolve, reject) => {
        const filteredBooks = Object.values(books).filter(book => book.title === title);
        if (filteredBooks.length > 0) {
            resolve(filteredBooks);
        } else {
            reject({ message: "No books found with this title" });
        }
    })
    .then(books => res.status(200).json(books))
    .catch(err => res.status(404).json(err));
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    const isbn = req.params.isbn;
  
    if (books[isbn] && books[isbn].reviews) {
      return res.status(200).json(books[isbn].reviews);
    } else {
      return res.status(404).json({ message: "No reviews found for this book" });
    }
});

module.exports.general = public_users;
