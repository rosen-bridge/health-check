import { HealthStatusLevel } from '@rosen-bridge/health-check';
import { describe, expect, it, vitest } from 'vitest';

import { P2PNetworkHealthCheck, P2PNetworkHealthCheckOptions } from '../lib';

vitest.useFakeTimers();

const TIME_WINDOW = 10000;
const GUARDS_THRESHOLD = 7;
const GUARDS_HEALTHY_COUNT = GUARDS_THRESHOLD + 1;
const GUARDS_BROKEN_COUNT = GUARDS_THRESHOLD - 1;

/**
 * run a p2p network health check with healthy status
 * @param config
 * @returns the health check instance
 */
const runHealthyFixture = (config?: Partial<P2PNetworkHealthCheckOptions>) => {
  return new P2PNetworkHealthCheck({
    defectConfirmationTimeWindow: TIME_WINDOW,
    connectedGuardsHealthyThreshold: GUARDS_THRESHOLD,
    getConnectedGuards: () => GUARDS_HEALTHY_COUNT,
    getIsAtLeastOneRelayConnected: () => true,
    ...config,
  });
};

/**
 * run a p2p network health check and make it broken as a result of low
 * connected guards count
 * @param getConnectedGuards mock function to use as
 * `getConnectedGuards`
 * @returns the health check instance
 */
const runGuardsDefectFixture = (getConnectedGuards = vitest.fn()) => {
  const healthCheck = runHealthyFixture({
    getConnectedGuards,
  });

  getConnectedGuards.mockReturnValue(GUARDS_BROKEN_COUNT);
  healthCheck.update();
  vitest.advanceTimersByTime(TIME_WINDOW + 1);
  healthCheck.update();

  return healthCheck;
};

/**
 * run a p2p network health check and make it broken because the lack of a relay
 * connection
 * @returns the health check instance
 */
const runRelayDefectFixture = () => {
  const getIsAtLeastOneRelayConnected = vitest.fn();
  const healthCheck = runHealthyFixture({
    getIsAtLeastOneRelayConnected,
  });

  getIsAtLeastOneRelayConnected.mockReturnValue(false);
  healthCheck.update();
  vitest.advanceTimersByTime(TIME_WINDOW + 1);
  healthCheck.update();

  return healthCheck;
};

describe('P2PNetworkHealthCheck', () => {
  describe('update', () => {
    /**
     * @target P2PNetworkHealthCheck.update should change last updated time of
     * health check
     * @dependencies
     * @scenario
     * - run a healthy fixture
     * - update health check
     * @expected
     * - last update time of health check should equal current time
     */
    it('should change last updated time of health check', async () => {
      const now = Date.now();
      const healthCheck = runHealthyFixture();

      await healthCheck.update();

      const actualLastUpdatedTime = (
        await healthCheck.getLastUpdatedTime()
      )?.getTime();
      expect(actualLastUpdatedTime).toEqual(now);
    });

    /**
     * @target P2PNetworkHealthCheck.update should reset to healthy state if
     * both checks pass
     * @dependencies
     * @scenario
     * - run a guards defect fixture, making health check status broken
     * - mock `getConnectedGuards` to return a healthy count
     * - update health check
     * @expected
     * - health check status should equal healthy
     */
    it('should reset to healthy state if both checks pass', async () => {
      const getConnectedGuards = vitest.fn();
      const healthCheck = runGuardsDefectFixture(getConnectedGuards);

      getConnectedGuards.mockReturnValue(GUARDS_HEALTHY_COUNT);
      healthCheck.update();

      expect(await healthCheck.getHealthStatus()).toEqual(
        HealthStatusLevel.HEALTHY,
      );
    });

    /**
     * @target P2PNetworkHealthCheck.update should not change status to broken
     * within time window
     * @dependencies
     * @scenario
     * - run a healthy fixture
     * - mock `getConnectedGuards` to return a broken count
     * - update health check
     * - wait equal to half of time window
     * - update health check again
     * @expected
     * - health check status should remain healthy
     */
    it('should not change status to broken within time window', async () => {
      const getConnectedGuards = vitest.fn();
      const healthCheck = runHealthyFixture({
        getConnectedGuards,
      });

      getConnectedGuards.mockReturnValue(GUARDS_BROKEN_COUNT);
      healthCheck.update();
      vitest.advanceTimersByTime(TIME_WINDOW / 2);
      healthCheck.update();

      expect(await healthCheck.getHealthStatus()).toEqual(
        HealthStatusLevel.HEALTHY,
      );
    });

    /**
     * @target P2PNetworkHealthCheck.update should change status to broken after
     * time window if guards check does not pass
     * @dependencies
     * @scenario
     * - run a guard defect fixture
     * @expected
     * - health check status should equal broken
     */
    it('should change status to broken after time window if guards check does not pass', async () => {
      const healthCheck = runGuardsDefectFixture();

      expect(await healthCheck.getHealthStatus()).toEqual(
        HealthStatusLevel.BROKEN,
      );
    });

    /**
     * @target P2PNetworkHealthCheck.update should change status to broken after
     * time window if relay check does not pass
     * @dependencies
     * @scenario
     * - run a guard defect fixture
     * @expected
     * - health check status should equal broken
     */
    it('should change status to broken after time window if relay check does not pass', async () => {
      const healthCheck = runRelayDefectFixture();

      expect(await healthCheck.getHealthStatus()).toEqual(
        HealthStatusLevel.BROKEN,
      );
    });
  });

  describe('getDetails', () => {
    /**
     * @target P2PNetworkHealthCheck.getDetails should return `undefined` if
     * status is healthy
     * @dependencies
     * @scenario
     * - run a healthy fixture
     * @expected
     * - health check description should equal `undefined`
     */
    it('should return `undefined` if status is healthy', async () => {
      const healthCheck = runHealthyFixture();

      expect(await healthCheck.getDetails()).toBeUndefined();
    });

    /**
     * @target P2PNetworkHealthCheck.getDetails should return relay
     * description if defect relates to relay
     * @dependencies
     * @scenario
     * - run a relay defect fixture
     * @expected
     * - health check description should equal relay defect string
     */
    it('should return relay description if defect relates to relay', async () => {
      const healthCheck = runRelayDefectFixture();

      expect(await healthCheck.getDetails()).toEqual(
        'Not connected to any relay. Please check the relay address and your connection.',
      );
    });

    /**
     * @target P2PNetworkHealthCheck.getDetails should return guards
     * description if defect relates to guards
     * @dependencies
     * @scenario
     * - run a guards defect fixture
     * @expected
     * - health check description should equal guards defect string
     */
    it('should return guards description if defect relates to guards', async () => {
      const healthCheck = runGuardsDefectFixture();

      expect(await healthCheck.getDetails()).toEqual(
        `Connected to only ${GUARDS_BROKEN_COUNT} guards. At least ${GUARDS_THRESHOLD} connections is required. Please check the connection.`,
      );
    });
  });

  describe('getLastUpdatedTime', () => {
    /**
     * @target P2PNetworkHealthCheck.getLastUpdatedTime should return
     * `undefined` if `update` is not called yet
     * @dependencies
     * @scenario
     * - run a healthy fixture
     * @expected
     * - last updated time of health check should equal `undefined`
     */
    it('should return `undefined` if `update` is not called yet', async () => {
      const healthCheck = runHealthyFixture();

      expect(await healthCheck.getLastUpdatedTime()).toBeUndefined();
    });
  });
});
