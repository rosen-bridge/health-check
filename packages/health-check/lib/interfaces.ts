import HealthHistory from './history/healthHistory';

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

export interface HealthCheckHistoryConfig {
  historyConfig?: Omit<
    NonNullable<ConstructorParameters<typeof HealthHistory>[0]>,
    'updateHandler'
  >;
  notificationCheckConfig?: {
    hasBeenUnstableForAWhile?: {
      windowDuration?: number;
    };
    hasBeenUnknownForAWhile?: {
      windowDuration?: number;
    };
    isStillUnhealthy?: {
      windowDuration?: number;
    };
  };
}
