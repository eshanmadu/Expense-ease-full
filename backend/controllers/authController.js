import mongoose from "mongoose";
import User from "../models/user.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const register = async (req, res) => {
  try {
    let conn = mongoose.connection.readyState === 1
      ? mongoose.connection
      : await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 10000 });
    const { name, email, password, currency } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({ name, email, password: hashedPassword, currency: currency || undefined });

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
    res.status(201).json({ user: newUser, token });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: err.message || 'Internal server error' });
  }
};

export const login = async (req, res) => {
  try {
    let conn = mongoose.connection.readyState === 1
      ? mongoose.connection
      : await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 10000 });
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
    res.status(200).json({ user, token });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: err.message || 'Internal server error' });
  }
};

export const getProfile = async (req, res) => {
  try {
    let conn = mongoose.connection.readyState === 1
      ? mongoose.connection
      : await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 10000 });
    
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ user });
  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({ message: err.message || 'Internal server error' });
  }
};

export const updateProfile = async (req, res) => {
  try {
    let conn = mongoose.connection.readyState === 1
      ? mongoose.connection
      : await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 10000 });
    
    const { name, email, currentPassword, newPassword, currency } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Check if email is being changed and if it already exists
    if (email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) return res.status(400).json({ message: "Email already exists" });
    }

    // Update basic fields
    if (typeof name === 'string') user.name = name;
    if (typeof email === 'string') user.email = email;
    if (currency) user.currency = currency;

    // Handle password change if new password is provided
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ message: "Current password is required to change password" });
      }

      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        return res.status(400).json({ message: "Current password is incorrect" });
      }

      user.password = await bcrypt.hash(newPassword, 10);
    }

    await user.save();

    // Return user without password
    const updatedUser = await User.findById(user._id).select('-password');
    res.status(200).json({ user: updatedUser });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ message: err.message || 'Internal server error' });
  }
};