import { rejectUnknowns } from './utils';

import { MINUTE, HistoryItemTag } from '../../constants';

import { HealthStatusLevel } from '../../interfaces';
import { NotificationCheck } from '../types';

const DEFAULT_WINDOW_DURATION = 15 * MINUTE;

/**
 * factory for a check checking if a param history has a tail of multiple
 * unstable items after being healthy
 */
const createHasBeenUnstableForAWhile: (
  windowDuration?: number,
) => NotificationCheck =
  (windowDuration = DEFAULT_WINDOW_DURATION) =>
  (param, history) => ({
    [Symbol.toStringTag]: 'HasBeenUnstableForAWhile',
    id: 'has-been-unstable-for-a-while',
    check() {
      const historyWithoutUnknowns = rejectUnknowns(history);
      const recentHistoryItem = historyWithoutUnknowns.at(-1);

      if (recentHistoryItem?.result !== HealthStatusLevel.UNSTABLE)
        return false;

      // find the last unstable item whose previous item isn't unstable
      const unstableTimeWindowStartItemIndex =
        historyWithoutUnknowns.findLastIndex((historyItem, index) => {
          return (
            historyItem.result === HealthStatusLevel.UNSTABLE &&
            /**
             * if index === 0, considering the check for `recentHistoryItem` and
             * the fact of using `findLast`, it essentially means the whole
             * history contains only unstable items, so it's essentially a "window
             * start" and we return it, though it doesn't have a previous item
             */
            historyWithoutUnknowns[index - 1]?.result !==
              HealthStatusLevel.UNSTABLE
          );
        });

      const unstableTimeWindowStartItem =
        historyWithoutUnknowns[unstableTimeWindowStartItemIndex];

      // this case should never occur occur and is here for unpredicted cases
      if (!unstableTimeWindowStartItem) return false;

      /**
       * if a notification has been already sent, return false
       */
      if (
        historyWithoutUnknowns
          .slice(unstableTimeWindowStartItemIndex)
          .some(
            (historyItem) => historyItem.tag?.id === HistoryItemTag.NOTIFIED,
          )
      ) {
        return false;
      }

      /**
       * if a param changes from `BROKEN` to `UNSTABLE` and remains `UNSTABLE`,
       * we have previously sent a notification with higher severity for the
       * `BROKEN` state without sending its stabilization notification, so no more
       * notifications are required
       */
      if (
        historyWithoutUnknowns[unstableTimeWindowStartItemIndex - 1]?.result ===
        HealthStatusLevel.BROKEN
      ) {
        return false;
      }

      const timeDifference =
        recentHistoryItem.timestamp - unstableTimeWindowStartItem.timestamp;

      return timeDifference > windowDuration * 1000;
    },
    getSeverity() {
      return 'warning';
    },
    async getTitle() {
      return `Unstable For A While: ${await param.getTitle()}`;
    },
    async getDescription() {
      return (
        (await param.getDetails()) ??
        'The reason for the unstable state is unknown'
      );
    },
  });

export default createHasBeenUnstableForAWhile;
