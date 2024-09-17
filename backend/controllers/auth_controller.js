import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import { generateTokenAndSetCookie } from "../lib/utils/generateToken.js";
import jwt from "jsonwebtoken";


export const signup = async (req, res) => {
    try {
        const { username, fullName, email, password } = req.body;
        console.log("Body Here")
        console.log(username + fullName + email + password);
        const emailRegex = /^\S+@\S+\.\S+$/
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: "Invalid email Format." })
        }

        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({
                error: "User already exists",
            })
        }
        console.log(existingUser)
        const existingEmail = await User.findOne({
            email
        })
        console.log(existingEmail)
        if (existingEmail) {
            return res.status(400).json({
                error: "Email already exists",
            })
        }

        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password, salt);
        console.log(hashPassword)
        const newUser = User(
            {
                email: email,
                password: hashPassword,
                fullName: fullName,
                username: username
            }
        )
        console.log(newUser);
        if (newUser) {
            await newUser.save();
            const user = {
                _id: newUser._id,
                fullName: newUser.fullName,
                username: newUser.username,
                email: newUser.email,
                profileImg: newUser.profileImg,
                coverImg: newUser.coverImg,
                following: newUser.following,
                followers: newUser.followers,
            }
            generateTokenAndSetCookie(user, res);
            console.log("Saved user")
            res.status(201).json({
                _id: newUser._id,
                fullName: newUser.fullName,
                username: newUser.username,
                email: newUser.email,
                profileImg: newUser.profileImg,
                coverImg: newUser.coverImg,
                following: newUser.following,
                followers: newUser.followers,
            })
        } else {
            res.status(400).json({
                error: "Invalid User Data"
            })
        }
    } catch (error) {
        res.status(500).json({
            error: "Internal Server Error",
        })
    }
}


export const login = async (req, res) => {
    const { jwt: token } = req.cookies
    const decodedJwt = jwt.verify(token, process.env.JWT_SECRET)
    res.status(200).json({
        data: "Your end point"
    })
}
export const logout = async (req, res) => {
    res.json({
        data: "Your end point"

    })
}

export default login;