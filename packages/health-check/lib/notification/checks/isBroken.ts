import { rejectUnknowns } from './utils';

import { HistoryItemTag } from '../../constants';

import { HealthStatusLevel } from '../../interfaces';
import { NotificationCheck } from '../types';

/**
 * check if a param has become broken
 */
const isBroken: NotificationCheck = (param, history) => ({
  [Symbol.toStringTag]: 'IsBroken',
  id: 'is-broken',
  check() {
    const historyWithoutUnknowns = rejectUnknowns(history);
    return (
      historyWithoutUnknowns.at(-1)?.result === HealthStatusLevel.BROKEN &&
      /**
       * because we reject unknowns, if we have the such a history:
       * healthy -> broken -> unknown
       * we have already sent a notification, and we shouldn't repeat it
       */
      historyWithoutUnknowns.at(-1)?.tag?.id !== HistoryItemTag.NOTIFIED &&
      historyWithoutUnknowns.at(-2)?.result !== HealthStatusLevel.BROKEN
    );
  },
  getSeverity() {
    return 'error';
  },
  async getTitle() {
    return `Broken: ${await param.getTitle()}`;
  },
  async getDescription() {
    return (
      (await param.getDetails()) ?? 'The reason for the broken state is unknown'
    );
  },
});

export default isBroken;
