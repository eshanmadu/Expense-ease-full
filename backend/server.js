import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import authRoutes from "./routes/auth.js";
import transactionRoutes from "./routes/transactionRoute.js";

dotenv.config();
const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionRoutes);

// Serve frontend build (same port for frontend + backend)
const frontendBuildPath = path.join(__dirname, "../frontend/build");
app.use(express.static(frontendBuildPath));

// Fallback to index.html for non-API routes (avoid path-to-regexp wildcard issues)
app.get(/^(?!\/api\/).+/, (req, res) => {
  res.sendFile(path.join(frontendBuildPath, "index.html"));
});

// Connect to MongoDB
if (!process.env.MONGO_URI) {
  console.error("MONGO_URI is not defined. Please set it in your .env file.");
  process.exit(1);
}

if (!process.env.JWT_SECRET) {
  console.error("JWT_SECRET is not defined. Please set it in your .env file.");
  process.exit(1);
}

mongoose.set('strictQuery', true);
mongoose
  .connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 10000,
    heartbeatFrequencyMS: 10000,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
  });

mongoose.connection.on('error', (err) => {
  console.error('Mongoose connection error:', err.message);
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
