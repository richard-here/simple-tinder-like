import { Router } from 'express'
import AuthController from '~/controllers/auth.controller'
import { validateRequest } from '~/middlewares'
import AuthValidator from '~/validators/auth.validator'

const router = Router()

router.post('/register', validateRequest(AuthValidator.registerBodySchema), AuthController.register)
router.post('/login', validateRequest(AuthValidator.loginBodySchema), AuthController.login)

export default router
