import admin from 'firebase-admin'
import app from '~/api'
import ENV from '~/configs/dotenv'
import { initializeDB } from './db'


admin.initializeApp({
  credential: admin.credential.cert({
    projectId: ENV.PROJECT_ID as string,
    clientEmail: ENV.SERVICE_ACCOUNT_CLIENT_EMAIL as string,
    privateKey: ENV.SERVICE_ACCOUNT_PRIVATE_KEY as string
  })
})

const PORT = 3000

await initializeDB()

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})
