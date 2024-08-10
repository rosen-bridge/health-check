import { describe, expect, it, vitest, beforeAll } from 'vitest';
import { createLedgerStateQueryClient } from '@cardano-ogmios/client';

import { CardanoOgmiosScannerHealthCheck } from '../../lib';
import { HealthStatusLevel } from '@rosen-bridge/health-check';

vitest.mock('@cardano-ogmios/client');

describe('CardanoOgmiosScannerHealthCheck', () => {
  /**
   * Creating a new instance of for all tests
   */
  let scannerHealthCheckParam: CardanoOgmiosScannerHealthCheck;
  beforeAll(async () => {
    scannerHealthCheckParam = new CardanoOgmiosScannerHealthCheck(
      () => Promise.resolve(1111),
      () => true,
      'scannerName',
      10,
      100,
      'url',
      123,
    );
  });

  describe('getHealthStatus', () => {
    /**
     * @target getHealthStatus should return HEALTHY when difference is less than warning threshold
     * @dependencies
     * @scenario
     * - mock difference is less than warning threshold
     * - get health status
     * @expected
     * - The status should be HEALTHY
     */
    it('should return HEALTHY when difference is less than warning threshold', async () => {
      scannerHealthCheckParam['difference'] = 2;
      const status = await scannerHealthCheckParam.getHealthStatus();
      expect(status).toEqual(HealthStatusLevel.HEALTHY);
    });

    /**
     * @target getHealthStatus should return UNSTABLE when difference is more than warning threshold and less than critical threshold
     * @dependencies
     * @scenario
     * - mock difference to more than warning threshold
     * - get health status
     * @expected
     * - The status should be UNSTABLE
     */
    it('should return UNSTABLE when difference is more than warning threshold and less than critical threshold', async () => {
      scannerHealthCheckParam['difference'] = 20;
      const status = await scannerHealthCheckParam.getHealthStatus();
      expect(status).toEqual(HealthStatusLevel.UNSTABLE);
    });

    /**
     * @target getHealthStatus should return BROKEN when difference is more than critical threshold
     * @dependencies
     * @scenario
     * - mock difference to less than critical threshold
     * - get health status
     * @expected
     * - The status should be BROKEN
     */
    it('should return BROKEN when difference is more than critical threshold', async () => {
      scannerHealthCheckParam['difference'] = 200;
      const status = await scannerHealthCheckParam.getHealthStatus();
      expect(status).toEqual(HealthStatusLevel.BROKEN);
    });

    /**
     * @target getHealthStatus should return BROKEN when the ogmios client is not connected
     * @dependencies
     * @scenario
     * - mock difference to less than critical threshold
     * - get health status
     * @expected
     * - The status should be BROKEN
     */
    it('should return BROKEN when the ogmios client is not connected', async () => {
      const scannerParam = new CardanoOgmiosScannerHealthCheck(
        () => Promise.resolve(1111),
        () => false,
        'scannerName',
        100,
        10,
        'url',
        123,
      );
      const status = await scannerParam.getHealthStatus();
      expect(status).toEqual(HealthStatusLevel.BROKEN);
    });
  });

  describe('getLastAvailableBlock', () => {
    /**
     * @target getLastAvailableBlock should return the last available block in network
     * @dependencies
     * - cardanoKoiosClientFactory
     * @scenario
     * - mock return value of ogmios api
     * - create new instance of CardanoOgmiosScannerHealthCheck
     * - update the parameter
     * @expected
     * - The block height should be correct
     */
    it('should return the last available block in network', async () => {
      vitest
        .mocked(createLedgerStateQueryClient)
        .mockImplementation(async () => {
          return {
            networkBlockHeight: async () => 1115,
          } as unknown as ReturnType<typeof createLedgerStateQueryClient>;
        });
      const height = await scannerHealthCheckParam.getLastAvailableBlock();
      expect(height).toEqual(1115);
    });
  });
});
