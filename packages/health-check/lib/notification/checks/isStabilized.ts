import { rejectUnknowns } from './utils';

import { HistoryItemTag } from '../../constants';

import { HealthStatusLevel } from '../../interfaces';
import { NotificationCheck } from '../types';

/**
 * check if a param that was unstable or broken is now healthy
 */
const isStabilized: NotificationCheck = (param, history) => ({
  [Symbol.toStringTag]: 'IsStabilized',
  id: 'is-stabilized',
  check() {
    const lastNotified = history.findLast(
      (historyItem) => historyItem.tag?.id === HistoryItemTag.NOTIFIED,
    );
    /**
     * Based on the status of last notified item, we may or may not need to
     * ignore unknown items
     */
    if (lastNotified?.result === 'unknown') {
      return (
        history.at(-1)?.result === HealthStatusLevel.HEALTHY &&
        history.at(-2)?.result !== HealthStatusLevel.HEALTHY
      );
    }

    const historyWithoutUnknowns = rejectUnknowns(history);
    return (
      historyWithoutUnknowns.at(-1)?.result === HealthStatusLevel.HEALTHY &&
      historyWithoutUnknowns.at(-2)?.result !== HealthStatusLevel.HEALTHY &&
      !!lastNotified &&
      lastNotified?.result !== HealthStatusLevel.HEALTHY
    );
  },
  getSeverity() {
    return 'success';
  },
  async getTitle() {
    return `Now Healthy: ${await param.getTitle()}`;
  },
  async getDescription() {
    return 'Returned to healthy state';
  },
});

export default isStabilized;
