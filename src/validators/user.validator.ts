import Joi from 'joi'
import { USER } from '~/constants/user.constants'

class UserValidator {
  static pathParamsSchema = Joi.object({
    userId: Joi.string().hex().length(24)
  })

  static #interests = Joi.array().items(Joi.string().valid(...Object.values(USER.CATEGORIZED_INTERESTS).map((interest => interest.interest)))).min(0).max(100)
  static #genders = Joi.string().valid(...USER.GENDERS)

  static updateProfile = Joi.object({
    name: Joi.string().min(3).max(100),
    profileSummary: Joi.string().min(0).max(1000),
    addInterests: UserValidator.#interests,
    removeInterests: UserValidator.#interests,
    gender: UserValidator.#genders,
    matchGenderInterest: UserValidator.#genders
  })
    .min(1)
}

export default UserValidator