import { USER } from "~/constants/user.constants"
import { ServiceException } from "~/errors"
import { Profile } from "~/interfaces/profile.interface"
import User from "~/models/user.model"

class UserService {
  private userModel: typeof User

  private calculateScores(interests: string[]): Map<string, number> {
    const scores = new Map<string, number>([
      ["luxury", 0],
      ["creative", 0],
      ["intellectual", 0],
      ["social", 0],
      ["adventurous", 0]
    ])

    interests.forEach(interest => {
      const categoryInterest = USER.CATEGORIZED_INTERESTS.find(ci => ci.interest === interest)
      if (categoryInterest) {
        const currentScore = scores.get(categoryInterest.category) || 0
        scores.set(categoryInterest.category, currentScore + categoryInterest.score)
      }
    })

    return scores
  }

  constructor({ userModel }: { userModel: typeof User }) {
    this.userModel = userModel
  }

  getProfile = async ({ userId }: { userId: string }) => {
    const user = await this.userModel.findById(userId).select('-scores')
    if (!user) {
      throw new ServiceException({
        type: 'not-found',
        code: 'services/user/getMyProfile',
        message: 'User not found'
      })
    }
    return user
  }

  updateProfile = async ({
    userId,
    profile
  }: {
    userId: string
    profile: Partial<Profile>
  }) => {
    const user = await this.userModel.findByIdAndUpdate(
      userId,
      {
        ...(profile.name && { name: profile.name }),
        ...(profile.profileSummary && { profileSummary: profile.profileSummary }),
      },
      { new: true}
    ).exec()

    if (!user) {
      throw new ServiceException({
        type: 'not-found',
        code: 'services/user/updateProfile',
        message: 'User not found'
      })
    }

    const interests = new Set(user.interests ?? [])
    if (profile.addInterests) {
      profile.addInterests.forEach(interest => interests.add(interest))
    }
    if (profile.removeInterests) {
      profile.removeInterests.forEach(interest => interests.delete(interest))
    }
    user.interests = Array.from(interests)

    if ((profile.addInterests || profile.removeInterests)) {
      user.scores = this.calculateScores(user.interests ?? [])
      await user.save()
    }

    const { scores, ...updatedUser } = user.toObject()
    return updatedUser
  }
}

export default UserService