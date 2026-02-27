export interface AnalyzeOptions {
  repoUrl: string;
  branch?: string;
  scrapeMode?: 'sequential' | 'batch';
}

export interface ConfirmedBreakingChange {
  breaking: 'confirmed' | 'likely' | 'unlikely' | 'unknown';
  confidenceScore: number;
  signals?: {
    strong?: string[];
    weak?: string[];
  };
}

export interface ReportItem {
  name: string;
  type: string;
  currentRange: string;
  currentResolved: string | null;
  latest?: string;
  diff: string;
  breakingChange?: ConfirmedBreakingChange;
  riskScore: number;
  riskLevel: string;
  githubRepoUrl?: string;
  releaseKeywords?: string[];
}

export interface RiskCounts {
  high: number;
  medium: number;
  low: number;
  breaking: number;
}

export interface HealthStats {
  score: number;
  status: 'excellent' | 'good' | 'needs-attention' | 'critical';
}

export interface Recommendation {
  priority: 'immediate' | 'high' | 'medium' | 'maintenance';
  title: string;
  steps: string[];
}

export interface RiskSummary {
  totalDependencies: number;
  counts: RiskCounts;
  health: HealthStats;
  prioritizedDependencies: ReportItem[];
  recommendations: Recommendation[];
}

export function analyzeRepository(options: AnalyzeOptions): Promise<ReportItem[]>;
export function aggregateRisk(dependencies: ReportItem[] | { dependencies: ReportItem[] }): RiskSummary;
export function calculateHealthScore(high: number, medium: number, low: number): number;
export function determineHealthStatus(score: number): 'excellent' | 'good' | 'needs-attention' | 'critical';
export function generateRecommendations(counts: RiskCounts): Recommendation[];
