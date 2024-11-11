import express from 'express'
import userRoute from './user.route'
import matchRoute from './match.route'

const router = express.Router({ mergeParams: true })
router.use('/users', userRoute)
router.use('/', matchRoute)

export default router
