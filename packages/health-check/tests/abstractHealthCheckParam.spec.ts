import { describe, expect, it, vi, afterEach, beforeEach } from 'vitest';
import { HealthStatusLevel } from '../lib';
import { TestHealthCheckParam } from './testHealthCheckParam';

describe('AbstractHealthCheckParam', () => {
  describe('update', () => {
    beforeEach(() => {
      vi.useFakeTimers({ now: 1723451468275 });
    });
    afterEach(() => {
      vi.useRealTimers();
    });
    /**
     * @target should update last update time
     * @dependencies
     * @scenario
     * - create new healthCheck parameter
     * - run test (call `update`)
     * @expected
     * - should update the last update time
     * - should update trial error message and time to undefined
     */
    it('should update last update time', async () => {
      const param = new TestHealthCheckParam('', HealthStatusLevel.HEALTHY);
      param['lastTrialErrorMessage'] = 'ErrorMessage';
      param['lastTrialErrorTime'] = new Date();
      await param.update();
      const now = Date.now();
      const actualLastUpdatedTime = (
        await param.getLastUpdatedTime()
      )?.getTime();
      expect(actualLastUpdatedTime).toEqual(now);
      expect(param.getLastTrialErrorMessage()).toBe(undefined);
      expect(param.getLastTrialErrorTime()).toBe(undefined);
    });

    /**
     * @target should not modify last update time and store error information when an error occurs
     * @dependencies
     * @scenario
     * - create new healthCheck parameter
     * - mock updateStatus to throw Error
     * - run test (call `update`)
     * @expected
     * - should not update the last update time
     * - should update trial error message
     */
    it('should not modify last update time and store error information when an error occurs', async () => {
      const param = new TestHealthCheckParam('', HealthStatusLevel.HEALTHY);
      param.updateStatus = () => {
        throw new Error('Error');
      };
      await param.update();
      const now = Date.now();
      const actualLastTrialErrorTime = param.getLastTrialErrorTime()?.getTime();
      expect(param.getLastUpdatedTime()).toEqual(undefined);
      expect(param.getLastTrialErrorMessage()).toBe('Error');
      expect(actualLastTrialErrorTime).toBe(now);
    });
  });
});
