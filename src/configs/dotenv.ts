import dotenv from 'dotenv'
dotenv.config()

interface Env {
  PROJECT_ID: string | undefined
  FIREBASE_API_KEY: string | undefined
  SERVICE_ACCOUNT_CLIENT_EMAIL: string | undefined
  SERVICE_ACCOUNT_PRIVATE_KEY: string | undefined
  DATABASE_URL: string | undefined
}

const ENV: Env = {
  PROJECT_ID: process.env.FB_PROJECT_ID,
  FIREBASE_API_KEY: process.env.FB_API_KEY,
  SERVICE_ACCOUNT_CLIENT_EMAIL: process.env.SERVICE_ACCOUNT_CLIENT_EMAIL,
  SERVICE_ACCOUNT_PRIVATE_KEY: process.env.SERVICE_ACCOUNT_PRIVATE_KEY,
  DATABASE_URL: process.env.DATABASE_URL
}

const requiredEnvVars: Array<keyof Env> = [
  'PROJECT_ID',
  'FIREBASE_API_KEY',
  'SERVICE_ACCOUNT_CLIENT_EMAIL',
  'SERVICE_ACCOUNT_PRIVATE_KEY',
  'DATABASE_URL'
]

requiredEnvVars.forEach((key) => {
  if (!ENV[key]) {
    throw new Error(`Missing required environment variable: ${key}`)
  }
})

export default ENV
