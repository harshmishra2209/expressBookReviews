const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
    return users.some((user) => user.username === username);
}

const authenticatedUser = (username, password) => {
    return users.some((user) => user.username === username && user.password === password);
}

regd_users.post("/login", (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: "Error! username and password are required!" });
    }
    if (authenticatedUser(username, password)) {
        const accessToken = jwt.sign(
            { username: username },
            'access',
            { expiresIn: '1h' }
        );
        return res.status(200).json({ message: "Customer logged in successfully!", token: accessToken });
    } else {
        return res.status(401).json({ message: "Invalid username or password!" });
    }
});

regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const review = req.query.review;
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(403).json({ message: "User not logged in" });

    const token = authHeader.split(" ")[1];
    let username;
    try {
        const decoded = jwt.verify(token, "access");
        username = decoded.username;
    } catch (err) {
        return res.status(401).json({ message: "Invalid or expired token" });
    }

    if (!isbn || !review) return res.status(400).json({ message: "ISBN and reviews are required!" });
    if (!books[isbn]) return res.status(404).json({ message: "Book not Found!" });

    books[isbn].reviews[username] = review;
    return res.status(200).json({ message: "Review added/updated successfully", reviews: books[isbn].reviews });
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(403).json({ message: "User not logged in" });

    const token = authHeader.split(" ")[1];
    let username;
    try {
        const decoded = jwt.verify(token, "access");
        username = decoded.username;
    } catch (err) {
        return res.status(401).json({ message: "Invalid or expired token" });
    }

    if (!books[isbn]) return res.status(404).json({ message: "Book not found!" });
    if (books[isbn].reviews && books[isbn].reviews[username]) {
        delete books[isbn].reviews[username];
        return res.status(200).json({ message: "Your review has been deleted successfully", reviews: books[isbn].reviews });
    } else {
        return res.status(404).json({ message: "No review found for this user on this book" });
    }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
