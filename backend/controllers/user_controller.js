import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";
import bcrypt from "bcryptjs";
import { v2 as cloudnary } from "cloudinary";

export const getUserProfile = async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username }).select("-password");
    if (!user) {
      res.status(401).json({ error: "User Not Fount" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.log("Error in getUserProfile");
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const followUnfollowUsers = async (req, res) => {
  try {
    const { id } = req.params;

    const userToFollow = await User.findById(id).select("-password");
    const currentUser = await User.findById(req.user._id).select("-password");

    if (!userToFollow || !currentUser) {
      return res.status(404).json({ error: "User Not Found" });
    }

    if (id === req.user._id.toString()) {
      return res
        .status(401)
        .json({ error: "You can't Follow or Unfollow Yourself" });
    }

    const isFollowing = currentUser.following.includes(id);

    if (isFollowing) {
      // Unfollow user
      await User.findByIdAndUpdate(id, { $pull: { followers: req.user._id } });
      await User.findByIdAndUpdate(req.user._id, { $pull: { following: id } });
      return res
        .status(200)
        .json({ message: "User Unfollowed Successfully..." });
    } else {
      // Follow user
      await User.findByIdAndUpdate(id, { $push: { followers: req.user._id } });
      await User.findByIdAndUpdate(req.user._id, { $push: { following: id } });

      // notification
      const followNotification = new Notification({
        type: "follow",
        from: req.user._id,
        to: id,
      });

      await followNotification.save();
      return res.status(200).json({ message: "User Followed Successfully..." });
    }
  } catch (error) {
    console.error("Error in followUnfollowUsers:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getSuggestedUsers = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const users = await User.aggregate([
      { $match: { _id: { $ne: currentUserId } } },
      { $sample: { size: 10 } },
    ]);
    // filter out the users which are not in the following of the current user
    const currentUserFollowing = await User.findById(currentUserId).select(
      "following"
    );
    const followedUsersId = currentUserFollowing.following || [];
    const filteredUsers = users.filter(
      (user) => !followedUsersId.includes(user._id.toString())
    );
    const suggestedUsers = filteredUsers
      .slice(0, 5)
      .map((user) =>{
        return { ...user, password: null }; // Set password to null
      });
    res.status(200).json(suggestedUsers);
  } catch (error) {
    console.log("Error in getSuggestedUsers");
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const updateUserProfile = async (req,res) =>{
  try {
    const {username,newPassword,currentPassword,fullName,email,bio,link} = req.body
    let {profileImg,coverImg}=req.body
    const currentUserId = req.user._id;
    let user = await User.findById(currentUserId);
    if(!user){
      return res.status(404).json({message:"User Not Found"})
    }
    if((!currentPassword&&newPassword)||(!newPassword&&currentPassword)){
     return res.status(400).json({error:"please provide both current and new password to update"})
    }
    if (currentPassword && newPassword) {
      const isMatch = await bcrypt.compare(currentPassword,user.password)
      if(!isMatch){
        return res.status(400).json({error:"Your current password is not correct"})
      }
      if (newPassword.length() < 6) {
        return res
          .status(401)
          .json({ error: "Password length should be greater than 6" });
      }
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword,salt);
    }
    if(profileImg){
      if(user.profileImg){
        //destroy the current image
        await cloudnary.uploader.destroy(user.profileImg.split("/").pop().split(".")[0])
      }
      const uploadedImage = await cloudnary.uploader.upload(profileImg);
      profileImg = uploadedImage.secure_url;
    }
    if(coverImg){
      if(user.coverImg){
        //destroy the current image
        await cloudnary.uploader.destroy(user.coverImg.split("/").pop().split(".")[0])
      }
      const uploadedImage = await cloudnary.uploader.upload(coverImg);
      coverImg = uploadedImage.secure_url;
    }

    user.fullName = fullName || user.fullName;
    user.username = username || user.username;
    user.email = email || user.email;
    user.bio = bio || user.bio;
    user.link = link || user.link;
    user.profileImg = profileImg || user.profileImg;
    user.coverImg = coverImg || user.coverImg;

    user = await user.save();

    user.password = null;
    return res.status(200).json({user})
    
  }catch (error) {
    console.log("Error in UpdateUserProfile");
    return res.status(500).json({error:"Internal Server Error"})
  }
}