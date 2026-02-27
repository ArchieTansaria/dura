declare module 'dura-kit' {
  export interface AnalyzeOptions {
    repoUrl: string;
    branch?: string;
    scrapeMode?: 'sequential' | 'batch';
  }

  export interface ReportItem {
    name: string;
    type: string;
    currentRange: string;
    currentResolved: string | null;
    latest?: string;
    diff: string;
    breakingChange: boolean;
    riskScore: number;
    riskLevel: string;
    githubRepoUrl?: string;
    releaseKeywords?: string[];
  }

  export function analyzeRepository(options: AnalyzeOptions): Promise<ReportItem[]>;
}
