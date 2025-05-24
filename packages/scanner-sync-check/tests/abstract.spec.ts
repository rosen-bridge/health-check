import { HealthStatusLevel } from '@rosen-bridge/health-check';
import { describe, expect, it, beforeAll, vitest } from 'vitest';

import { TestScannerHealthCheckParam } from './abstract.mock';

describe('AbstractScannerHealthCheckParam', () => {
  /**
   * Creating a new instance of AbstractScannerHealthCheckParam for all tests
   */
  let scannerHealthCheckParam: TestScannerHealthCheckParam;
  beforeAll(async () => {
    scannerHealthCheckParam = new TestScannerHealthCheckParam(
      () => Promise.resolve(1115),
      () => Promise.resolve(1111),
      10,
      100,
      10,
      100,
      3,
    );
  });

  describe('getHealthStatus', () => {
    /**
     * @target AbstractScannerHealthCheckParam.getHealthStatus should return
     * HEALTHY when difference is less than warning threshold and the block
     * gap is less than warning block time gap
     * @dependencies
     * @scenario
     * - mock difference is less than warning threshold
     * - mock lastBlockHeight and lastBlockTime to be now
     * - get health status
     * @expected
     * - The status should be HEALTHY
     */
    it(`should return HEALTHY when difference is less than warning threshold and
      the block gap is less than warning block time gap`, async () => {
      scannerHealthCheckParam.setDifference(2);
      scannerHealthCheckParam.setLastBlockTime(Date.now());
      scannerHealthCheckParam.setLastBlockHeight(100);
      const status = await scannerHealthCheckParam.getHealthStatus();
      expect(status).toEqual(HealthStatusLevel.HEALTHY);
    });

    /**
     * @target AbstractScannerHealthCheckParam.getHealthStatus should return
     * UNSTABLE when difference is less than warning threshold and block gap
     * is more than warn block gap and less than critical block gap
     * @dependencies
     * @scenario
     * - mock difference to less than warning threshold
     * - mock lastBlockHeight and lastBlockTime so that block gap be more than
     * warn block gap
     * - get health status
     * @expected
     * - The status should be UNSTABLE
     */
    it(`should return UNSTABLE when difference is less than warning threshold 
      but block gap is more than warn block gap and less than critical block
      gap`, async () => {
      scannerHealthCheckParam.setDifference(20);
      scannerHealthCheckParam.setLastBlockHeight(100);
      scannerHealthCheckParam.setLastBlockTime(Date.now() - 40 * 1000);
      const status = await scannerHealthCheckParam.getHealthStatus();
      expect(status).toEqual(HealthStatusLevel.UNSTABLE);
    });

    /**
     * @target AbstractScannerHealthCheckParam.getHealthStatus should return
     * UNSTABLE when difference is more than warning threshold and less than
     * critical threshold and last block gap is less than critical block gap
     * @dependencies
     * @scenario
     * - mock difference to more than warning threshold
     * - mock lastBlockHeight and lastBlockTime so that block gap be less than
     * critical block gap
     * - get health status
     * @expected
     * - The status should be UNSTABLE
     */
    it(`should return UNSTABLE when difference is more than warning threshold 
      and less than critical threshold and block gap is less than critical
      block gap`, async () => {
      scannerHealthCheckParam.setDifference(20);
      scannerHealthCheckParam.setLastBlockHeight(100);
      scannerHealthCheckParam.setLastBlockTime(Date.now() - 40 * 1000);
      const status = await scannerHealthCheckParam.getHealthStatus();
      expect(status).toEqual(HealthStatusLevel.UNSTABLE);
    });

    /**
     * @target AbstractScannerHealthCheckParam.getHealthStatus should return
     * BROKEN when difference is less than critical threshold but block gap is
     * more than critical block gap
     * @dependencies
     * @scenario
     * - mock difference to more than warning threshold
     * - mock lastBlockHeight and lastBlockTime so that block gap be more than
     * critical block gap
     * - get health status
     * @expected
     * - The status should be BROKEN
     */
    it(`should return BROKEN when difference is less than critical threshold but
      block gap is more than critical block gap`, async () => {
      scannerHealthCheckParam.setDifference(2);
      scannerHealthCheckParam.setLastBlockHeight(100);
      scannerHealthCheckParam.setLastBlockTime(Date.now() - 400 * 1000);
      const status = await scannerHealthCheckParam.getHealthStatus();
      expect(status).toEqual(HealthStatusLevel.BROKEN);
    });

    /**
     * @target AbstractScannerHealthCheckParam.getHealthStatus should return
     * BROKEN when difference is more than critical threshold
     * @dependencies
     * @scenario
     * - mock difference to less than critical threshold
     * - mock lastBlockHeight
     * - get health status
     * @expected
     * - The status should be BROKEN
     */
    it('should return BROKEN when difference is more than critical threshold', async () => {
      scannerHealthCheckParam.setDifference(200);
      scannerHealthCheckParam.setLastBlockHeight(100);
      const status = await scannerHealthCheckParam.getHealthStatus();
      expect(status).toEqual(HealthStatusLevel.BROKEN);
    });

    /**
     * @target AbstractScannerHealthCheckParam.getHealthStatus should return
     * BROKEN when last block height is undefined
     * @dependencies
     * @scenario
     * - mock difference to less than critical threshold
     * - get health status
     * @expected
     * - The status should be BROKEN
     */
    it('should return BROKEN when last block height is undefined', async () => {
      scannerHealthCheckParam.setDifference(0);
      const status = await scannerHealthCheckParam.getHealthStatus();
      expect(status).toEqual(HealthStatusLevel.BROKEN);
    });
  });

  describe('update', () => {
    /**
     * @target AbstractScannerHealthCheckParam.update should update the height
     * difference and last block time and height correctly
     * @dependencies
     * @scenario
     * - mock current time (Date.now())
     * - run test (call `update`)
     * @expected
     * - The difference should set correctly
     * - The last block time should be updated to now
     * - The last block height should be updated to last stored block
     */
    it('should update the height difference correctly', async () => {
      const currentTime = 1621411200000; // May 19, 2021 12:00:00 AM UTC
      vitest.spyOn(Date, 'now').mockReturnValue(currentTime);
      await scannerHealthCheckParam.update();
      expect(scannerHealthCheckParam.getDifference()).toEqual(4);
      expect(scannerHealthCheckParam['lastBlockTime']).toEqual(Date.now());
      expect(scannerHealthCheckParam['lastBlockHeight']).toEqual(1111);
    });

    /**
     * @target AbstractScannerHealthCheckParam.update should not change last
     * block time when the last block height is not changed
     * @dependencies
     * @scenario
     * - mock current time (Date.now())
     * - set last block height and time
     * - run test (call `update`)
     * @expected
     * - Not to change last block time
     */
    it('should update the height difference correctly', async () => {
      const currentTime = 1621411200000; // May 19, 2021 12:00:00 AM UTC
      vitest.spyOn(Date, 'now').mockReturnValue(currentTime);
      const lastBlockTime = 1621411200000 - 100000;
      scannerHealthCheckParam.setLastBlockHeight(1111);
      scannerHealthCheckParam.setLastBlockTime(lastBlockTime);
      await scannerHealthCheckParam.update();
      expect(scannerHealthCheckParam['lastBlockTime']).toEqual(lastBlockTime);
    });
  });
});
