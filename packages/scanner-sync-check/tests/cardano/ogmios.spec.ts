import { describe, expect, it, vitest, vi, beforeEach } from 'vitest';
import { createLedgerStateQueryClient } from '@cardano-ogmios/client';

import { CardanoOgmiosScannerHealthCheck } from '../../lib';
import { HealthStatusLevel } from '@rosen-bridge/health-check';
import { afterEach } from 'node:test';

vitest.mock('@cardano-ogmios/client');

describe('CardanoOgmiosScannerHealthCheck', () => {
  /**
   * Creating a new instance of for all tests
   */
  let scannerHealthCheckParam: CardanoOgmiosScannerHealthCheck;
  beforeEach(async () => {
    scannerHealthCheckParam = new CardanoOgmiosScannerHealthCheck(
      async () => Promise.resolve(1111),
      () => true,
      10,
      100,
      'url',
      123,
      5000,
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
      vi.mocked(createLedgerStateQueryClient).mockImplementation(async () => {
        return {
          networkBlockHeight: async () => 1115,
        } as unknown as ReturnType<typeof createLedgerStateQueryClient>;
      });
      const height = await scannerHealthCheckParam.getLastAvailableBlock();
      expect(height).toEqual(1115);
    });
  });

  describe('updateStatus', () => {
    beforeEach(() => {
      vi.useFakeTimers({ now: 1723451468275 });
    });
    afterEach(vi.useRealTimers);
    /**
     * @target updateStatus should update the height difference correctly
     * @dependencies
     * @scenario
     * - mock `getLastAvailableBlock`
     * - create new instance of CardanoOgmiosScannerHealthCheck
     * - update the parameter
     * @expected
     * - to update the height difference
     * - to set undefined to disconnectionTime
     */
    it('should return the last available block in network', async () => {
      vi.spyOn(
        scannerHealthCheckParam,
        'getLastAvailableBlock',
      ).mockResolvedValue(1115);
      await scannerHealthCheckParam.updateStatus();
      expect(scannerHealthCheckParam['difference']).toEqual(4);
      expect(scannerHealthCheckParam['disconnectionTime']).toEqual(undefined);
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
