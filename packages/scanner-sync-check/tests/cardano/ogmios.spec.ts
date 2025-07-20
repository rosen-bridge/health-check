import {
  describe,
  expect,
  it,
  vitest,
  vi,
  beforeEach,
  afterEach,
} from 'vitest';

import { CardanoOgmiosScannerHealthCheck } from '../../lib';
import { HealthStatusLevel } from '@rosen-bridge/health-check';

vitest.mock('@cardano-ogmios/client');

describe('CardanoOgmiosScannerHealthCheck', () => {
  /**
   * Creating a new instance of for all tests
   */
  let scannerHealthCheckParam: CardanoOgmiosScannerHealthCheck;
  const fakeGetLastSavedBlock = async () => ({
    height: 1111,
    timestamp: Math.floor(Date.now() / 1000),
  });

  beforeEach(async () => {
    scannerHealthCheckParam = new CardanoOgmiosScannerHealthCheck(
      fakeGetLastSavedBlock,
      () => true,
      10,
      100,
      123,
      5000,
    );
  });

  describe('getHealthStatus', () => {
    /**
     * @target getHealthStatus should return HEALTHY when difference is less
     * than warning threshold and block gap is less than warn block gap
     * @dependencies
     * @scenario
     * - mock difference to less than warning threshold
     * - mock lastBlockTime so that block gap is less than warn gap
     * - get health status
     * @expected
     * - The status should be HEALTHY
     */
    it(`should return HEALTHY when difference is less than warning threshold and
      and block gap is less than warn block gap`, async () => {
      scannerHealthCheckParam['difference'] = 2;
      scannerHealthCheckParam['lastBlockTime'] = Date.now();
      const status = await scannerHealthCheckParam.getHealthStatus();
      expect(status).toEqual(HealthStatusLevel.HEALTHY);
    });

    /**
     * @target getHealthStatus should return BROKEN when difference is less than
     * critical threshold but the block gap is more than critical block gap
     * @dependencies
     * @scenario
     * - mock difference to less than critical threshold
     * - mock lastBlockTime so that block gap is more than critical gap
     * - get health status
     * @expected
     * - The status should be BROKEN
     */
    it(`should return BROKEN when difference is less than critical threshold but
      the block gap is more than critical block gap`, async () => {
      scannerHealthCheckParam['difference'] = 20;
      scannerHealthCheckParam['lastBlockTime'] = Date.now() - 3_000_000;
      const status = await scannerHealthCheckParam.getHealthStatus();
      expect(status).toEqual(HealthStatusLevel.BROKEN);
    });

    /**
     * @target getHealthStatus should return UNSTABLE when the ogmios client is not connected
     * @dependencies
     * @scenario
     * - mock difference to less than critical threshold
     * - get health status
     * @expected
     * - The status should be UNSTABLE
     */
    it('should return UNSTABLE when the ogmios client is not connected', async () => {
      scannerHealthCheckParam['difference'] = 20;
      scannerHealthCheckParam['disconnectionTime'] = Date.now() - 100;
      const status = await scannerHealthCheckParam.getHealthStatus();
      expect(status).toEqual(HealthStatusLevel.UNSTABLE);
    });

    /**
     * @target getHealthStatus should return BROKEN when the ogmios client is not connected and the retrial time is passed
     * @dependencies
     * @scenario
     * - mock difference to less than critical threshold
     * - get health status
     * @expected
     * - The status should be BROKEN
     */
    it('should return BROKEN when the ogmios client is not connected and the retrial time is passed', async () => {
      scannerHealthCheckParam['difference'] = 20;
      scannerHealthCheckParam['disconnectionTime'] = Date.now() - 10000;
      const status = await scannerHealthCheckParam.getHealthStatus();
      expect(status).toEqual(HealthStatusLevel.BROKEN);
    });
  });

  describe('updateStatus', () => {
    beforeEach(() => {
      vi.useFakeTimers({ now: 1723451468275 });
    });
    afterEach(() => {
      vi.useRealTimers();
    });

    /**
     * @target updateStatus should set the disconnectionTime for the first time
     * @dependencies
     * @scenario
     * - mock `getLastAvailableBlock`
     * - create new instance of CardanoOgmiosScannerHealthCheck
     * - update the parameter
     * @expected
     * - to set disconnectionTime to current time when it is undefined
     */
    it('should set the disconnectionTime for the first time', async () => {
      scannerHealthCheckParam['connected'] = vi.fn().mockReturnValue(false);
      scannerHealthCheckParam['disconnectionTime'] = undefined;
      await scannerHealthCheckParam.updateStatus();
      expect(scannerHealthCheckParam['disconnectionTime']).toEqual(Date.now());
    });

    /**
     * @target updateStatus should not change disconnectionTime when client is still disconnected
     * @dependencies
     * @scenario
     * - mock `getLastAvailableBlock`
     * - create new instance of CardanoOgmiosScannerHealthCheck
     * - update the parameter
     * @expected
     * - not to change disconnectionTime when still is disconnected
     */
    it('should not change disconnectionTime when client is still disconnected', async () => {
      scannerHealthCheckParam['connected'] = vi.fn().mockReturnValue(false);
      scannerHealthCheckParam['disconnectionTime'] = Date.now() - 1000;
      await scannerHealthCheckParam.updateStatus();
      expect(scannerHealthCheckParam['disconnectionTime']).toEqual(
        Date.now() - 1000,
      );
    });
  });
});
