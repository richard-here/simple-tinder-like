import { Router } from 'express'
import AuthController from '~/controllers/auth.controller'
import { validateRequest } from '~/middlewares'
import catchAsyncErrors from '~/utils/catchAsyncErrors'
import AuthValidator from '~/validators/auth.validator'

const router = Router()

router.post('/register', validateRequest(AuthValidator.registerBodySchema), catchAsyncErrors(AuthController.register))
router.post('/login', validateRequest(AuthValidator.loginBodySchema), catchAsyncErrors(AuthController.login))

export default router
