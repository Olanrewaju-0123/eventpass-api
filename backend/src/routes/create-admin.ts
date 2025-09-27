import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { HttpResponse } from "../utils/http";
import { asyncHandler } from "../middleware/error";
import { body, validationResult } from "express-validator";

const router = Router();
const prisma = new PrismaClient();

router.post(
  "/create-admin",
  [
    body("email").isEmail().normalizeEmail().withMessage("Valid email is required"),
    body("password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters")
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage(
        "Password must contain at least one uppercase letter, one lowercase letter, and one number"
      ),
    body("firstName").trim().notEmpty().withMessage("First name is required"),
    body("lastName").trim().notEmpty().withMessage("Last name is required"),
  ],
  asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMap: Record<string, string[]> = {};
      errors.array().forEach((error) => {
        if (error.type === 'field') {
          const field = error.path;
          if (!errorMap[field]) {
            errorMap[field] = [];
          }
          errorMap[field].push(error.msg);
        }
      });
      return HttpResponse.validationError(res, "Validation failed", errorMap);
    }

    const { email, password, firstName, lastName } = req.body;

    try {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return HttpResponse.conflict(res, "User already exists with this email");
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create admin user
      const adminUser = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          firstName,
          lastName,
          role: "ADMIN",
          isActive: true,
          isEmailVerified: true,
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
          isEmailVerified: true,
          createdAt: true,
        },
      });

      return HttpResponse.success(res, "Admin user created successfully", adminUser, 201);
    } catch (error: any) {
      console.error("Error creating admin user:", error);
      return HttpResponse.internalError(res, "Failed to create admin user");
    }
  })
);

export { router as createAdminRoutes };
