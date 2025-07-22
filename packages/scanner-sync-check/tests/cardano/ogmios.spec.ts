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
     * @target getHealthStatus should return UNSTABLE when difference is less
     * than warning threshold but the block gap is more than warn block gap
     * @dependencies
     * @scenario
     * - mock difference to more than warning threshold
     * - mock lastBlockTime so that block gap is more than warn gap
     * - get health status
     * @expected
     * - The status should be UNSTABLE
     */
    it(`should return UNSTABLE when difference is less than warning threshold
      but the block gap is more than warn block gap`, async () => {
      scannerHealthCheckParam['difference'] = 2;
      scannerHealthCheckParam['lastBlockTime'] = Date.now() - 300_000;
      const status = await scannerHealthCheckParam.getHealthStatus();
      expect(status).toEqual(HealthStatusLevel.UNSTABLE);
    });

    /**
     * @target getHealthStatus should return UNSTABLE when difference is more
     * than warning threshold and less than critical threshold and block gap
     * is less than critical block gap
     * @dependencies
     * @scenario
     * - mock difference to more than warning threshold
     * - mock lastBlockTime so that block gap is less than warn gap
     * - get health status
     * @expected
     * - The status should be UNSTABLE
     */
    it(`should return UNSTABLE when difference is more than warning threshold
      and less than critical threshold and block gap is less than critical
      block gap`, async () => {
      scannerHealthCheckParam['difference'] = 20;
      scannerHealthCheckParam['lastBlockTime'] = Date.now();
      const status = await scannerHealthCheckParam.getHealthStatus();
      expect(status).toEqual(HealthStatusLevel.UNSTABLE);
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
     * @target getHealthStatus should return BROKEN when difference is more than
     * critical threshold
     * @dependencies
     * @scenario
     * - mock difference to less than critical threshold
     * - mock lastBlockTime so that block gap is less than warn gap
     * - get health status
     * @expected
     * - The status should be BROKEN
     */
    it('should return BROKEN when difference is more than critical threshold', async () => {
      scannerHealthCheckParam['difference'] = 200;
      scannerHealthCheckParam['lastBlockTime'] = Date.now();
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
});
