import { NotifyWithSeverity } from '@rosen-bridge/abstract-notification';
import { DAY, HistoryItemTag } from '../../constants';

import { HealthStatusLevel } from '../../interfaces';
import { NotificationCheck } from '../types';

const DEFAULT_WINDOW_DURATION = 1 * DAY;

/**
 * factory for a check checking if a notification for an unhealthy state is sent
 * and is still unresolved
 * in other words, this check is for repeating notifications of unhealthy states
 */
const createIsStillUnhealthy: (windowDuration?: number) => NotificationCheck =
  (windowDuration = DEFAULT_WINDOW_DURATION) =>
  (param, history) => ({
    [Symbol.toStringTag]: 'IsStillUnhealthy',
    id: 'is-still-unhealthy',
    check() {
      const lastNotifiedIndex = history.findLastIndex(
        (historyItem) => historyItem.tag?.id === HistoryItemTag.NOTIFIED,
      );
      const recentHistoryItem = history.at(-1);

      if (lastNotifiedIndex === -1 || !recentHistoryItem) {
        return false;
      }

      if (
        history
          .slice(lastNotifiedIndex)
          .some(
            (historyItem) => historyItem.result === HealthStatusLevel.HEALTHY,
          )
      ) {
        return false;
      }

      const lastNotified = history[lastNotifiedIndex];

      const timeDifference =
        recentHistoryItem.timestamp - lastNotified.timestamp;

      return timeDifference > windowDuration * 1000;
    },
    getSeverity() {
      const lastNotified = history.findLast(
        (historyItem) => historyItem.tag?.id === HistoryItemTag.NOTIFIED,
      );
      const notifyArgs = lastNotified?.tag
        ?.data as Parameters<NotifyWithSeverity>;

      return notifyArgs[0];
    },
    async getTitle() {
      const lastNotified = history.findLast(
        (historyItem) => historyItem.tag?.id === HistoryItemTag.NOTIFIED,
      );
      const notifyArgs = lastNotified?.tag
        ?.data as Parameters<NotifyWithSeverity>;

      return notifyArgs[1];
    },
    async getDescription() {
      const lastNotified = history.findLast(
        (historyItem) => historyItem.tag?.id === HistoryItemTag.NOTIFIED,
      );
      const notifyArgs = lastNotified?.tag
        ?.data as Parameters<NotifyWithSeverity>;

      return notifyArgs[2];
    },
  });

export default createIsStillUnhealthy;
