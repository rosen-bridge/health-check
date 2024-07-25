import { expect, vi, describe, it } from 'vitest';

import HealthHistory, {
  DEFAULT_HISTORY_CLEANUP_THRESHOLD_MS,
} from '../../lib/history/healthHistory';

const param = 'param-xyz';

describe('HealthHistory', () => {
  describe('constructor', () => {
    /**
     * @target instantiation should cleanup the history object after some time
     * @dependencies
     * @scenario
     * - create a health history instance
     * - update history for a param
     * - wait for a while
     * @expected
     * - param history should be empty
     */
    it('should cleanup the history object after some time', () => {
      vi.useFakeTimers();

      const healthHistory = new HealthHistory();

      healthHistory.updateHistoryForParam(param, {
        result: 'unknown',
        timestamp: Date.now(),
      });
      vi.advanceTimersByTime(DEFAULT_HISTORY_CLEANUP_THRESHOLD_MS);

      expect(healthHistory.getHistory()[param]).toEqual([]);

      vi.useRealTimers();
    });
  });

  describe('updateHistoryForParam', () => {
    /**
     * @target `updateHistoryForParam` should add a new item to the history
     * @dependencies
     * @scenario
     * - create a health history instance
     * - set an update handler
     * - update history for a param twice
     * @expected
     * - after each update, the handler should be called with correct arguments
     */
    it('should add a new item to the history', () => {
      const updateHandler = vi.fn();
      const healthHistory = new HealthHistory({ updateHandler });

      const timestamp1 = 12345;
      healthHistory.updateHistoryForParam(param, {
        result: 'unknown',
        timestamp: timestamp1,
      });

      expect(updateHandler).toBeCalledWith(param, [
        {
          result: 'unknown',
          timestamp: timestamp1,
        },
      ]);

      const timestamp2 = 67890;
      healthHistory.updateHistoryForParam(param, {
        result: 'unknown',
        timestamp: timestamp2,
      });

      expect(updateHandler).toBeCalledWith(param, [
        {
          result: 'unknown',
          timestamp: timestamp1,
        },
        {
          result: 'unknown',
          timestamp: timestamp2,
        },
      ]);
    });
  });

  describe('setTag', () => {
    /**
     * @target `updateHistoryForParam` should set tag to the history head of a
     * param
     * @dependencies
     * @scenario
     * - create a health history instance
     * - update history for a param twice
     * - set a tag for the same param
     * @expected
     * - the last history item for the param should have the tag
     */
    it('should set tag to the history head of a param', () => {
      const timestamp1 = 12345;
      const timestamp2 = 67890;
      const tag = { id: 'hello world' };
      const healthHistory = new HealthHistory();

      healthHistory.updateHistoryForParam(param, {
        result: 'unknown',
        timestamp: timestamp1,
      });
      healthHistory.updateHistoryForParam(param, {
        result: 'unknown',
        timestamp: timestamp2,
      });
      healthHistory.setTag(param, tag);

      expect(healthHistory.getHistory()[param].at(-1)!.tag).toBe(tag);
    });
  });

  describe('onUpdate', () => {
    /**
     * @target `onUpdate` should call all of the update handlers
     * @dependencies
     * @scenario
     * - create an instance of health history
     * - register two updated handlers
     * - update history
     * @expected
     * - both updated handlers should get called
     */
    it('should call all of the update handlers', async () => {
      const updateHandler1 = vi.fn();
      const updateHandler2 = vi.fn();
      const healthHistory = new HealthHistory({
        updateHandler: updateHandler1,
      });
      healthHistory.onUpdate(updateHandler2);

      const timestamp1 = 12345;
      healthHistory.updateHistoryForParam(param, {
        result: 'unknown',
        timestamp: timestamp1,
      });

      expect(updateHandler1).toHaveBeenCalledOnce();
      expect(updateHandler2).toHaveBeenCalledOnce();
    });
  });
});
