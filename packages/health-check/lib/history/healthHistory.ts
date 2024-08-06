import { DAY, HOUR, SECOND } from '../constants';

import {
  HealthHistoryUpdateHandler,
  History,
  ParamHistoryItem,
  ParamId,
  ParamHistoryItemTag,
} from './types';

export const DEFAULT_HISTORY_CLEANUP_INTERVAL = 10 * SECOND;
export const DEFAULT_HISTORY_CLEANUP_THRESHOLD = 1 * DAY + 1 * HOUR;

/**
 * Hold a history of health check param statuses in specific timestamps,
 * providing methods for updating the history and running side effects when a
 * change occurs
 */
class HealthHistory {
  /**
   * TODO: Decouple history logic by introducing its own interface, so that it
   * can be implemented in various ways other than a normal JS object (e.g. for
   * persisting history in a file, database, etc.)
   *
   * local:ergo/rosen-bridge/health-check#21
   */
  private history: History = {};
  private updateHandler: HealthHistoryUpdateHandler;

  [Symbol.toStringTag] = 'HealthHistory';

  constructor({
    updateHandler = async () => {},
    cleanupInterval = DEFAULT_HISTORY_CLEANUP_INTERVAL,
    cleanupThreshold = DEFAULT_HISTORY_CLEANUP_THRESHOLD,
  }: {
    updateHandler?: HealthHistoryUpdateHandler;
    cleanupInterval?: number;
    cleanupThreshold?: number;
  } = {}) {
    this.updateHandler = updateHandler;
    this.startCleanup(cleanupInterval * 1000, cleanupThreshold * 1000);
  }

  /**
   * cleanup history items older than `threshold` seconds
   * @param interval
   * @param threshold
   */
  startCleanup = (interval: number, threshold: number) => {
    /**
     * cleanup history for a param
     * @param param
     */
    const cleanupParamHistory = (param: ParamId) => {
      this.history[param] = this.history[param].filter(
        (historyItem) => Date.now() - historyItem.timestamp < threshold,
      );
    };

    setInterval(() => {
      Object.keys(this.history).forEach(cleanupParamHistory);
    }, interval);
  };

  /**
   * @returns whole history object
   */
  getHistory = () => this.history;

  /**
   * set a callback to be run whenever something is updated in the history
   * @param updateHandler
   */
  onUpdate = (updateHandler: HealthHistoryUpdateHandler) => {
    const currentHandler = this.updateHandler;
    this.updateHandler = async (param, paramHistory) => {
      currentHandler?.(param, paramHistory);
      updateHandler(param, paramHistory);
    };
  };

  /**
   * add a list of new param statuses and timestamps to the history, represented
   * by an object indexed by param id
   *
   * note that this function triggers onUpdate multiple times, equal to the
   * number of params updated
   * @param historyItem
   */
  updateHistory = async (historyItem: Record<ParamId, ParamHistoryItem>) => {
    await Promise.all(
      Object.entries(historyItem).map((historyItemEntry) =>
        this.updateHistoryForParam(...historyItemEntry),
      ),
    );
  };

  /**
   * add a new param status and timestamp to the history for the param
   * @param paramId
   * @param historyItem
   */
  updateHistoryForParam = async (
    paramId: ParamId,
    historyItem: ParamHistoryItem,
  ) => {
    if (!this.history[paramId]) {
      this.history[paramId] = [];
    }
    this.history[paramId].push(historyItem);
    await this.updateHandler(paramId, this.history[paramId]);
  };

  /**
   * set a tag for a param's history tail (that is, the most recent item), which
   * can contain any data (e.g. for checking if the status update caused a
   * notification to be sent)
   *
   * note that setting a tag doesn't trigger onUpdate
   * @param param
   * @param tag
   */
  setTag = (param: string, tag: ParamHistoryItemTag) => {
    if (this.history[param]?.at(-1)) {
      this.history[param].at(-1)!.tag = tag;
    }
  };
}

export default HealthHistory;
