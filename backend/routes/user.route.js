import express from "express";
import { protectedRoute } from "../middlewares/protectedRoute.js";
import { followUnfollowUsers, getSuggestedUsers, getUserProfile, updateUserProfile } from "../controllers/user_controller.js";

const router = express.Router();

//User routes
router.get("/profile/:username", protectedRoute, getUserProfile);
router.get("/suggested", protectedRoute, getSuggestedUsers);
router.post("/follow/:id", protectedRoute, followUnfollowUsers);
router.post("/update", protectedRoute, updateUserProfile);

export default router;
