import mongoose from 'mongoose'
import { Schema } from 'mongoose'
import { USER } from '~/constants/user.constants'

const UserSchema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    name: { type: String, required: false, default: null },
    authId: { type: String, required: true, unique: true },
    interests: { type: [String], required: false, default: [] },
    profileSummary: { type: String, required: false, default: null },
    scores: {
      type: Map,
      of: Number,
      required: false,
      default: USER.CATEGORIZED_INTERESTS.reduce((acc, ci) => {
        acc[ci.category] = 0
        return acc
      }, {} as { [key: string]: number })
    },
    gender: { type: String, required: false, default: null },
    matchGenderInterest: { type: String, required: false, default: null },
  },
  {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
  }
)

const User = mongoose.model('User', UserSchema)

export default User
