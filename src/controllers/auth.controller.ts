import { Request, Response } from 'express'
import { authService } from '~/services'

class AuthController {
  static async login(req: Request, res: Response) {
    res.send('Login route')
  }

  static async register(req: Request, res: Response) {
    const { email, password } = req.body
    const user = await authService.register({ email, password })
    res.send(user)
  }
}

export default AuthController