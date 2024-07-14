import { withoutUnknowns } from './utils';

import { HealthStatusLevel } from '../../../interfaces';
import { NotificationCheck } from '../../types';

/**
 * check if a param is broken just now (that is, wasn't broken before recently)
 */
const IsBroken: NotificationCheck = {
  id: 'is-broken',
  check: withoutUnknowns((history) => {
    return (
      history.at(-1)?.result === HealthStatusLevel.BROKEN &&
      history.at(-2)?.result !== HealthStatusLevel.BROKEN
    );
  }),
  severity: 'error',
  getTitle: async (param) => `Broken: ${await param.getTitle()}`,
  getDescription: async (param) =>
    (await param.getDetails()) ?? 'The reason for the broken state is unknown',
};

export default IsBroken;
