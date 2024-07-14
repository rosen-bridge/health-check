import { ParamHistory } from '../../../history/types';

/**
 * filter out all unknown items from a history
 * @param history
 */
const rejectUnknowns = (history: ParamHistory) =>
  history.filter((historyItem) => historyItem.result !== 'unknown');

/**
 * get a check function and return the same function, but filtering all unknown
 * history items from its history parameter
 *
 * this is essentially the HOF version of rejectUnknowns
 * @param check
 */
export const withoutUnknowns =
  (check: (history: ParamHistory) => boolean) => (history: ParamHistory) =>
    check(rejectUnknowns(history));
