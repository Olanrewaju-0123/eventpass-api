import { Router, Request, Response } from "express";
import { prisma } from "../config/database";
import { CryptoUtils } from "../utils/crypto";
import { HttpResponse } from "../utils/http";
import { asyncHandler } from "../middleware/error";

const router = Router();

/**
 * Create admin user (temporary endpoint for setup)
 * Remove this after creating your admin user
 */
router.post("/create-admin", asyncHandler(async (req: Request, res: Response) => {
  const { email, password, firstName, lastName } = req.body;

  if (!email || !password || !firstName || !lastName) {
    return HttpResponse.badRequest(res, "Email, password, firstName, and lastName are required");
  }

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (existingUser) {
    // Update existing user to admin
    const hashedPassword = await CryptoUtils.hashPassword(password);
    const updatedUser = await prisma.user.update({
      where: { email },
      data: {
        password: hashedPassword,
        firstName,
        lastName,
        role: "ADMIN",
        isActive: true,
        isEmailVerified: true
      }
    });

    return HttpResponse.success(res, "User updated to admin successfully", {
      id: updatedUser.id,
      email: updatedUser.email,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      role: updatedUser.role
    });
  }

  // Create new admin user
  const hashedPassword = await CryptoUtils.hashPassword(password);
  const newAdmin = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role: "ADMIN",
      isActive: true,
      isEmailVerified: true
    }
  });

  return HttpResponse.success(res, "Admin user created successfully", {
    id: newAdmin.id,
    email: newAdmin.email,
    firstName: newAdmin.firstName,
    lastName: newAdmin.lastName,
    role: newAdmin.role
  });
}));

export { router as createAdminRoutes };
