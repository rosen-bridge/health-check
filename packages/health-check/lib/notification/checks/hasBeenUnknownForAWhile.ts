import { minute, HistoryItemTag } from '../../constants';

import { NotificationCheck } from '../types';

const DEFAULT_WINDOW_DURATION = 15 * minute;

/**
 * factory for a check checking if a param history has a tail of multiple
 * unknown items
 */
const createHasBeenUnknownForAWhile: (
  windowDuration?: number,
) => NotificationCheck = (windowDuration = DEFAULT_WINDOW_DURATION) => ({
  id: 'has-been-unknown-for-a-while',
  check() {
    const recentHistoryItem = this.history.at(-1);

    if (recentHistoryItem?.result !== 'unknown') return false;

    // find the last unknown item whose previous item isn't unknown
    const unknownTimeWindowStartItemIndex = this.history.findLastIndex(
      (historyItem, index) => {
        return (
          historyItem.result === 'unknown' &&
          /**
           * if index === 0, considering the check for `recentHistoryItem` and
           * the fact of using `findLast`, it essentially means the whole
           * history contains only unknown items, so it's essentially a "window
           * start" and we return it, though it doesn't have a previous item
           */
          this.history[index - 1]?.result !== 'unknown'
        );
      },
    );

    const unknownTimeWindowStartItem =
      this.history[unknownTimeWindowStartItemIndex];

    // this case should never occur occur and is here for unpredicted cases
    if (!unknownTimeWindowStartItem) return false;

    /**
     * if a notification has been already sent, return false
     */
    if (
      this.history
        .slice(unknownTimeWindowStartItemIndex)
        .some((historyItem) => historyItem.tag === HistoryItemTag.NOTIFIED)
    ) {
      return false;
    }

    const timeDifference =
      recentHistoryItem.timestamp - unknownTimeWindowStartItem.timestamp;

    return timeDifference > windowDuration;
  },
  getSeverity() {
    return 'error';
  },
  async getTitle() {
    return `Unknown For A While: ${await this.param.getTitle()}`;
  },
  async getDescription() {
    return (
      this.param.getLastTrialErrorMessage() ??
      'There are no details for the reason of the unknown state'
    );
  },
});

export default createHasBeenUnknownForAWhile;
