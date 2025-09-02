import { describe, expect, it, vitest, beforeEach } from 'vitest';

import { CardanoOgmiosScannerHealthCheck } from '../../lib';
import { HealthStatusLevel } from '@rosen-bridge/health-check';

vitest.mock('@cardano-ogmios/client');

describe('CardanoOgmiosScannerHealthCheck', () => {
  /**
   * Creating a new instance of for all tests
   */
  let scannerHealthCheckParam: CardanoOgmiosScannerHealthCheck;
  beforeEach(async () => {
    scannerHealthCheckParam = new CardanoOgmiosScannerHealthCheck(
      async () => Promise.resolve({ height: 1111, timestamp: 289497 }),
      () => true,
      600,
      10000,
      20_000,
      15,
      1_000,
    );
  });

  describe('getHealthStatus', () => {
    /**
     * @target getHealthStatus should return HEALTHY block gap is less than warn block gap
     * @dependencies
     * @scenario
     * - mock lastBlockTime so that block gap is less than warn gap
     * - get health status
     * @expected
     * - The status should be HEALTHY
     */
    it(`should return HEALTHY block gap is less than warn block gap`, async () => {
      scannerHealthCheckParam['lastBlockGap'] = 5_000;
      const status = await scannerHealthCheckParam.getHealthStatus();
      expect(status).toBe(HealthStatusLevel.HEALTHY);
    });

    /**
     * @target getHealthStatus should return UNSTABLE when the block gap is more than warn block gap
     * @dependencies
     * @scenario
     * - mock lastBlockTime so that block gap is more than warn gap
     * - get health status
     * @expected
     * - The status should be UNSTABLE
     */
    it(`should return UNSTABLE when the block gap is more than warn block gap`, async () => {
      scannerHealthCheckParam['lastBlockGap'] = 30_000;
      const status = await scannerHealthCheckParam.getHealthStatus();
      expect(status).toBe(HealthStatusLevel.UNSTABLE);
    });

    /**
     * @target getHealthStatus should return UNSTABLE when block gap
     * is less than critical block gap
     * @dependencies
     * @scenario
     * - mock difference to more than warning threshold
     * - mock lastBlockTime so that block gap is less than warn gap
     * - get health status
     * @expected
     * - The status should be UNSTABLE
     */
    it(`should return UNSTABLE when block gap is less than critical
      block gap`, async () => {
      scannerHealthCheckParam['lastBlockGap'] = 50_000;
      const status = await scannerHealthCheckParam.getHealthStatus();
      expect(status).toEqual(HealthStatusLevel.UNSTABLE);
    });

    /**
     * @target getHealthStatus should return BROKEN when the block gap is more than critical block gap
     * @dependencies
     * @scenario
     * - mock lastBlockTime so that block gap is more than critical gap
     * - get health status
     * @expected
     * - The status should be BROKEN
     */
    it(`should return BROKEN when the block gap is more than critical block gap`, async () => {
      scannerHealthCheckParam['lastBlockGap'] = 3_000_000;
      const status = await scannerHealthCheckParam.getHealthStatus();
      expect(status).toEqual(HealthStatusLevel.BROKEN);
    });

    /**
     * @target getHealthStatus should return BROKEN when block gap is more than
     * critical threshold
     * @dependencies
     * @scenario
     * - mock lastBlockTime so that block gap is less than warn gap
     * - get health status
     * @expected
     * - The status should be BROKEN
     */
    it('should return BROKEN when block gap is more than critical threshold', async () => {
      scannerHealthCheckParam['lastBlockGap'] = 5 * 60 * 1000;
      const status = await scannerHealthCheckParam.getHealthStatus();
      expect(status).toEqual(HealthStatusLevel.BROKEN);
    });

    /**
     * @target getHealthStatus should return UNSTABLE when the ogmios client is not connected
     * @dependencies
     * @scenario
     * - get health status
     * @expected
     * - The status should be UNSTABLE
     */
    it('should return UNSTABLE when the ogmios client is not connected', async () => {
      const now = 1_000_000_000_000;
      vitest.spyOn(Date, 'now').mockReturnValue(now);
      scannerHealthCheckParam['disconnectionTime'] = Date.now() - 100;
      scannerHealthCheckParam['lastBlockGap'] = 0;
      const status = await scannerHealthCheckParam.getHealthStatus();
      expect(status).toEqual(HealthStatusLevel.UNSTABLE);
    });

    /**
     * @target getHealthStatus should return BROKEN when the ogmios client is not connected and the retrial time is passed
     * @dependencies
     * @scenario
     * - get health status
     * @expected
     * - The status should be BROKEN
     */
    it('should return BROKEN when the ogmios client is not connected and the retrial time is passed', async () => {
      scannerHealthCheckParam['disconnectionTime'] = Date.now() - 30000;
      scannerHealthCheckParam['lastBlockGap'] = 10_000;
      const status = await scannerHealthCheckParam.getHealthStatus();
      expect(status).toEqual(HealthStatusLevel.BROKEN);
    });
  });
});
