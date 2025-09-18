import type { Request, Response, NextFunction } from "express"
import { HttpResponse } from "../utils/http"
import { config } from "../config/env"

export interface AppError extends Error {
  statusCode?: number
  isOperational?: boolean
}

export const errorHandler = (error: AppError, req: Request, res: Response, next: NextFunction) => {
  let { statusCode = 500, message } = error

  // Log error in development
  if (config.isDevelopment) {
    console.error("Error:", error)
  }

  // Prisma errors
  if (error.name === "PrismaClientKnownRequestError") {
    const prismaError = error as any
    if (prismaError.code === "P2002") {
      statusCode = 409
      message = "Resource already exists"
    } else if (prismaError.code === "P2025") {
      statusCode = 404
      message = "Resource not found"
    }
  }

  // JWT errors
  if (error.name === "JsonWebTokenError") {
    statusCode = 401
    message = "Invalid token"
  }

  if (error.name === "TokenExpiredError") {
    statusCode = 401
    message = "Token expired"
  }

  // Validation errors
  if (error.name === "ValidationError") {
    statusCode = 400
    message = "Validation failed"
  }

  // Don't leak error details in production
  if (config.isProduction && statusCode === 500) {
    message = "Internal server error"
  }

  return HttpResponse.error(res, message, statusCode, config.isDevelopment ? error.stack : undefined)
}

export const notFound = (req: Request, res: Response, next: NextFunction) => {
  const error: AppError = new Error(`Route ${req.originalUrl} not found`)
  error.statusCode = 404
  error.isOperational = true
  next(error)
}

export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}
