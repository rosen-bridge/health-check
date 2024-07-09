import { HealthStatusLevel } from '../../../../lib';
import { ParamHistory } from '../../../../lib/history/types';

/**
 * last item is broken
 */
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

/**
 * a bunch of last items are broken
 */
export const recentlyBrokenHistory: ParamHistory = [
  {
    result: HealthStatusLevel.BROKEN,
    timestamp: 12345,
  },
  {
    result: HealthStatusLevel.BROKEN,
    timestamp: 12346,
  },
];

/**
 * last item returned to healthy after being unhealthy and notified
 */
export const stabilizedHistory: ParamHistory = [
  {
    result: HealthStatusLevel.BROKEN,
    timestamp: 12345,
    tag: 'notified',
  },
  {
    result: HealthStatusLevel.HEALTHY,
    timestamp: 12346,
  },
];

/**
 * last item returned to healthy after being unhealthy without being notified
 */
export const notNotifiedStabilizedHistory: ParamHistory = [
  {
    result: HealthStatusLevel.HEALTHY,
    timestamp: 12345,
    tag: 'notified',
  },
  {
    result: HealthStatusLevel.BROKEN,
    timestamp: 12346,
  },
  {
    result: HealthStatusLevel.HEALTHY,
    timestamp: 12347,
  },
];

/**
 * last two items are healthy after being unhealthy without being notified
 */
export const alreadyStabilizedHistory: ParamHistory = [
  {
    result: HealthStatusLevel.BROKEN,
    timestamp: 12345,
  },
  {
    result: HealthStatusLevel.HEALTHY,
    timestamp: 12346,
  },
  {
    result: HealthStatusLevel.HEALTHY,
    timestamp: 12347,
  },
];
