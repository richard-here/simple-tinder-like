import { logger } from 'firebase-functions/v1'
import invariant from 'tiny-invariant'

const ERROR_TYPE = ['server', 'user', 'not-found', 'permission'] as const

// Type for the valid error types
type ErrorType = typeof ERROR_TYPE[number]

/**
 * Get HTTP status code based on error type
 */
function getErrorTypeStatusCode(type: ErrorType): number {
  if (type === 'server') return 500
  if (type === 'user') return 400
  if (type === 'permission') return 401
  if (type === 'not-found') return 404

  // default fallback to 500 error
  return 500
}

/**
 * Extended Error class to be thrown upon service exception
 */
class ServiceException extends Error {
  type: ErrorType
  code: string

  constructor(params: {
    type: ErrorType
    code: string
    message: string
  }) {
    const { type, code, message } = params

    // Ensure the error type is valid
    invariant(ERROR_TYPE.includes(type), 'Invalid ServiceException error type')
    invariant(code, 'ServiceException error code is required!')
    invariant(message, 'ServiceException error message is required!')
    
    super(message)

    this.name = 'ServiceException'
    this.type = type
    this.code = code
  }

  /**
   * Converts the error to a response object
   */
  toResponse(): { status: number; body: { code: string; message: string } } {
    return {
      status: getErrorTypeStatusCode(this.type),
      body: {
        code: this.code,
        message: this.message
      }
    }
  }
}

export { ServiceException }
