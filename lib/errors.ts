// lib/errors.ts
/**
 * Centralized error handling utilities
 */

export class AppError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'AppError';
  }
}

/**
 * Convert various error types to user-friendly messages
 */
export function getErrorMessage(error: unknown): string {
  // Network errors
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return 'Network error. Please check your connection and try again.';
  }

  // App errors
  if (error instanceof AppError) {
    return error.message;
  }

  // Standard errors
  if (error instanceof Error) {
    // Common error patterns
    if (error.message.includes('duplicate')) {
      return 'This item already exists.';
    }
    if (error.message.includes('not found')) {
      return 'Item not found.';
    }
    if (error.message.includes('unauthorized') || error.message.includes('auth')) {
      return 'You are not authorized to perform this action.';
    }
    if (error.message.includes('network')) {
      return 'Network error. Please try again.';
    }
    
    return error.message;
  }

  // Unknown errors
  return 'An unexpected error occurred. Please try again.';
}

/**
 * API error response handler
 */
export function handleApiError(error: unknown) {
  const message = getErrorMessage(error);
  const statusCode = error instanceof AppError ? error.statusCode : 500;
  
  return {
    error: message,
    code: error instanceof AppError ? error.code : 'UNKNOWN_ERROR',
    statusCode,
  };
}

/**
 * Common error messages
 */
export const ErrorMessages = {
  NETWORK: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You need to be logged in to do this.',
  FORBIDDEN: 'You don\'t have permission to do this.',
  NOT_FOUND: 'The item you\'re looking for doesn\'t exist.',
  VALIDATION: 'Please check your input and try again.',
  SERVER: 'Something went wrong on our end. Please try again.',
  UNKNOWN: 'An unexpected error occurred.',
} as const;
