import type { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config/env";
import { HttpResponse } from "../utils/http";
import { prisma } from "../config/database";
import type { AuthenticatedRequest, JWTPayload } from "../types";

export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

    if (!token) {
      return HttpResponse.unauthorized(res, "Access token required");
    }

    const decoded = jwt.verify(token, config.JWT_SECRET) as JWTPayload;

    // Verify user still exists and is active
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, role: true, isActive: true },
    });

    if (!user || !user.isActive) {
      return HttpResponse.unauthorized(res, "Invalid or expired token");
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return HttpResponse.unauthorized(res, "Invalid token");
    }
    if (error instanceof jwt.TokenExpiredError) {
      return HttpResponse.unauthorized(res, "Token expired");
    }
    return HttpResponse.internalError(res, "Authentication failed");
  }
};

export const requireRole = (roles: string[]) => {
  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): any => {
    if (!req.user) {
      return HttpResponse.unauthorized(res, "Authentication required");
    }

    if (!roles.includes(req.user.role)) {
      return HttpResponse.forbidden(res, "Insufficient permissions");
    }

    next();
  };
};

export const requireAdmin = requireRole(["ADMIN"]);
export const requireOrganizer = requireRole(["ADMIN", "ORGANIZER"]);
