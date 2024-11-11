import { Request, Response } from 'express'
import { authService, matchService } from '~/services'

class MatchController {
  static async getAcceptedMatches(req: Request, res: Response) {
    const { user } = req
    const userId = user?.customClaims?.dbUserId
    const matches = await matchService.getAcceptedMatches({ userId })
    res.status(200).send({
      status: 'success',
      data: matches
    })
  }

  static async getPotentialMatches(req: Request, res: Response) {
    const { user } = req
    const userId = user?.customClaims?.dbUserId
    const potentialMatches = await matchService.getPotentialMatches({ userId })
    res.status(200).send({
      status: 'success',
      data: potentialMatches
    })
  }

  static async updateMatch(req: Request, res: Response) {
    const { matchId } = req.params
    const { user } = req
    const { status } = req.body
    const userId = user?.customClaims?.dbUserId
    const updatedMatch = await matchService.updateMatchById({ userId, matchId, status })
    res.status(200).send({
      status: 'success',
      data: updatedMatch
    })
  }

  static async getMatchById(req: Request, res: Response) {
    const { matchId } = req.params
    const { user } = req
    const userId = user?.customClaims?.dbUserId
    const match = await matchService.getMatchById({ userId, matchId })
    res.status(200).send({
      status: 'success',
      data: match
    })
  }
}

export default MatchController