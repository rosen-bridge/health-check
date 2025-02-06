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
      () => Promise.resolve(1111),
      'scannerName',
      10,
      100,
      30,
      300,
    );
  });

  describe('getHealthStatus', () => {
    /**
     * @target AbstractScannerHealthCheckParam.getHealthStatus should return
     * HEALTHY when difference is less than warning threshold and the block
     * delay is less than warning block time delay
     * @dependencies
     * @scenario
     * - mock difference is less than warning threshold
     * - mock lastBlockTime to be now
     * - get health status
     * @expected
     * - The status should be HEALTHY
     */
    it(`should return HEALTHY when difference is less than warning threshold and
      the block delay is less than warning block time delay`, async () => {
      scannerHealthCheckParam.setDifference(2);
      scannerHealthCheckParam.setLastBlockTime(Date.now());
      const status = await scannerHealthCheckParam.getHealthStatus();
      expect(status).toEqual(HealthStatusLevel.HEALTHY);
    });

    /**
     * @target AbstractScannerHealthCheckParam.getHealthStatus should return
     * UNSTABLE when difference is less than warning threshold and block delay
     * is more than warn block delay and less than critical block delay
     * @dependencies
     * @scenario
     * - mock difference to less than warning threshold
     * - mock lastBlockTime so that block delay be more than warn block delay
     * - get health status
     * @expected
     * - The status should be UNSTABLE
     */
    it(`should return UNSTABLE when difference is less than warning threshold 
      but block delay is more than warn block delay and less than critical block
      delay`, async () => {
      scannerHealthCheckParam.setDifference(20);
      scannerHealthCheckParam.setLastBlockTime(Date.now() - 40 * 1000);
      const status = await scannerHealthCheckParam.getHealthStatus();
      expect(status).toEqual(HealthStatusLevel.UNSTABLE);
    });

    /**
     * @target AbstractScannerHealthCheckParam.getHealthStatus should return
     * UNSTABLE when difference is more than warning threshold and less than
     * critical threshold and last block time is less than critical block delay
     * @dependencies
     * @scenario
     * - mock difference to more than warning threshold
     * - mock lastBlockTime so that block delay be more than critical block delay
     * - get health status
     * @expected
     * - The status should be UNSTABLE
     */
    it(`should return UNSTABLE when difference is more than warning threshold 
      and less than critical threshold and block delay is less than critical
      block delay`, async () => {
      scannerHealthCheckParam.setDifference(20);
      scannerHealthCheckParam.setLastBlockTime(Date.now() - 40 * 1000);
      const status = await scannerHealthCheckParam.getHealthStatus();
      expect(status).toEqual(HealthStatusLevel.UNSTABLE);
    });

    /**
     * @target AbstractScannerHealthCheckParam.getHealthStatus should return
     * BROKEN when difference is less than critical threshold but block delay is
     * more than critical block delay
     * @dependencies
     * @scenario
     * - mock difference to more than warning threshold
     * - mock lastBlockTime to be now
     * - get health status
     * @expected
     * - The status should be UNSTABLE
     */
    it(`should return BROKEN when difference is less than critical threshold but
      block delay is more than critical block delay`, async () => {
      scannerHealthCheckParam.setDifference(2);
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
     * - get health status
     * @expected
     * - The status should be BROKEN
     */
    it('should return BROKEN when difference is more than critical threshold', async () => {
      scannerHealthCheckParam.setDifference(200);
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
