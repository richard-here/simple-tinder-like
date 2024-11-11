import mongoose from 'mongoose'
import { Schema } from 'mongoose'

const MatchLogSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, required: true },
    matchId: { type: Schema.Types.ObjectId, ref: 'Match', required: true },
  },
  {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
  }
)

const MatchLog = mongoose.model('MatchLog', MatchLogSchema)

export default MatchLog
