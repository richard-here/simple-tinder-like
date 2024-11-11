import { Request, Response } from 'express'
import { userService } from '~/services'

class UserController {
  static async getMyProfile(req: Request, res: Response) {
    const user = req.user
    const userId = user?.customClaims?.dbUserId

    const profile = await userService.getProfile({ userId })
    res.status(200).send({
      status: 'success',
      data: profile
    })
  }

  static async getProfile(req: Request, res: Response) {
    const { userId } = req.params
    const profile = await userService.getProfile({ userId })
    res.status(200).send({
      status: 'success',
      data: profile
    })
  }

  static async updateProfile(req: Request, res: Response) {
    const user = req.user
    const userId = user?.customClaims?.dbUserId

    const updatedProfile = await userService.updateProfile({ userId, profile: req.body })
    res.status(200).send({
      status: 'success',
      data: updatedProfile
    })
  }

  static async markAsPaidUser(req: Request, res: Response) {
    const user = req.user
    const userId = user?.customClaims?.dbUserId

    const updatedProfile = await userService.markAsPaidUser({ userId })
    res.status(200).send({
      status: 'success',
      data: updatedProfile
    })
  }
}

export default UserController