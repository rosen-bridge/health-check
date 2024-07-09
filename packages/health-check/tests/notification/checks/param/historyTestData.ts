import { HealthStatusLevel } from '../../../../lib';
import { ParamHistory } from '../../../../lib/history/types';

export const brokenHistory: ParamHistory = [
  {
    result: HealthStatusLevel.HEALTHY,
    timestamp: 12345,
  },
  {
    result: HealthStatusLevel.BROKEN,
    timestamp: 12346,
  },
];
export const recentlyBrokenHistory: ParamHistory = [
  {
    result: HealthStatusLevel.BROKEN,
    timestamp: 12345,
  },
  {
    result: HealthStatusLevel.BROKEN,
    timestamp: 12346,
    tag: 'notified',
  },
];
export const stabilizedHistory: ParamHistory = [
  {
    result: HealthStatusLevel.BROKEN,
    timestamp: 12345,
  },
  {
    result: HealthStatusLevel.HEALTHY,
    timestamp: 12346,
  },
];
