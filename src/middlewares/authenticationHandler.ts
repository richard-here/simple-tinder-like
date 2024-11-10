import { Request, Response, NextFunction } from 'express';
import admin from 'firebase-admin';
import { ServiceException } from '~/errors';

const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  const idToken = req.headers.authorization?.split('Bearer ')[1]
  if (idToken) {
    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken)
      const user = await admin.auth().getUser(decodedToken.uid)
      req.user = user
    } catch (error: any) {
      throw new ServiceException({
        type: 'user',
        code: 'middlewares/authenticationHandler',
        message: error.message ?? 'Failed to authenticate user'
      })
    }
  } else {
    throw new ServiceException({
      type: 'user',
      code: 'middlewares/authenticationHandler',
      message: 'Unauthorized, bearer token not given'
    })
  }
  next()
}

export default authenticate
