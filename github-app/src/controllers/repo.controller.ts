import { Request, Response } from 'express'
import { Analysis } from '../models/Analysis.model.js'
import { AnalysisQueue } from '../queues/analysisQueue.js'

export const getRepoAnalysis = async (req: Request, res: Response) => {
  try {
    const userId = req.session.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { owner, name } = req.params;
    const repoFullName = `${owner}/${name}`;
    
    // Fetch latest analysis
    const analysis = await Analysis.findOne({ repoFullName }).sort({ scannedAt: -1 });

    if (!analysis) {
      return res.status(404).json({ error: "No analysis found for this repository" });
    }

    // Return the data
    return res.json({
      summary: analysis.summary,
      dependencies: analysis.dependencies,
      scannedAt: analysis.scannedAt,
      status: analysis.status
    });

  } catch (error) {
    console.error("Error fetching repo analysis:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export const triggerScan = async (req: Request, res: Response) => {
  try {
    const userId = req.session.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { owner, name } = req.params;
    const repoFullName = `${owner}/${name}`;

    // Look for the last analysis to get the installation ID and repo ID
    const lastAnalysis = await Analysis.findOne({ repoFullName }).sort({ scannedAt: -1 });
    
    if (!lastAnalysis) {
      return res.status(404).json({ error: "Cannot trigger manual scan on an unscanned repo. Please push a commit or reconnect." });
    }

    await AnalysisQueue.add(
      'scan-repo',
      {
        installationId: lastAnalysis.installationId,
        repoFullName,
        repoId: lastAnalysis.repoId,
        branch: lastAnalysis.branch || 'main',
        trigger: 'manual'
      },
      { attempts: 3, backoff: { type: "exponential", delay: 5000 }, removeOnComplete: true }
    );

    return res.status(202).json({ message: "Scan queued successfully" });

  } catch (error) {
    console.error("Error triggering scan:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
