import express from 'express'
import publicRoute from './public'
import protectedRoute from './protected'
import { authenticate } from '~/middlewares'
import catchAsyncErrors from '~/utils/catchAsyncErrors'

const router = express.Router({ mergeParams: true })
router.use('/', publicRoute)
router.use('/', catchAsyncErrors(authenticate), protectedRoute)

export default router
