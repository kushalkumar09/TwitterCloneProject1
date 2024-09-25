import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";
import { v2 as cloudnary } from "cloudinary";

export const createPost = async (req, res) => {
  const { text } = req.body;
  let { img } = req.body;
  const currentUserId = req.user._id;
  try {
    const user = await User.findById(currentUserId);
    if (!user) {
      return res.status(404).json({ error: "User not Found" });
    }
    if (!text && !img) {
      return res.status(400).json({ error: "no text or image found" });
    }
    if (img) {
      const uploadedPostImage = await cloudnary.uploader.upload(img);
      img = uploadedPostImage.secure_url;
    }
    const newPost = new Post({
      user: user,
      text: text,
      img: img,
    });
    await newPost.save();
    return res.status(201).json(newPost);
  } catch (error) {
    console.log(`Error in create Post : ${error.message}`);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const deletePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const postToDelete = await Post.findById(postId);
    if (!postToDelete) {
      return res.status(404).json({ error: "Post not Found" });
    }

    //delete the post if you are the owner of the post
    const currentUserId = req.user._id.toString();
    const postUserId = postToDelete.user.toString();
    if (currentUserId !== postUserId) {
      return res
        .status(401)
        .json({ error: "You are not authorised to delete the post" });
    }
    //delete post from cloudnary
    if (postToDelete.img) {
      const imgId = postToDelete.img.split("/").pop().split(".")[0];
      await cloudnary.uploader.destroy(imgId);
    }
    //delte post from database
    await Post.findByIdAndDelete(postId);
    return res.status(200).json({ message: "Post Deleted Successfully..." });
  } catch (error) {
    console.log(`Error in Delete Post : ${error.message}`);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const commentOnPost = async (req, res) => {
  try {
    const { text } = req.body;
    const postId = req.params.id;
    const userId = req.user._id;
    if (!text) {
      return res.status(400).json({ error: "Text is required for comment" });
    }
    const post = await Post.findById(postId);
    if (!postId) {
      return res.status(404).json({ error: "Post not found." });
    }
    const comment = {
      user: userId,
      text: text,
    };
    post.comments.push(comment);
    await post.save();

    return res.status(200).json({ message: "Comment created successfully" });
  } catch (error) {
    console.log(`Error in CommentOnPost : ${error.message}`);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const likeUnlikePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user._id; // User ID should be an ObjectId
    const post = await Post.findById(postId);
    let message;

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const UsersLikedPost = Array.from(post.likes);

    // Finding the index of the userId in the likes array
    const indexToDelete = UsersLikedPost.findIndex((like) =>
      like.equals(userId)
    );

    if (indexToDelete !== -1) {
      // User has already liked the post, remove their like
      UsersLikedPost.splice(indexToDelete, 1); // Remove the liked user
      await User.updateOne({_id:userId},{$pull:{likedPosts:postId}})
      message="You disliked this post"

    } else {
      // User has not liked the post, add their like
      UsersLikedPost.push(userId); // Push the ObjectId userId
      await User.updateOne({_id: userId},{$push:{likedPosts:postId}})
      message="You liked this post"
    }

    // Update the post's likes
    post.likes = UsersLikedPost;
    await post.save(); // Save the changes
    const likeNotification = new Notification({
      from: userId,
      to: post.user,
      type: "like",
    });

    await likeNotification.save();
    return res.status(200).json({
      UsersLikedPost,
      message,
      likes: post.likes,
      likeNotification: likeNotification,
    });
  } catch (error) {
    console.error(`Error in likeUnlikePost: ${error.message}`);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate([
        { path: "user", select: "username fullName email profileImg coverImg" },
        { path: "comments.user", select: "username fullName" },
      ]);

    if (posts.length === 0) {
      return res.status(200).json([]);
    }
    return res.status(200).json(posts);
  } catch (error) {
    console.error(`Error in getAll Post: ${error.message}`);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getLikedPosts = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);
    if(!user){
      return res.status(404).json({error:"User Not Found"})
    }
    const likedPosts = await Post.find({_id:{$in:user.likedPosts}}).populate([
      { path: "user", select: "username fullName email profileImg coverImg" },
      { path: "comments.user", select: "username fullName" },
    ])

    return res.status(200).json(likedPosts);
  } catch (error) {
    console.error(`Error in getAll Post: ${error.message}`);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getFollowingPost = async (req,res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    if(!user){
      return res.status(404).json({error:"User not found"})
    }
    const following = user.following
    const feedPosts = await Post.find({user:{$in:following}}).sort({createdAt:-1}).populate([
      {path:"user",select:"-password"},
      {path:"comments.user",select:"-password"}
    ])
    return res.status(200).json(feedPosts);
  } catch (error) {
    console.error(`Error in getAll Post: ${error.message}`);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
export const getUserPosts = async (req,res) => {
  try {
    const {username} = req.params;
    const user = await User.findOne({username});
    if(!user){
      return res.status(404).json({error:"User not found"})
    }

    const userPosts = await Post.find({user:user._id}).sort({createdAt:-1}).populate([
      {path:"user",select:"-password"},
      {path:"comments.user",select:"-password"}
    ])
    return res.status(200).json(userPosts);
  } catch (error) {
    console.error(`Error in User Post: ${error.message}`);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
