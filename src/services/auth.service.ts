import axios, { AxiosError, AxiosResponse } from 'axios';
import admin from 'firebase-admin'
import mongoose from 'mongoose'
import ENV from '~/configs/dotenv';
import { ServiceException } from '~/errors';
import User from '~/models/user.model'

class AuthService {
  private userModel: typeof User
  constructor({ userModel }: { userModel: typeof User }) {
    this.userModel = userModel
  }

  register = async ({ email, password }: { email: string; password: string }) => {
    const session = await mongoose.startSession()
    session.startTransaction()

    let authUser: admin.auth.UserRecord | undefined
    try {
      authUser = await admin.auth().createUser({
        email,
        password
      })

      const user = await this.userModel.create([{ email: authUser.email, authId: authUser.uid }], { session })
      const userId = user[0]._id
      await admin.auth().setCustomUserClaims(authUser.uid, {
        dbUserId: userId
      })

      await session.commitTransaction()
      await session.endSession()
      return user[0]
    } catch (error: any) {
      if (authUser) {
        await admin.auth().deleteUser(authUser.uid)
      }
      await session.abortTransaction()
      await session.endSession()
      throw new ServiceException({
        type: 'server',
        code: 'services/auth/register',
        message: error.message ?? 'Failed to register user'
      })
    }
  }

  login = async ({ email, password }: { email: string; password: string }) => {
    let res: AxiosResponse
    try {
      res = await axios.post(
        `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${ENV.FIREBASE_API_KEY}`,
        {
          email,
          password,
          returnSecureToken: true
        }
      )
    } catch (error) {
      throw new ServiceException({
        type: 'user',
        code: 'services/auth/login',
        message: 'Failed to login'
      })
    }
    
    return res.data
  }
}

export default AuthService