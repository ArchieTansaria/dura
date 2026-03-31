import mongoose from 'mongoose'

const AnalysisSchema = new mongoose.Schema({
  // Links to the installation
  installationId: { 
    type: Number, 
    required: true, 
    // ref: 'Installation' 
  },
  
  // Repo identifier
  repoFullName: { 
    type: String, 
    required: true 
  }, 
  branch: { 
    type: String, 
    default: 'main' 
  },
  repoId: { 
    type: Number, 
    required: true 
  },

  // The full array of ReportItems from analyzeRepository()
  dependencies: [{
    name: String,
    type: { 
      type: String, 
      enum: ['prod', 'dev'] 
    },
    currentRange: String,
    currentResolved: String,
    latest: String,
    diff: { 
      type: String, 
      enum: ['major', 'minor', 'patch', 'same', 'unknown'] 
    },
    breakingChange: {
      breaking: { 
        type: String, 
        enum: ['confirmed', 'likely', 'unlikely', 'unknown'] 
      },
      confidenceScore: Number,
      signals: {
        strong: [String],
        weak: [String]
      }
    },
    riskScore: Number,
    riskLevel: { 
      type: String, 
      enum: ['high', 'medium', 'low'] 
    },
    githubRepoUrl: String,
    releaseKeywords: [String]
  }],

  // The aggregated summary from aggregateRisk()
  summary: {
    totalDependencies: Number,
    counts: { 
      high: Number, 
      medium: Number, 
      low: Number, 
      breaking: Number 
    },
    health: {
      score: Number,
      status: { 
        type: String, 
        enum: ['excellent', 'good', 'needs-attention', 'critical'] 
      }
    },
    recommendations: [{
      priority: { 
        type: String, 
        enum: ['immediate', 'high', 'medium', 'maintenance'] 
      },
      title: String,
      steps: [String]
    }]
  },

  // Metadata
  status: { 
    type: String, 
    enum: ['processing', 'ready', 'failed'], 
    default: 'pending' 
  },
  error: String,
  scannedAt: { 
    type: Date, 
    default: Date.now 
  }
}, { timestamps: true })

// Index for fast lookups
AnalysisSchema.index({ repoFullName: 1, scannedAt: -1 })

export const Analysis = mongoose.model('Analysis', AnalysisSchema);
