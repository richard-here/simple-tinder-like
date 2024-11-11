import User from "~/models/user.model"
import Match from "~/models/match.model"
import AuthService from "./auth.service"
import UserService from "./user.service"
import MatchService from "./match.service"

const authService = new AuthService({ userModel: User })
const userService = new UserService({ userModel: User })
const matchService = new MatchService({ matchModel: Match, userModel: User })

export {
  authService,
  userService,
  matchService
}