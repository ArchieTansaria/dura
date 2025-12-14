export type RiskLevel = 'high' | 'medium' | 'low';

export interface Dependency {
  name: string;
  type: 'prod' | 'dev';
  currentRange: string;
  currentResolved: string | null;
  latest: string;
  diff: 'major' | 'minor' | 'patch' | 'unknown';
  breaking: boolean;
  releaseKeywords: string[];
  githubRepoUrl?: string;
  riskScore: number;
  riskLevel: RiskLevel;
}

export interface DURAResponse {
  dependencies: Dependency[];
  summary?: {
    total: number;
    high: number;
    medium: number;
    low: number;
  };
  recommendations?: string[];
}

export interface AnalyzeRequest {
  repoUrl: string;
  branch?: string;
}
