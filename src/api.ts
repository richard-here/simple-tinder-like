import express from 'express'
import cors from 'cors'

import { errorHandler, notFoundHandler } from '~/middlewares'

const app = express()

// Use CORS middleware
app.use(cors({ origin: true }))

// Set default transfer data type to JSON
app.use(express.json())

const routes = null
// Define routes
app.use('/', routes)

// Error handling middlewares
app.use(notFoundHandler)
app.use(errorHandler)

// Export the app
export default app
