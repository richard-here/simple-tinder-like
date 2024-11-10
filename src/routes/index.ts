import express from 'express'
import publicRoute from './public'

const router = express.Router({ mergeParams: true })
router.use('/', publicRoute)

export default router
