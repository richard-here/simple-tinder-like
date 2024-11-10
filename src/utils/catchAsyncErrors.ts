import { Request, Response, NextFunction, RequestHandler } from 'express'

const catchAsyncErrors = (fn: RequestHandler): RequestHandler => 
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await fn(req, res, next)
    } catch (err) {
      next(err)
    }
  }

export default catchAsyncErrors
