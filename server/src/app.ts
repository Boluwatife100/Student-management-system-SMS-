import authRoutes from "./routes/authRoutes";
import { prisma } from "./lib/prisma";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import studentRoutes from "./routes/studentRoutes";

const app = express();
app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "Student Management System API is running!",
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "success",
    message: "API is healthy and running!",
  });
});

app.get("/api/health/db", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    res.json({
      status: "ok",
      message: "Database connection successful",
    });
  } catch (error) {
    console.error("Database connection failed:", error);

    res.status(500).json({
      status: "error",
      message: "Database connection failed",
    });
  }
});

app.get("/api/auth/me", (req, res) => {
  const authReq = req as AuthRequest;

  res.json({
    message: "You are authenticated",
    userId: authReq.userId,
  });
});

export default app;
