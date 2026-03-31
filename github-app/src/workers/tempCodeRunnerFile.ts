export const scanWorker = new Worker('AnalysisQueue', async (job: Job) => {
