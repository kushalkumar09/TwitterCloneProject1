// Import necessary modules
import express from "express";
import dotenv from "dotenv";
import { v2 as cloudinary } from 'cloudinary';

import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";
import postRoutes from "./routes/post.route.js";

import dbConnection from "./DB/dbConnection.js";
import cookieParser from "cookie-parser";

// Load environment variables from .env file
dotenv.config();
cloudinary.config({
  cloud_name:process.env.CLOUD_NAME,
  api_key: process.env.CLOUDNARY_API_KEY, 
  api_secret: process.env.CLOUDNARY_API_SECRET 
})

// Create an Express application
const app = express();

// Set the port for the server to run on, defaulting to 5000 if not specified in environment
const Port = process.env.PORT || 5000;

// Middleware setup
app.use(cookieParser()); // Parse Cookie header and populate req.cookies
app.use(express.json()); // Parse JSON bodies of requests
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies (as sent by HTML forms)

// Routes
app.use("/api/auth", authRoutes); // Mount the authentication routes at /api/auth
app.use("/api/user", userRoutes);
app.use("/api/post", postRoutes);

// Start the server
app.listen(Port, () => {
  console.log(`Server is running at http://localhost:${Port}`);
  dbConnection(); // Establish database connection when server starts
});