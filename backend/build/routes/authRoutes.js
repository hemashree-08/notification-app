// backend/routes/authRoutes.js
const express = require('express');
const User = require('../models/user');
const router = express.Router();

// ✅ Register Route (No email)
router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  console.log('=== NEW USER REGISTRATION ATTEMPT ===');
  console.log('Username:', username);

  try {
    // Validate input
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    // Check if username already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      console.log('❌ Username already exists:', username);
      return res.status(400).json({ message: 'Username already exists' });
    }

    // Create new user and save to database
    const newUser = new User({ 
      username, 
      password,
      email: null // Explicitly set email to null
    });
    await newUser.save();

    console.log('✅ New user registered successfully:');
    console.log('User ID:', newUser._id);
    console.log('Username:', newUser.username);
    console.log('=====================================');

    res.status(201).json({
      message: 'User registered successfully!',
      userId: newUser._id,
      username: newUser.username,
    });
  } catch (error) {
    console.error('❌ Registration failed:', error.message);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Username already exists' });
    }
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
});

// ✅ Login Route
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  console.log('=== USER LOGIN ATTEMPT ===');
  console.log('Username:', username);

  try {
    const user = await User.findOne({ username });

    // Validate login credentials
    if (!user || user.password !== password) {
      console.log('❌ Invalid credentials for user:', username);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    console.log('✅ User logged in successfully:');
    console.log('User ID:', user._id);
    console.log('Username:', user.username);
    console.log('=====================================');

    res.status(200).json({
      message: 'Login successful',
      userId: user._id,
      username: user.username,
    });
  } catch (error) {
    console.error('❌ Login failed:', error.message);
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
});

module.exports = router;
