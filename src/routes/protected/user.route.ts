import { Router } from 'express'
import { validateRequest } from '~/middlewares'
import { UserValidator } from '~/validators'
import UserController from '~/controllers/user.controller'
import catchAsyncErrors from '~/utils/catchAsyncErrors'

const router = Router()

const validatePathParams = validateRequest(UserValidator.pathParamsSchema, 'params')

router.get('/me', catchAsyncErrors(UserController.getMyProfile))
router.get('/:userId', validatePathParams, catchAsyncErrors(UserController.getProfile))
router.patch('/me', validateRequest(UserValidator.updateProfile), catchAsyncErrors(UserController.updateProfile))
router.post('/payment', catchAsyncErrors(UserController.markAsPaidUser))

export default router
