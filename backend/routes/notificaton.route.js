import express from "express";
import { protectedRoute } from "../middlewares/protectedRoute.js";
import { deleteAllNotifications, getAllNotifications } from "../controllers/notification_controller.js";


const router = express.Router();

router.get("/", protectedRoute, getAllNotifications);
router.delete("/", protectedRoute, deleteAllNotifications);


export default router;
