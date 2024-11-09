import { Request, Response, NextFunction } from 'express'
import { ServiceException } from '../errors'

/**
 * Middleware to handle errors.
 */
async function errorHandler(
  err: Error, 
  _req: Request, 
  res: Response, 
  _next: NextFunction
): Promise<void> {
  if (err instanceof ServiceException) {
    const { status, body } = err.toResponse()

    res.status(status).send({
      status: 'fail',
      data: {
        ...body,
      },
    })

    return
  }

  res.status(500).send({
    status: 'error',
    data: {
      code: 'InternalServerError',
      message: err.message,
      errors: err
    },
  })
}

export default errorHandler
