import app from 'firebase-admin'

class AuthService {
  register = async ({ email, password }: { email: string; password: string }) => {
    const authUser = await app.auth().createUser({
      email,
      password
    })

    return authUser
  }
}

export default AuthService