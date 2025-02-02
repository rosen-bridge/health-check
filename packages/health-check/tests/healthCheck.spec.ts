import { HealthStatusLevel } from '../lib';
import { TestHealthCheckParam } from './testHealthCheckParam';
import { TestHealthCheck } from './testHealthCheck';
import { describe, expect, it, vi } from 'vitest';

import { DEFAULT_HISTORY_CLEANUP_THRESHOLD } from '../lib/history/healthHistory';

describe('HealthCheck', () => {
  describe('register', () => {
    /**
     * @target HealthCheck.register should register new param
     * @dependencies
     * @scenario
     * - create new instance of HealthCheck
     * - register a custom param on it
     * @expected
     * - params length of class must be 1
     * - param first element must be created param
     */
    it('should register new param', () => {
      const healthCheck = new TestHealthCheck();
      const param = new TestHealthCheckParam('', HealthStatusLevel.HEALTHY);
      healthCheck.register(param);
      expect(healthCheck.getParams().length).toEqual(1);
      expect(healthCheck.getParams()[0]).toBe(param);
    });
  });

  describe('unregister', () => {
    /**
     * @target HealthCheck.unregister should unregister an already registered param
     * @dependencies
     * @scenario
     * - create new instance of HealthCheck
     * - create two params
     * - register params on healthCheck
     * - unregister second param id from healthCheck
     * @expected
     * - param length of class must be 1
     * - first element in params must be same as first param
     */
    it('should unregister an already registered param', () => {
      const healthCheck = new TestHealthCheck();
      const param1 = new TestHealthCheckParam('id1', HealthStatusLevel.HEALTHY);
      const param2 = new TestHealthCheckParam('id2', HealthStatusLevel.HEALTHY);
      healthCheck.register(param1);
      healthCheck.register(param2);
      healthCheck.unregister('id2');
      expect(healthCheck.getParams().length).toEqual(1);
      expect(healthCheck.getParams()[0]).toBe(param1);
    });

    /**
     * @target HealthCheck.unregister should do nothing if no param with expected ids registered
     * @dependencies
     * @scenario
     * - create new instance of HealthCheck
     * - create two params
     * - register params on healthCheck
     * - unregister an invalid id from healthCheck
     * @expected
     * - params list length must be 2
     * - both params in list must be registered params
     */
    it('should do nothing if no param with expected id registered', () => {
      const healthCheck = new TestHealthCheck();
      const param1 = new TestHealthCheckParam('id1', HealthStatusLevel.HEALTHY);
      const param2 = new TestHealthCheckParam('id2', HealthStatusLevel.HEALTHY);
      healthCheck.register(param1);
      healthCheck.register(param2);
      healthCheck.unregister('id3');
      expect(healthCheck.getParams().length).toEqual(2);
      expect(healthCheck.getParams()[0]).toBe(param1);
      expect(healthCheck.getParams()[1]).toBe(param2);
    });
  });

  describe('update', () => {
    /**
     * @target HealthCheck.update should call all params update function
     * @dependencies
     * @scenario
     * - create new instance of HealthCheck
     * - create two params
     * - register params on healthCheck
     * - call update
     * @expected
     * - update of each param must be called
     */
    it('should call all params update function', async () => {
      const healthCheck = new TestHealthCheck();
      const param1 = new TestHealthCheckParam('id1', HealthStatusLevel.HEALTHY);
      const param2 = new TestHealthCheckParam('id2', HealthStatusLevel.HEALTHY);
      healthCheck.register(param1);
      healthCheck.register(param2);
      await healthCheck.update();
      expect(param1.callsCount).toEqual(1);
      expect(param2.callsCount).toEqual(1);
    });

    /**
     * @target HealthCheck.update should update history
     * @dependencies
     * @scenario
     * - create new instance of HealthCheck
     * - create two params
     * - register params on healthCheck
     * - call update
     * @expected
     * - history should contain a new item for each of the params
     */
    it('should update history', async () => {
      const healthCheck = new TestHealthCheck();
      const param1 = new TestHealthCheckParam('id1', HealthStatusLevel.HEALTHY);
      const param2 = new TestHealthCheckParam('id2', HealthStatusLevel.BROKEN);
      healthCheck.register(param1);
      healthCheck.register(param2);
      await healthCheck.update();

      expect(healthCheck['healthHistory']!.getHistory().id1.length).toEqual(1);
      expect(healthCheck['healthHistory']!.getHistory().id1[0].result).toEqual(
        HealthStatusLevel.HEALTHY,
      );

      expect(healthCheck['healthHistory']!.getHistory().id2.length).toEqual(1);
      expect(healthCheck['healthHistory']!.getHistory().id2[0].result).toEqual(
        HealthStatusLevel.BROKEN,
      );
    });

    /**
     * @target `HealthCheck.update` should cleanup old history items
     * @dependencies
     * @scenario
     * - create new instance of HealthCheck
     * - create a param
     * - register the param on healthCheck
     * - call update
     * - advance time more than cleanup threshold (triggering cleanup of old
     * history items)
     * - call update again
     * @expected
     * - only one history item should exist
     */
    it('should cleanup the history object after some time', async () => {
      vi.useFakeTimers();

      const healthCheck = new TestHealthCheck();
      const param1 = new TestHealthCheckParam('id1', HealthStatusLevel.HEALTHY);
      healthCheck.register(param1);
      await healthCheck.update();

      vi.advanceTimersByTime(DEFAULT_HISTORY_CLEANUP_THRESHOLD * 1000 + 1);
      await healthCheck.update();

      expect(healthCheck['healthHistory']!.getHistory().id1.length).toEqual(1);

      vi.useRealTimers();
    });
  });

  describe('updateParam', () => {
    /**
     * @target HealthCheck.updateParam should update param with expected id
     * @dependencies
     * @scenario
     * - create new instance of HealthCheck
     * - create two params
     * - register params on healthCheck
     * - call refresh with param1 id
     * @expected
     * - param1 update function must be called
     * - param2 update must no be called
     */
    it('should update param with expected id', async () => {
      const healthCheck = new TestHealthCheck();
      const param1 = new TestHealthCheckParam('id1', HealthStatusLevel.HEALTHY);
      const param2 = new TestHealthCheckParam('id2', HealthStatusLevel.HEALTHY);
      healthCheck.register(param1);
      healthCheck.register(param2);
      await healthCheck.updateParam(param1.getId());
      expect(param1.callsCount).toEqual(1);
      expect(param2.callsCount).toEqual(0);
    });

    /**
     * @target HealthCheck.updateParam should update history
     * @dependencies
     * @scenario
     * - create new instance of HealthCheck
     * - create two params
     * - register params on healthCheck
     * - call refresh with param1 id
     * @expected
     * - param1 history should be updated
     * - param2 history shouldn't be updated
     */
    it('should update history', async () => {
      const healthCheck = new TestHealthCheck();
      const param1 = new TestHealthCheckParam('id1', HealthStatusLevel.HEALTHY);
      const param2 = new TestHealthCheckParam('id2', HealthStatusLevel.HEALTHY);
      healthCheck.register(param1);
      healthCheck.register(param2);
      await healthCheck.updateParam(param1.getId());

      expect(healthCheck['healthHistory']!.getHistory().id1.length).toEqual(1);
      expect(healthCheck['healthHistory']!.getHistory().id1[0].result).toEqual(
        HealthStatusLevel.HEALTHY,
      );

      expect(healthCheck['healthHistory']!.getHistory().id2).toEqual(undefined);
    });
  });

  describe('getOverallHealthStatus', () => {
    /**
     * @target HealthCheck.getOverallHealthStatus should return HEALTHY when all params are in healthy status
     * @dependencies
     * @scenario
     * - create new instance of HealthCheck
     * - create two params with HEALTHY status
     * - register params on healthCheck
     * - call getOverallHealthStatus
     * @expected
     * - returned status must be healthy
     */
    it('should return HEALTHY when all params are in healthy status', async () => {
      const healthCheck = new TestHealthCheck();
      const param1 = new TestHealthCheckParam('id1', HealthStatusLevel.HEALTHY);
      const param2 = new TestHealthCheckParam('id2', HealthStatusLevel.HEALTHY);
      healthCheck.register(param1);
      healthCheck.register(param2);
      const status = await healthCheck.getOverallHealthStatus();
      expect(status).toEqual(HealthStatusLevel.HEALTHY);
    });

    /**
     * @target HealthCheck.getOverallHealthStatus should return UNSTABLE when one or more UNSTABLE param and no BROKEN param available
     * @dependencies
     * @scenario
     * - create new instance of HealthCheck
     * - create two params with UNSTABLE status and one param with HEALTHY status
     * - register params on healthCheck
     * - call getOverallHealthStatus
     * @expected
     * - returned status must be UNSTABLE
     */
    it('should return UNSTABLE when one or more UNSTABLE param and no BROKEN param available', async () => {
      const healthCheck = new TestHealthCheck();
      const param1 = new TestHealthCheckParam('id1', HealthStatusLevel.HEALTHY);
      const param2 = new TestHealthCheckParam(
        'id1',
        HealthStatusLevel.UNSTABLE,
      );
      const param3 = new TestHealthCheckParam(
        'id1',
        HealthStatusLevel.UNSTABLE,
      );
      healthCheck.register(param1);
      healthCheck.register(param2);
      healthCheck.register(param3);
      const status = await healthCheck.getOverallHealthStatus();
      expect(status).toEqual(HealthStatusLevel.UNSTABLE);
    });

    /**
     * @target HealthCheck.getOverallHealthStatus should return BROKEN when one or more BROKEN param
     * @dependencies
     * @scenario
     * - create new instance of HealthCheck
     * - create two params with BROKEN status, one param with UNSTABLE status and one param with HEALTHY status
     * - register params on healthCheck
     * - call getOverallHealthStatus
     * @expected
     * - returned status must be BROKEN
     */
    it('should return BROKEN when one or more BROKEN param', async () => {
      const healthCheck = new TestHealthCheck();
      const param1 = new TestHealthCheckParam('id1', HealthStatusLevel.HEALTHY);
      const param2 = new TestHealthCheckParam(
        'id2',
        HealthStatusLevel.UNSTABLE,
      );
      const param3 = new TestHealthCheckParam(
        'id3',
        HealthStatusLevel.UNSTABLE,
      );
      const param4 = new TestHealthCheckParam('id4', HealthStatusLevel.BROKEN);
      healthCheck.register(param1);
      healthCheck.register(param2);
      healthCheck.register(param3);
      healthCheck.register(param4);
      const status = await healthCheck.getOverallHealthStatus();
      expect(status).toEqual(HealthStatusLevel.BROKEN);
    });
  });

  describe('getTrialErrors', () => {
    /**
     * @target HealthCheck.getOverallHealthStatus should return all trial error messages
     * @dependencies
     * @scenario
     * - create new instance of HealthCheck
     * - create two params with trial errors
     * - register params on healthCheck
     * - call getTrialErrors
     * @expected
     * - return all trial errors
     */
    it('should return all trial error messages', async () => {
      const healthCheck = new TestHealthCheck();
      const param1 = new TestHealthCheckParam('id1', HealthStatusLevel.HEALTHY);
      const param2 = new TestHealthCheckParam(
        'id2',
        HealthStatusLevel.UNSTABLE,
        'error1',
      );
      const param3 = new TestHealthCheckParam(
        'id3',
        HealthStatusLevel.BROKEN,
        'error2',
      );
      const param4 = new TestHealthCheckParam(
        'id3',
        HealthStatusLevel.BROKEN,
        undefined,
      );
      healthCheck.register(param1);
      healthCheck.register(param2);
      healthCheck.register(param3);
      healthCheck.register(param4);
      const trialErrors = await healthCheck.getTrialErrors();
      expect(trialErrors).toEqual(['error1', 'error2']);
    });
  });

  describe('getHealthStatusFor', () => {
    /**
     * @target HealthCheck.getHealthStatusFor should return detail status of selected param
     * @dependencies
     * @scenario
     * - create new instance of HealthCheck
     * - create one param with BROKEN status, one param with UNSTABLE status and one param with HEALTHY status
     * - register params on healthCheck
     * - call getHealthStatusOneParam with HEALTHY status param
     * @expected
     * - result must not be undefined
     * - returned status must be HEALTHY
     */
    it('should return detail status of selected param', async () => {
      const healthCheck = new TestHealthCheck();
      const param1 = new TestHealthCheckParam('id1', HealthStatusLevel.HEALTHY);
      const param2 = new TestHealthCheckParam(
        'id2',
        HealthStatusLevel.UNSTABLE,
        'description 2',
      );
      const param3 = new TestHealthCheckParam(
        'id3',
        HealthStatusLevel.BROKEN,
        'description 3',
      );
      healthCheck.register(param3);
      healthCheck.register(param2);
      healthCheck.register(param1);
      const result = await healthCheck.getHealthStatusWithParamId('id1');
      if (result !== undefined) {
        expect(result.status).toEqual(HealthStatusLevel.HEALTHY);
      }
      expect(result).toBeDefined();
    });

    /**
     * @target HealthCheck.getHealthStatusFor should return undefined when param is not registered
     * @dependencies
     * @scenario
     * - create new instance of HealthCheck
     * - create one param with UNSTABLE status and one param with HEALTHY status
     * - register params on healthCheck
     * - call getHealthStatusOneParam with random id (not registered)
     * @expected
     * - result must be undefined
     */
    it('should return undefined when param is not registered', async () => {
      const healthCheck = new TestHealthCheck();
      const param1 = new TestHealthCheckParam('id1', HealthStatusLevel.HEALTHY);
      const param2 = new TestHealthCheckParam(
        'id2',
        HealthStatusLevel.UNSTABLE,
        'description 2',
      );
      healthCheck.register(param1);
      healthCheck.register(param2);
      const result = await healthCheck.getHealthStatusWithParamId('id3');
      expect(result).toBeUndefined();
    });
  });

  describe('getHealthStatus', () => {
    /**
     * @target HealthCheck.getHealthStatus
     * @dependencies
     * @scenario
     * - create new instance of HealthCheck
     * - create one param with BROKEN status, one param with UNSTABLE status and one param with HEALTHY status
     * - register params on healthCheck
     * - call getHealthStatus
     * @expected
     * - result list must be 3
     * - for each registered param:
     *   - one result must be in output list
     *   - selected result must have same status as param status
     *   - selected result must have same description as param description
     */
    it('should return a list contain all params health status with description', async () => {
      const healthCheck = new TestHealthCheck();
      const param1 = new TestHealthCheckParam('id1', HealthStatusLevel.HEALTHY);
      const param2 = new TestHealthCheckParam(
        'id2',
        HealthStatusLevel.UNSTABLE,
        'description 2',
      );
      const param3 = new TestHealthCheckParam(
        'id3',
        HealthStatusLevel.BROKEN,
        'description 3',
      );
      healthCheck.register(param1);
      healthCheck.register(param2);
      healthCheck.register(param3);
      const result = await healthCheck.getHealthStatus();
      expect(result.length).toEqual(3);
      const params = [param1, param2, param3];
      for (const param of params) {
        const resultRow = result.filter((item) => item.id === param.getId());
        expect(resultRow.length).toEqual(1);
        expect(resultRow[0].status).toEqual(await param.getHealthStatus());
        expect(resultRow[0].description).toEqual(await param.getDescription());
      }
    });
  });
});
