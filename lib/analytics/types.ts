export type DateRange = "7d" | "30d" | "90d";

export interface AnalyticsKpis {
  totalPosts: number;
  scheduledPosts: number;
  conversionRate: number;
  streak: number;
  totalPostsChange?: number;
  scheduledPostsChange?: number;
  conversionRateChange?: number;
  streakChange?: number;
}

export interface VolumeDataPoint {
  date: string;
  total: number;
  linkedinCount: number;
  xCount: number;
}

export interface PlatformMixItem {
  platform: string;
  count: number;
}

export interface FunnelStage {
  stage: string;
  count: number;
}

export interface AnalyticsResponse {
  kpis: AnalyticsKpis;
  volume: VolumeDataPoint[];
  platformMix: PlatformMixItem[];
  funnel: FunnelStage[];
  previousPeriod?: AnalyticsResponse;
}
