// Import necessary modules
import { db } from '../db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';  // Don't forget to import jwt

// Registration endpoint
export const register = (req, res) => {
  // Check existing user
  const q = 'SELECT * FROM users WHERE email = ? OR username = ?';

  db.query(q, [req.body.email, req.body.username], (err, data) => {
    if (err) return res.status(500).json(err);
    if (data.length) return res.status(409).json("User already exists!");

    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(req.body.password, salt);

    const insertQuery = "INSERT INTO users(`username`, `email`, `password`) VALUES(?, ?, ?)";
    const values = [req.body.username, req.body.email, hash];

    db.query(insertQuery, values, (err, data) => {
      if (err) return res.status(500).json(err);
      return res.status(200).json('User has been created');
    });
  });
};

// Login endpoint
export const login = (req, res) => {
  // CHECK USER
  const q = "SELECT * FROM users WHERE username = ?";

  db.query(q, [req.body.username], (err, data) => {
    if (err) return res.status(500).json(err);
    if (data.length === 0) return res.status(404).json("User not found!");

    // Check password
    const isPasswordCorrect = bcrypt.compareSync(
      req.body.password,
      data[0].password
    );

    if (!isPasswordCorrect)
      return res.status(400).json("Wrong username or password!");

    const token = jwt.sign({ id: data[0].id }, "jwtkey");
    const { password, ...other } = data[0];

    res
      .cookie("access_token", token, {
        httpOnly: true,
        // Add these options if your site is served over HTTPS
        secure: true,
        sameSite: 'None',
      })
      .status(200)
      .json(other);
  });
};

// Logout endpoint
export const logout = (req, res) => {
  res.clearCookie("access_token").status(200).json("User has been logged out.");
};
