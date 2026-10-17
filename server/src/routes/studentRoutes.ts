
import { Router } from "express";
import { Prisma } from "../generated/prisma/client";
import { z } from "zod";
import { prisma } from "../lib/prisma";

const router = Router();

// Validation for creating a student
const createStudentSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required"),
  lastName: z.string().trim().min(1, "Last name is required"),
  email: z.string().trim().email("Enter a valid email address"),
  phone: z.string().trim().nullable().optional(),
  course: z.string().trim().min(1, "Course is required"),
  status: z.string().trim().min(1).optional(),
});

// Validation for updating a student
const updateStudentSchema = createStudentSchema
  .partial()
  .refine(
    (data) => Object.keys(data).length > 0,
    "Provide at least one field to update"
  );

// Helper for Prisma errors
function handleDatabaseError(error: unknown, res: any) {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  ) {
    res.status(409).json({
      message: "A student with this email already exists",
    });
    return;
  }

  console.error("Student API error:", error);

  res.status(500).json({
    message: "An unexpected server error occurred",
  });
}

// 1. GET ALL STUDENTS
router.get("/", async (_req, res) => {
  try {
    const students = await prisma.student.findMany({
      orderBy: { createdAt: "desc" },
    });

    res.json({
      message: "Students retrieved successfully",
      count: students.length,
      students,
    });
  } catch (error) {
    handleDatabaseError(error, res);
  }
});

// 2. GET ONE STUDENT
router.get("/:id", async (req, res) => {
  try {
    const id = req.params.id;

    const student = await prisma.student.findUnique({
      where: { id },
    });

    if (!student) {
      res.status(404).json({ message: "Student not found" });
      return;
    }

    res.json({
      message: "Student retrieved successfully",
      student,
    });
  } catch (error) {
    handleDatabaseError(error, res);
  }
});

// 3. CREATE A STUDENT
router.post("/", async (req, res) => {
  const parsed = createStudentSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({
      message: "Invalid student details",
      errors: parsed.error.flatten().fieldErrors,
    });
    return;
  }

  try {
    const data = parsed.data;

    const student = await prisma.student.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email.toLowerCase(),
        phone: data.phone,
        course: data.course,
        ...(data.status ? { status: data.status } : {}),
      },
    });

    res.status(201).json({
      message: "Student created successfully",
      student,
    });
  } catch (error) {
    handleDatabaseError(error, res);
  }
});

// 4. UPDATE A STUDENT
router.patch("/:id", async (req, res) => {
  const parsed = updateStudentSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({
      message: "Invalid student details",
      errors: parsed.error.flatten().fieldErrors,
    });
    return;
  }

  try {
    const id = req.params.id;
    const data = parsed.data;

    const student = await prisma.student.update({
      where: { id },
      data: {
        ...data,
        ...(data.email
          ? { email: data.email.toLowerCase() }
          : {}),
      },
    });

    res.json({
      message: "Student updated successfully",
      student,
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      res.status(404).json({ message: "Student not found" });
      return;
    }

    handleDatabaseError(error, res);
  }
});

// 5. DELETE A STUDENT
router.delete("/:id", async (req, res) => {
  try {
    const id = req.params.id;

    await prisma.student.delete({
      where: { id },
    });

    res.json({
      message: "Student deleted successfully",
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      res.status(404).json({ message: "Student not found" });
      return;
    }

    handleDatabaseError(error, res);
  }
});

export default router;
