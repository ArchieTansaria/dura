import mongoose from 'mongoose'

const InstallationSchema = new mongoose.Schema({
  // userId: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: 'User',
  //   required: true
  // }, //not specifically mapping every install to a single user because what if he belongs to an org
  installationId: {
    type: Number, 
    required: true,
    unique: true
  },
  accountLogin: { 
    type: String, 
    required: true 
  },
  accountType: { 
    type: String, 
    enum: ['User', 'Organization'], 
    required: true 
  },
  installedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  suspended: { 
    type: Boolean, 
    default: false 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
})

//adding index for faster lookup
InstallationSchema.index({ installationId: 1 })

export const Installation = mongoose.model('Installation', InstallationSchema)