import type { Response } from "express"
import type { ApiResponse, PaginatedResponse } from "../types"

export class HttpResponse {
  /**
   * Send success response
   */
  static success<T>(res: Response, message = "Success", data?: T, statusCode = 200): Response<ApiResponse<T>> {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
    })
  }

  /**
   * Send error response
   */
  static error(res: Response, message = "An error occurred", statusCode = 500, error?: string): Response<ApiResponse> {
    return res.status(statusCode).json({
      success: false,
      message,
      error,
    })
  }

  /**
   * Send validation error response
   */
  static validationError(
    res: Response,
    message = "Validation failed",
    errors: Record<string, string[]>,
  ): Response<ApiResponse> {
    return res.status(400).json({
      success: false,
      message,
      errors,
    })
  }

  /**
   * Send paginated response
   */
  static paginated<T>(
    res: Response,
    data: T[],
    page: number,
    limit: number,
    total: number,
    message = "Success",
  ): Response<PaginatedResponse<T>> {
    const totalPages = Math.ceil(total / limit)
    const hasNext = page < totalPages
    const hasPrev = page > 1

    return res.status(200).json({
      success: true,
      message,
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext,
        hasPrev,
      },
    })
  }

  /**
   * Send not found response
   */
  static notFound(res: Response, message = "Resource not found"): Response<ApiResponse> {
    return this.error(res, message, 404)
  }

  /**
   * Send unauthorized response
   */
  static unauthorized(res: Response, message = "Unauthorized"): Response<ApiResponse> {
    return this.error(res, message, 401)
  }

  /**
   * Send forbidden response
   */
  static forbidden(res: Response, message = "Forbidden"): Response<ApiResponse> {
    return this.error(res, message, 403)
  }

  /**
   * Send bad request response
   */
  static badRequest(res: Response, message = "Bad request"): Response<ApiResponse> {
    return this.error(res, message, 400)
  }

  /**
   * Send conflict response
   */
  static conflict(res: Response, message = "Conflict"): Response<ApiResponse> {
    return this.error(res, message, 409)
  }

  /**
   * Send internal server error response
   */
  static internalError(res: Response, message = "Internal server error"): Response<ApiResponse> {
    return this.error(res, message, 500)
  }
}
