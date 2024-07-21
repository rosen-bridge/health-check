import { NotifyWithSeverity } from '@rosen-bridge/abstract-notification';
import { day, HistoryItemTag } from '../../constants';

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
  [Symbol.toStringTag]: 'IsStillUnhealthy',
  id: 'is-still-unhealthy',
  check() {
    const lastNotified = this.history.findLast(
      (historyItem) => historyItem.tag?.id === HistoryItemTag.NOTIFIED,
    );
    const recentHistoryItem = this.history.at(-1);

    if (!lastNotified || !recentHistoryItem) {
      return false;
    }

    if (lastNotified?.result === HealthStatusLevel.HEALTHY) {
      return false;
    }

    const timeDifference = recentHistoryItem.timestamp - lastNotified.timestamp;

    return timeDifference > windowDuration;
  },
  getSeverity() {
    const lastNotified = this.history.findLast(
      (historyItem) => historyItem.tag?.id === HistoryItemTag.NOTIFIED,
    );
    const notifyArgs = lastNotified?.tag
      ?.data as Parameters<NotifyWithSeverity>;

    return notifyArgs[0];
  },
  async getTitle() {
    const lastNotified = this.history.findLast(
      (historyItem) => historyItem.tag?.id === HistoryItemTag.NOTIFIED,
    );
    const notifyArgs = lastNotified?.tag
      ?.data as Parameters<NotifyWithSeverity>;

    return notifyArgs[1];
  },
  async getDescription() {
    const lastNotified = this.history.findLast(
      (historyItem) => historyItem.tag?.id === HistoryItemTag.NOTIFIED,
    );
    const notifyArgs = lastNotified?.tag
      ?.data as Parameters<NotifyWithSeverity>;

    return notifyArgs[2];
  },
});

export default createIsStillUnhealthy;
