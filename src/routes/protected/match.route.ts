import { Router } from 'express'
import MatchController from '~/controllers/match.controller'
import { validateRequest } from '~/middlewares'
import catchAsyncErrors from '~/utils/catchAsyncErrors'
import { MatchValidator } from '~/validators'

const router = Router()

const validatePathParams = validateRequest(MatchValidator.pathParamsSchema, 'params')

router.get('/potential-matches', catchAsyncErrors(MatchController.getPotentialMatches))
router.get('/matches/:matchId', validatePathParams, catchAsyncErrors(MatchController.getMatchById))
router.get('/matches', catchAsyncErrors(MatchController.getMatches))
router.patch('/matches/:matchId', validatePathParams, validateRequest(MatchValidator.updateMatchBodySchema, 'body'), catchAsyncErrors(MatchController.updateMatch))

export default router
