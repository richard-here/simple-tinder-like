import Joi from 'joi'
import { USER } from '~/constants/user.constants'

class UserValidator {
  static pathParamsSchema = Joi.object({
    userId: Joi.string().hex().length(24)
  })

  static #interests = Joi.array().items(Joi.string().valid(...Object.values(USER.CATEGORIZED_INTERESTS).map((interest => interest.interest)))).min(1).max(100)

  static updateProfile = Joi.object({
    name: Joi.string().min(3).max(100),
    profileSummary: Joi.string().min(0).max(1000),
    addInterests: UserValidator.#interests,
    removeInterests: UserValidator.#interests,
  })
    .min(1)
}

export default UserValidator