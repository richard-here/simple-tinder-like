import Joi from 'joi'

class AuthValidator {
  static loginBodySchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  })

  static registerBodySchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  })
}

export default AuthValidator