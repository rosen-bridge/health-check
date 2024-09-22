import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { HealthStatusLevel } from '@rosen-bridge/health-check';

import { EventProgressHealthCheckParam } from '../lib/eventProgress';
import {
  criticalThreshold,
  currentTimestamp,
  healthyEvents,
  stuckEvents,
  warnThreshold,
} from './testData';

describe('EventProgressHealthCheckParam', () => {
  beforeAll(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(currentTimestamp));
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  describe('getHealthStatus', () => {
    let eventProgressHealthCheckParam: EventProgressHealthCheckParam;
    beforeAll(() => {
      eventProgressHealthCheckParam = new EventProgressHealthCheckParam(
        () => Promise.resolve([]),
        warnThreshold,
        criticalThreshold,
      );
    });

    /**
     * @target EventProgressHealthCheckParam.getHealthStatus should return HEALTHY
     * when there is no stuck event
     * @dependencies
     * @scenario
     * - mock eventWithMaxTry to undefined
     * - get health status
     * @expected
     * - The status should be HEALTHY
     */
    it('should return HEALTHY when there is no stuck event', async () => {
      eventProgressHealthCheckParam['eventWithMaxTry'] = undefined;
      const status = await eventProgressHealthCheckParam.getHealthStatus();
      expect(status).toBe(HealthStatusLevel.HEALTHY);
    });

    /**
     * @target EventProgressHealthCheckParam.getHealthStatus should return UNSTABLE
     * when event stuck duration is more than warn threshold
     * @dependencies
     * @scenario
     * - mock eventWithMaxTry to exceed stuck duration warn threshold
     * - get health status
     * @expected
     * - The status should be UNSTABLE
     */
    it(`should return UNSTABLE when event stuck duration is more than warn threshold `, async () => {
      eventProgressHealthCheckParam['eventWithMaxTry'] = stuckEvents[0];
      const status = await eventProgressHealthCheckParam.getHealthStatus();
      expect(status).toBe(HealthStatusLevel.UNSTABLE);
    });

    /**
     * @target EventProgressHealthCheckParam.getHealthStatus should return UNSTABLE
     * when event stuck duration is more than critical threshold
     * @dependencies
     * @scenario
     * - mock eventWithMaxTry to exceed stuck duration critical threshold
     * - get health status
     * @expected
     * - The status should be BROKEN
     */
    it(`should return BROKEN when event stuck duration is more than critical threshold `, async () => {
      eventProgressHealthCheckParam['eventWithMaxTry'] = stuckEvents[3];
      const status = await eventProgressHealthCheckParam.getHealthStatus();
      expect(status).toBe(HealthStatusLevel.BROKEN);
    });
  });

  describe('updateStatus', () => {
    /**
     * @target EventProgressHealthCheckParam.updateStatus should update stuck
     * event list to an empty array
     * @dependencies
     * @scenario
     * - mock getActiveEvents to return healthy events
     * - run test (call `updateStatus`)
     * @expected
     * - should set stuckEvents to an empty array
     * - should set eventWithMaxTry to undefined
     */
    it('should update stuck event list to an empty array', () => {
      const eventProgressHealthCheckParam = new EventProgressHealthCheckParam(
        () => Promise.resolve(healthyEvents),
        warnThreshold,
        criticalThreshold,
      );
      eventProgressHealthCheckParam.updateStatus();
      expect(eventProgressHealthCheckParam['stuckEvents']).toEqual([]);
      expect(eventProgressHealthCheckParam['eventWithMaxTry']).toBeUndefined();
    });

    /**
     * @target EventProgressHealthCheckParam.updateStatus should update stuck
     * event list to contain stuck events
     * @dependencies
     * @scenario
     * - mock getActiveEvents to return healthy and stuck events
     * - run test (call `updateStatus`)
     * @expected
     * - should set stuckEvents to all stuck events
     * - should set eventWithMaxTry to oldest stuck event
     */
    it('should update stuck event list to contain stuck events', async () => {
      const eventProgressHealthCheckParam = new EventProgressHealthCheckParam(
        () => Promise.resolve([...healthyEvents, ...stuckEvents]),
        warnThreshold,
        criticalThreshold,
      );
      await eventProgressHealthCheckParam.updateStatus();
      expect(eventProgressHealthCheckParam['stuckEvents']).toEqual(stuckEvents);
      expect(eventProgressHealthCheckParam['eventWithMaxTry']).toEqual(
        stuckEvents[3],
      );
    });
  });

  describe('getStuckDetails', () => {
    let eventProgressHealthCheckParam: EventProgressHealthCheckParam;
    beforeAll(() => {
      eventProgressHealthCheckParam = new EventProgressHealthCheckParam(
        () => Promise.resolve([]),
        warnThreshold,
        criticalThreshold,
      );
    });

    /**
     * @target EventProgressHealthCheckParam.getStuckDetails should return warn
     * threshold and total stuck event count when there is no critical sign problem
     * @dependencies
     * @scenario
     * - mock getActiveEvents to return stuck events with low duration (warn threshold)
     * - run test (call `getStuckDetails`)
     * @expected
     * - should return warn threshold
     * - should return total number of stuck events
     */
    it(`should return warn threshold and total stuck event count when there is no critical sign problem`, () => {
      eventProgressHealthCheckParam['eventWithMaxTry'] = stuckEvents[1];
      eventProgressHealthCheckParam['stuckEvents'] = stuckEvents.slice(0, 2);
      const { stuckDuration, stuckEventCount } =
        eventProgressHealthCheckParam['getStuckDetails']()!;
      expect(stuckDuration).toEqual(100);
      expect(stuckEventCount).toEqual(2);
    });

    /**
     * @target EventProgressHealthCheckParam.getStuckDetails should return
     * critical threshold and number of events with critical stuck duration
     * @dependencies
     * @scenario
     * - mock getActiveEvents to return all stuck events
     * - run test (call `getStuckDetails`)
     * @expected
     * - should return critical threshold
     * - should return the number of events with critical stuck duration
     */
    it(`should return critical threshold and number of events with critical stuck duration`, () => {
      eventProgressHealthCheckParam['eventWithMaxTry'] = stuckEvents[3];
      eventProgressHealthCheckParam['stuckEvents'] = stuckEvents;
      const { stuckDuration, stuckEventCount } =
        eventProgressHealthCheckParam['getStuckDetails']()!;
      expect(stuckDuration).toEqual(1000);
      expect(stuckEventCount).toEqual(2);
    });
  });
});
