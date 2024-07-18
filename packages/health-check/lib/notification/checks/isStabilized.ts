import { rejectUnknowns } from './utils';

import { HistoryItemTag } from '../../constants';

import { HealthStatusLevel } from '../../interfaces';
import { NotificationCheck } from '../types';

/**
 * check if a param that was unstable or broken is now healthy
 */
const IsStabilized: NotificationCheck = {
  id: 'is-stabilized',
  check: (history) => {
    const lastNotified = history.findLast(
      (historyItem) => historyItem.tag === HistoryItemTag.NOTIFIED,
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
  severity: 'success',
  getTitle: async (param) => `Now Healthy: ${await param.getTitle()}`,
  getDescription: async () =>
    'The parameter that was not healthy recently returned to healthy state',
};

export default IsStabilized;
