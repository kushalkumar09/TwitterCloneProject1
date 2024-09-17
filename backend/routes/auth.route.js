import express from "express";
const router = express.Router();
import { login, logout, signup } from "../controllers/auth_controller.js";


router.post("/signup", signup)

router.get("/login", login)

router.post("/logout", logout)

export default router;