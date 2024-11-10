import { Request, Response } from 'express'
import { authService } from '~/services'

class AuthController {
  static async login(req: Request, res: Response) {
    const { email, password } = req.body
    const token = await authService.login({ email, password })
    res.status(200).send({
      status: 'success',
      data: token
    })
  }

  static async register(req: Request, res: Response) {
    const { email, password } = req.body
    const user = await authService.register({ email, password })
    res.status(201).send({
      status: 'success',
      data: user
    })
  }
}

export default AuthController