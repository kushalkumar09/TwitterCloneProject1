import express from "express";
import { protectedRoute } from "../middlewares/protectedRoute.js";
import { commentOnPost, createPost, deletePost, getAllPosts, getFollowingPost, getLikedPosts, getUserPosts, likeUnlikePost } from "../controllers/post_controller.js";


const router = express.Router();

router.get("/all",protectedRoute,getAllPosts);
router.get("/user/:username",protectedRoute,getUserPosts);
router.get("/likes/:id",protectedRoute,getLikedPosts);
router.get("/following",protectedRoute,getFollowingPost);
router.post("/create",protectedRoute,createPost);
router.post("/like/:id",protectedRoute,likeUnlikePost);
router.post("/comment/:id",protectedRoute,commentOnPost);
router.delete("/:id",protectedRoute,deletePost);
export default router;