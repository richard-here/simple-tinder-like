import express from 'express'
import userRoute from './user.route'

const router = express.Router({ mergeParams: true })
router.use('/users', userRoute)

export default router
