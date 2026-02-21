import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema({
  githubId: {
    type: Number,
    required: true, 
    unique: true
  },
  githubLogin: {
    type: String,
    required: true
  },
  accessToken: {
    type: String,   //TODO encrypt this 
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

export const User = mongoose.model("User", UserSchema)