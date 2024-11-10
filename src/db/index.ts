import mongoose, { Connection, Mongoose } from 'mongoose'

const connectionOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true
}

let db: Connection | null = null

const initializeDB = async (): Promise<void> => {
  if (db) {
    return
  }

  const mongoDB = process.env.DATABASE_URL

  if (!mongoDB) {
    throw new Error('DATABASE_URL is not defined')
  }

  db = mongoose.connection

  mongoose.set('strictQuery', true)

  await mongoose.connect(mongoDB)
  await mongoose.connection.syncIndexes()

  db.on('error', (err: Error) => {
    console.error(`MongoDB connection error: ${err}`)
  })
}

const createConnection = async (): Promise<Mongoose> => {
  const mongoDB = process.env.DATABASE_URL

  if (!mongoDB) {
    throw new Error('DATABASE_URL is not defined')
  }

  mongoose.set('strictQuery', true) // to suppress warning

  const newConnection = await mongoose.connect(mongoDB)

  return newConnection
}

export { db, initializeDB, createConnection }
