import express from 'express'
import authRoute from './auth.route'

const router = express.Router({ mergeParams: true })
router.use('/', authRoute)

export default router
