import { HydratedDocument } from "mongoose"
import { MATCH } from "~/constants/match.constants"
import { ServiceException } from "~/errors"
import Match from "~/models/match.model"
import User from "~/models/user.model"

class MatchService {
  private matchModel: typeof Match
  private userModel: typeof User

  private createTodayPotentialMatches = async ({ userId }: { userId: string }) => {
    /**
     * Step 1: get 10 other users with scores for each category that are close to the current user's scores
     * Step 2: if there are less than 10 users found, increase the score difference by 10% until 10 users are found
     * Step 3: randomize the offset based on the number of users found
     * Step 4: create potential matches in the database
     * Step 5: return the potential matches
     */

    const user = await this.userModel.findById(userId)
    if (!user) {
      throw new ServiceException({
        type: 'not-found',
        code: 'services/match/createTodayPotentialMatches',
        message: 'User not found'
      })
    }

    // Gets a list of potential users based on the user's scores
    const potentialUserIds = new Set<string>()
    for (let [category, score] of user.scores?.entries() ?? []) {
      const filter = {
        _id: { $ne: userId }
      }

      let scoreMultiplier = 0.7
      let usersCount = 0
      // Ideally, the score difference is at most 30% less than the user's score
      // However, if there are less than 10 users found, the score difference is increased by 10% until 10 users are found (or until the score is 0)
      // There is a chance that the number of users found is less than 10 even if the score difference is 100%
      while (score * scoreMultiplier > 0 && usersCount < 10) {
        usersCount = await this.userModel.countDocuments({
          ...filter,
          [`scores.${category}`]: { $gte: score * scoreMultiplier }
        })

        console.log(`scores.${category}: ${score * scoreMultiplier}, userscount: ${usersCount}`)

        if (usersCount < 10) {
          scoreMultiplier -= 0.1
        }
      }

      // Randomizes the offset based on the number of users found
      const randomizedOffset = Math.floor(Math.random() * Math.max((usersCount - 10), 0))
      const potentialUsers = await this.userModel.find({
        ...filter,
        [`scores.${category}`]: { $gte: score * scoreMultiplier }
      }).skip(randomizedOffset).limit(10)

      for (let potentialUser of potentialUsers) {
        potentialUserIds.add(potentialUser._id.toString())
      }
    }

    // Finds recently rejected matches so that they are not included in the potential matches (recent = within 7 days)
    const today = new Date()
    today.setUTCHours(0, 0, 0, 0)
    const rejectedMatches = await this.matchModel.find({
      $or: [
        { userIdOne: userId },
        { userIdTwo: userId }
      ],
      $and: [
        { overallStatus: MATCH.STATUS.DECLINED },
        { createdAt: { $gte: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000) } }
      ]
    })

    const rejectedUsers = rejectedMatches.map((match) => {
      return match.userIdOne.toString() === userId ? match.userIdTwo.toString(): match.userIdOne.toString()
    })

    // Creates potential matches
    const potentialMatches: { userIdOne: string, userIdTwo: string }[] = []
    potentialUserIds.forEach((potentialUserId) => {
      if (!rejectedUsers.includes(potentialUserId)) {
        potentialMatches.push({
          userIdOne: userId,
          userIdTwo: potentialUserId
        })
      }
    })

    // Chooses 10 random potential matches if there are more than 10 potential matches
    const randomizedMatches = []
    if (potentialMatches.length > 10) {
      const randomizedOffset = Math.floor(Math.random() * (potentialMatches.length - 10))
      for (let i = randomizedOffset; i < randomizedOffset + 10; i++) {
        randomizedMatches.push(potentialMatches[i])
      }
    } else {
      randomizedMatches.push(...potentialMatches)
    }

    // Creates the potential matches in the database
    const potentialMatchesInDb = await this.matchModel.insertMany(randomizedMatches.map((match) => {
      return {
        userIdOne: match.userIdOne,
        userIdTwo: match.userIdTwo,
        overallStatus: MATCH.STATUS.PENDING
      }
    }))

    const populatedPotentialMatchesInDb = await this.matchModel.populate(potentialMatchesInDb, [
      { path: 'userOne' },
      { path: 'userTwo' }
    ])

    return populatedPotentialMatchesInDb
  }

  constructor({ matchModel, userModel }: { matchModel: typeof Match, userModel: typeof User }) {
    this.matchModel = matchModel
    this.userModel = userModel
  }

  getPotentialMatches = async ({ userId }: { userId: string }) => {
    const today = new Date()
    const todayStart = new Date(today.setUTCHours(0, 0, 0, 0))
    const todayEnd = new Date(today.setUTCHours(23, 59, 59, 999))

    const matchesCreatedToday = await this.matchModel.find({
      $or: [
        { userIdOne: userId },
        { userIdTwo: userId }
      ],
      $and: [
        { createdAt: { $gte: todayStart, $lte: todayEnd } }
      ]
    }).populate('userOne').populate('userTwo')

    if (matchesCreatedToday.length === 0) {
      return this.createTodayPotentialMatches({ userId })
    } else {
      return matchesCreatedToday.filter((match) => match.overallStatus === MATCH.STATUS.PENDING)
    }
  }

  getMatchById = async ({ userId, matchId }: { userId: string, matchId: string }) => {
    const match = await this.matchModel.findById(matchId).populate('userOne').populate('userTwo')
    if (!match) {
      throw new ServiceException({
        type: 'not-found',
        code: 'services/match/getMatchById',
        message: 'Match not found'
      })
    }

    if (match.userIdOne.toString() !== userId && match.userIdTwo.toString() !== userId) {
      throw new ServiceException({
        type: 'permission',
        code: 'services/match/getMatchById',
        message: 'User is not part of the match'
      })
    }

    return match
  }

  updateMatchById = async ({ userId, matchId, status }: { userId: string, matchId: string, status: string }) => {
    const match = await this.matchModel.findById(matchId)
    if (!match) {
      throw new ServiceException({
        type: 'not-found',
        code: 'services/match/updateMatchById',
        message: 'Match not found'
      })
    }

    if (match.userIdOne.toString() !== userId && match.userIdTwo.toString() !== userId) {
      throw new ServiceException({
        type: 'permission',
        code: 'services/match/updateMatchById',
        message: 'User is not part of the match'
      })
    }

    const isUserOne = match.userIdOne.toString() === userId
    if (isUserOne) {
      match.userOneStatus = status
    } else {
      match.userTwoStatus = status
    }

    match.overallStatus = match.userOneStatus === MATCH.STATUS.ACCEPTED && match.userTwoStatus === MATCH.STATUS.ACCEPTED
      ? MATCH.STATUS.ACCEPTED
      : match.userOneStatus === MATCH.STATUS.DECLINED || match.userTwoStatus === MATCH.STATUS.DECLINED
        ? MATCH.STATUS.DECLINED
        : MATCH.STATUS.PENDING

    await match.save()
    return match
  }
}

export default MatchService