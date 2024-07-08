import {
  HealthHistoryUpdateHandler,
  History,
  ParamHistoryItem,
  ParamId,
} from './types';

export const DEFAULT_HISTORY_CLEANUP_INTERVAL = 10_000; // 10 seconds
export const DEFAULT_HISTORY_CLEANUP_THRESHOLD_MS = 24 * 60_000; // 1 day

/**
 * Hold a history of health check param statuses in specific timestamps,
 * providing methods for updating the history and running side effects when a
 * change occurs
 */
class HealthHistory {
  private history: History = {};
  private updateHandler: HealthHistoryUpdateHandler;

  constructor({
    updateHandler = async () => {},
    cleanupInterval = DEFAULT_HISTORY_CLEANUP_INTERVAL,
    cleanupThreshold = DEFAULT_HISTORY_CLEANUP_THRESHOLD_MS,
  }: {
    updateHandler?: HealthHistoryUpdateHandler;
    cleanupInterval?: number;
    cleanupThreshold?: number;
  } = {}) {
    this.updateHandler = updateHandler;
    this.startCleanup(cleanupInterval, cleanupThreshold);
  }

  /**
   * cleanup history items older than `threshold` milliseconds
   * @param interval
   * @param threshold
   */
  startCleanup = (interval: number, threshold: number) => {
    setInterval(() => {
      Object.keys(this.history).forEach((param) => {
        this.history[param] = this.history[param].filter(
          (historyItem) => Date.now() - historyItem.timestamp < threshold,
        );
      });
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
    this.updateHandler = updateHandler;
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
   * set a tag for a param's history head which can contain any metadata (e.g.
   * for checking if the status update caused a notification to be sent)
   *
   * note that setting a tag doesn't trigger onUpdate
   * @param param
   * @param tag
   */
  setTag = (param: string, tag: string) => {
    if (this.history[param]?.at(-1)) {
      this.history[param].at(-1)!.tag = tag;
    }
  };
}

export default HealthHistory;
