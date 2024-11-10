import { Request, Response } from 'express'

function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).send({
    status: 'fail',
    data: {
      message: 'Not found route',
    },
  })
}

export default notFoundHandler
