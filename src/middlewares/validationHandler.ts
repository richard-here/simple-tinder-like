import { Request, Response, NextFunction } from 'express'
import { ObjectSchema } from 'joi'

const validateRequest =
  (schema: ObjectSchema, property: 'body' | 'query' | 'params' = 'body') =>
  (req: Request, res: Response, next: NextFunction): void => {
    const { error } = schema.validate(req[property])
    if (error) {
      res.status(400).send({
        status: 'error',
        data: {
          code: 'ValidationError',
          message: 'Invalid input',
          errors: error.details
        }
      })
    } else {
      next()
    }
  }

export default validateRequest
