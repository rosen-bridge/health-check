import { day } from '../../constants';

import { HealthStatusLevel } from '../../interfaces';
import { NotificationCheck } from '../types';

const DEFAULT_WINDOW_DURATION = 1 * day;

/**
 * factory for a check checking if a notification for an unhealthy state is sent
 * and is still unresolved
 * in other words, this check is for repeating notifications of unhealthy states
 */
const createIsStillUnhealthy: (windowDuration?: number) => NotificationCheck = (
  windowDuration = DEFAULT_WINDOW_DURATION,
) => ({
  id: 'is-still-unhealthy',
  check: (history) => {
    const lastNotified = history.find(
      (historyItem) => historyItem.tag === 'notified',
    );
    const recentHistoryItem = history.at(-1);

    if (!lastNotified || !recentHistoryItem) {
      return false;
    }

    if (lastNotified?.result === HealthStatusLevel.HEALTHY) {
      return false;
    }

    const timeDifference = recentHistoryItem.timestamp - lastNotified.timestamp;

    return timeDifference > windowDuration;
  },
  severity: 'warning',
  getTitle: async (param) => `Is Still Unhealthy: ${await param.getTitle()}`,
  getDescription: async () =>
    'The previous issue for this param is not resolved yet',
});

export default createIsStillUnhealthy;
