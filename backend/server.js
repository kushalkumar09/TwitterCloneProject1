import express from "express";
import authRoutes from "./routes/auth.route.js";
import dotenv from "dotenv";
import dbConnection from "./DB/dbConnection.js";
import cookieParser from "cookie-parser";
dotenv.config()

const app = express();
const Port = process.env.PORT || 5000
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }))
app.use("/api/auth", authRoutes);

app.listen(Port, () => {
  console.log(`App is running at ${Port}`);
  dbConnection();
});
