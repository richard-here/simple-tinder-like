import User from "~/models/user.model"
import AuthService from "./auth.service"
import UserService from "./user.service"

const authService = new AuthService({ userModel: User })
const userService = new UserService({ userModel: User })

export {
  authService,
  userService
}