import { ParamHistory } from '../../../history/types';

/**
 * filter out all unknown items from a history
 * @param history
 */
export const rejectUnknowns = (history: ParamHistory) =>
  history.filter((historyItem) => historyItem.result !== 'unknown');
