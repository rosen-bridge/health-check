import { expect, vi, describe, it } from 'vitest';

import HealthHistory from '../../lib/history/healthHistory';

const param = 'param-xyz';

describe('HealthHistory', () => {
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
     * @target `setTag` should set tag to the history head of a param
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

    /**
     * @target `setTag` should not trigger update handler
     * @dependencies
     * @scenario
     * - create a health history instance
     * - update history for a param
     * - clear call data of update handler mock
     * - set a tag for the same param
     * @expected
     * - the last history item for the param should have the tag
     */
    it('should not trigger update handler', () => {
      const updateHandler = vi.fn();
      const healthHistory = new HealthHistory({ updateHandler });

      healthHistory.updateHistoryForParam(param, {
        result: 'unknown',
        timestamp: 12345,
      });
      updateHandler.mockClear();
      healthHistory.setTag(param, { id: 'hello world' });

      /**
       * `setTag` is sync, so there is no need to wait before checking calls
       * count
       */
      expect(updateHandler).toHaveBeenCalledTimes(0);
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
