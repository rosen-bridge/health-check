import { rejectUnknowns } from './utils';

import { HistoryItemTag } from '../../constants';

import { HealthStatusLevel } from '../../interfaces';
import { NotificationCheck } from '../types';

/**
 * check if a param is broken just now (that is, wasn't broken before recently)
 */
const IsBroken: NotificationCheck = {
  id: 'is-broken',
  check() {
    const history = rejectUnknowns(this.history);
    return (
      history.at(-1)?.result === HealthStatusLevel.BROKEN &&
      /**
       * because we reject unknowns, if we have the such a history:
       * healthy -> broken -> unknown
       * we have already sent a notification, and we shouldn't repeat it
       */
      history.at(-1)?.tag?.id !== HistoryItemTag.NOTIFIED &&
      history.at(-2)?.result !== HealthStatusLevel.BROKEN
    );
  },
  getSeverity() {
    return 'error';
  },
  async getTitle() {
    return `Broken: ${await this.param.getTitle()}`;
  },
  async getDescription() {
    return (
      (await this.param.getDetails()) ??
      'The reason for the broken state is unknown'
    );
  },
};

export default IsBroken;
