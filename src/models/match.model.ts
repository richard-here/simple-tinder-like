import mongoose from 'mongoose'
import { Schema } from 'mongoose'
import { MATCH } from '~/constants/match.constants'

const MatchSchema = new Schema(
  {
    userIdOne: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    userIdTwo: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    userOneStatus: { type: String, required: false, default: MATCH.STATUS.PENDING },
    userTwoStatus: { type: String, required: false, default: MATCH.STATUS.PENDING },
    overallStatus: { type: String, required: false, default: MATCH.STATUS.PENDING },
    matchAt: { type: Date, required: false, default: null },
  },
  {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
  }
)

MatchSchema.virtual('userOne', {
  ref: 'User',
  localField: 'userIdOne',
  foreignField: '_id',
  justOne: true,
  options: { select: 'name profileSummary email interests' }
})

MatchSchema.virtual('userTwo', {
  ref: 'User',
  localField: 'userIdTwo',
  foreignField: '_id',
  justOne: true,
  options: { select: 'name profileSummary email interests' }
})

const User = mongoose.model('Match', MatchSchema)

export default User
