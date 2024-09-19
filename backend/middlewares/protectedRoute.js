import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const protectedRoute = async (req, res, next) => {
    try {
        const token = req.cookies.jwt;

        if (!token) {
            return res.status(401).json({ error: "Unauthorized: No Token Provided" });
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            const user = await User.findById(decoded.userId).select("-password");
            
            if (!user) {
                return res.status(401).json({ error: "Unauthorized: User not found" });
            }

            req.user = user;
            next();
        } catch (jwtError) {
            console.error('JWT verification error:', jwtError);
            return res.status(401).json({ error: "Unauthorized: Invalid Token" });
        }
    } catch (error) {
        console.error("Error in Protected Routes:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};