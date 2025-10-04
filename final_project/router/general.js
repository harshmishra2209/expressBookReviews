const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  //Write your code here
  const { username, password} = req.body;
  if(!username || !password)
  {
    return res.status(404).json({message: "Username and Password are required"});
  }
  if(users.some(user => user.username === username))
  {
    return res.status(409).json({message: "User already exists!"});
  }

  users.push({username, password});
  return res.status(201).json({message: "User Registered Siccessfully"});
});

// Get the book list available in the shop
public_users.get('/', async function (req, res) {
    try {
        const fetchBooks = () => new Promise((resolve) => {
            setTimeout(() => resolve(books), 100);
        });

        const allBooks = await fetchBooks();
        return res.status(200).send(JSON.stringify(allBooks, null, 2));
    } catch (err) {
        return res.status(500).json({ message: "Error fetching books", error: err.message });
    }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async function (req, res) {
    const isbn = req.params.isbn;
    try {
        const fetchBookByISBN = () => new Promise((resolve, reject) => {
            setTimeout(() => {
                if (books[isbn]) resolve(books[isbn]);
                else reject("Book not found");
            }, 100);
        });

        const book = await fetchBookByISBN();
        return res.status(200).send(JSON.stringify(book, null, 2));
    } catch (err) {
        return res.status(404).json({ message: err });
    }
});

  
// Get book details based on author
public_users.get('/author/:author', async function (req, res) {
    const authorQuery = req.params.author.replace(/_/g, " ").toLowerCase();
    try {
        const fetchBooksByAuthor = () => new Promise((resolve) => {
            const result = Object.keys(books)
                .filter(key => books[key].author.toLowerCase() === authorQuery)
                .map(key => books[key]);
            resolve(result);
        });

        const booksByAuthor = await fetchBooksByAuthor();

        if (booksByAuthor.length > 0) {
            return res.status(200).send(JSON.stringify(booksByAuthor, null, 2));
        } else {
            return res.status(404).json({ message: "No books found for this author" });
        }
    } catch (err) {
        return res.status(500).json({ message: "Error fetching books", error: err.message });
    }
});


// Get all books based on title
public_users.get('/title/:title', async function (req, res) {
    const titleQuery = req.params.title.replace(/_/g, " ").toLowerCase();
    try {
        const fetchBooksByTitle = () => new Promise((resolve) => {
            const result = Object.keys(books)
                .filter(key => books[key].title.toLowerCase().includes(titleQuery))
                .map(key => books[key]);
            resolve(result);
        });

        const booksByTitle = await fetchBooksByTitle();

        if (booksByTitle.length > 0) {
            return res.status(200).send(JSON.stringify(booksByTitle, null, 2));
        } else {
            return res.status(404).json({ message: "No books found with this title" });
        }
    } catch (err) {
        return res.status(500).json({ message: "Error fetching books", error: err.message });
    }
});


//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  //Write your code here
  const isbn = req.params.isbn;

  if(books[isbn] && books[isbn].reviews)
  {
    return res.status(200).send(JSON.stringify(books[isbn].reviews, null, 2));
  }
  else{
  return res.status(404).json({message: "No Reviews found for this book"});
  }
});

module.exports.general = public_users;

