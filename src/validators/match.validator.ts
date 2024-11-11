import Joi from 'joi'
import { MATCH } from '~/constants/match.constants'

class MatchValidator {
  static pathParamsSchema = Joi.object({
    matchId: Joi.string().hex().length(24)
  })

  static updateMatchBodySchema = Joi.object({
    status: Joi.string().valid(...Object.values(MATCH.STATUS)).required()
  })
}

export default MatchValidator