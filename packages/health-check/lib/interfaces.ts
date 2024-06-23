export interface HealthStatus {
  id: string;
  title: string;
  description: string;
  status: HealthStatusLevel;
  lastCheck?: Date;
  lastTrialErrorMessage?: string;
  lastTrialErrorTime?: Date;
  details?: string;
}

export enum HealthStatusLevel {
  HEALTHY = 'Healthy',
  UNSTABLE = 'Unstable',
  BROKEN = 'Broken',
}
