import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import { generateTokenAndSetCookie } from "../lib/utils/generateToken.js";

/**
 * Authentication Controller
 * 
 * This controller handles user authentication using JSON Web Tokens (JWT).
 * 
 * JWT Concept:
 * - JWT is a compact, URL-safe means of representing claims to be transferred between two parties.
 * - It consists of three parts: Header, Payload, and Signature.
 * - The server generates a token upon successful authentication and sends it to the client.
 * - The client includes this token in the header of subsequent requests to access protected routes.
 * - The server verifies the token to authenticate the user for each protected request.
 */

/**
 * User Signup
 * 
 * Creates a new user account and generates a JWT token upon successful registration.
 */
export const signup = async (req, res) => {
  try {
    const { username, fullName, email, password } = req.body;

    // Validate email format
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format." });
    }

    // Check if username or email already exists
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json({
        error: existingUser.username === username ? "Username already exists" : "Email already exists",
      });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = new User({
      email,
      password: hashPassword,
      fullName,
      username,
    });

    await newUser.save();

    // Generate JWT token and set as HTTP-only cookie
    generateTokenAndSetCookie(newUser._id, res);

    // Send user data (excluding password) as response
    res.status(201).json({
      _id: newUser._id,
      fullName: newUser.fullName,
      username: newUser.username,
      email: newUser.email,
      profileImg: newUser.profileImg,
      coverImg: newUser.coverImg,
      following: newUser.following,
      followers: newUser.followers,
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

/**
 * User Login
 * 
 * Authenticates a user and generates a JWT token upon successful login.
 */
export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find user by username
    const user = await User.findOne({ username });

    // Verify user existence and password
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid Username or Password" });
    }

    // Generate JWT token and set as HTTP-only cookie
    generateTokenAndSetCookie(user._id, res);

    // Send user data (excluding password) as response
    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      username: user.username,
      email: user.email,
      profileImg: user.profileImg,
      coverImg: user.coverImg,
      following: user.following,
      followers: user.followers,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

/**
 * User Logout
 * 
 * Logs out the user by clearing the JWT token cookie.
 */
export const logout = async (req, res) => {
  try {
    // Clear the JWT cookie by setting its maxAge to 0
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Logout Successful" });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

/**
 * Get Current User
 * 
 * Retrieves the current user's data based on the JWT token in the request.
 * This route is typically protected and requires a valid JWT token.
 */
export const getMe = async (req, res) => {
  try {
    // req.user is set by the authentication middleware after verifying the JWT token
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error("Error in getMe controller:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};