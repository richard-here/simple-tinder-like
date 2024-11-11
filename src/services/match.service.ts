import { HydratedDocument } from "mongoose"
import { MATCH } from "~/constants/match.constants"
import { ServiceException } from "~/errors"
import Match from "~/models/match.model"
import MatchLog from "~/models/matchLog.model"
import User from "~/models/user.model"

class MatchService {
  private matchModel: typeof Match
  private userModel: typeof User
  private matchLogModel: typeof MatchLog

  constructor({ matchModel, userModel, matchLogModel }: { matchModel: typeof Match, userModel: typeof User, matchLogModel: typeof MatchLog }) {
    this.matchModel = matchModel
    this.userModel = userModel
    this.matchLogModel = matchLogModel
  }

  private createPotentialMatches = async ({ userId, toCreate }: { userId: string, toCreate: number }) => {
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

    if (!user.gender || !user.matchGenderInterest) {
      throw new ServiceException({
        type: 'user',
        code: 'services/match/createTodayPotentialMatches',
        message: 'User has not set gender or match gender interest'
      })
    }

    // Gets a list of potential users based on the user's scores
    const potentialUserIds = new Set<string>()
    for (let [category, score] of user.scores?.entries() ?? []) {
      const filter = {
        _id: { $ne: userId },
        gender: user.matchGenderInterest,
        matchGenderInterest: user.gender
      }

      let scoreMultiplier = 0.7
      let usersCount = 0
      // Ideally, the score difference is at most 30% less than the user's score
      // However, if there are less than toCreate users found, the score difference is increased by 10% until toCreate users are found (or until the score is 0)
      // There is a chance that the number of users found is less than toCreate even if the score difference is 100%
      while (score * scoreMultiplier > 0 && usersCount < toCreate) {
        usersCount = await this.userModel.countDocuments({
          ...filter,
          [`scores.${category}`]: { $gte: score * scoreMultiplier }
        })

        if (usersCount < toCreate) {
          scoreMultiplier -= 0.1
        }
      }

      // Randomizes the offset based on the number of users found
      const randomizedOffset = Math.floor(Math.random() * Math.max((usersCount - toCreate), 0))
      const potentialUsers = await this.userModel.find({
        ...filter,
        [`scores.${category}`]: { $gte: score * scoreMultiplier }
      }).skip(randomizedOffset).limit(toCreate)

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

    // Finds all-time approved matches so that they are not included in the potential matches
    const approvedMatches = await this.matchModel.find({
      $or: [
        { userIdOne: userId },
        { userIdTwo: userId }
      ],
      overallStatus: MATCH.STATUS.ACCEPTED
    })

    const rejectedUsers = rejectedMatches.map((match) => {
      return match.userIdOne.toString() === userId ? match.userIdTwo.toString(): match.userIdOne.toString()
    })

    const approvedUsers = approvedMatches.map((match) => {
      return match.userIdOne.toString() === userId ? match.userIdTwo.toString(): match.userIdOne.toString()
    })

    // Creates potential matches
    const potentialMatches: { userIdOne: string, userIdTwo: string }[] = []
    potentialUserIds.forEach((potentialUserId) => {
      if (!rejectedUsers.includes(potentialUserId) && !approvedUsers.includes(potentialUserId)) {
        potentialMatches.push({
          userIdOne: userId,
          userIdTwo: potentialUserId
        })
      }
    })

    // Chooses random potential matches if there are more than toCreate potential matches
    const randomizedMatches = []
    if (potentialMatches.length > toCreate) {
      const randomizedOffset = Math.floor(Math.random() * (potentialMatches.length - toCreate))
      for (let i = randomizedOffset; i < randomizedOffset + toCreate; i++) {
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

  getPotentialMatches = async ({ userId }: { userId: string }) => {
    // Finds potential matches by this criteria:
    // 1. User is either userOne or userTwo
    // 2. Overall status is not rejected
    // 3. User's status is pending
    const potentialMatches = await this.matchModel.find({
      $or: [
        { $and: [{ userIdOne: userId, userOneStatus: MATCH.STATUS.PENDING }] },
        { $and: [{ userIdTwo: userId, userTwoStatus: MATCH.STATUS.PENDING }] }
      ],
      $and: [
        { overallStatus: MATCH.STATUS.PENDING }
      ]
    }).populate('userOne').populate('userTwo').limit(10)

    if (potentialMatches.length < 10) {
      return [...potentialMatches, ...(await this.createPotentialMatches({ userId, toCreate: 10 - potentialMatches.length }))]
    } else {
      return potentialMatches
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

    const today = new Date()
    const todayStart = new Date(today.setUTCHours(0, 0, 0, 0))
    const todayEnd = new Date(today.setUTCHours(23, 59, 59, 999))
    const matchLogsToday = await this.matchLogModel.countDocuments({
      userId,
      createdAt: { $gte: todayStart, $lte: todayEnd }
    })

    const user = await this.userModel.findById(userId)
    if (!user) {
      throw new ServiceException({
        type: 'not-found',
        code: 'services/match/updateMatchById',
        message: 'User not found'
      })
    }

    const isSubscribed = user.subscribedUntil && user.subscribedUntil > new Date()
    const swipeLimit = isSubscribed ? 20 : 10

    if (matchLogsToday >= swipeLimit) {
      throw new ServiceException({
        type: 'user',
        code: 'services/match/updateMatchById',
        message: `User can only swipe ${swipeLimit} times a day`
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

    await this.matchLogModel.create({
      userId,
      matchId,
      action: status
    })

    return match
  }
}

export default MatchService