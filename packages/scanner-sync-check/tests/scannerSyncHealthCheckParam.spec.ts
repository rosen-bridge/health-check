import { HealthStatusLevel } from '@rosen-bridge/health-check';
import { describe, expect, it, beforeAll, vitest } from 'vitest';

import { TestScannerHealthCheckParam } from './scannerSyncHealthCheckParam.mock';

describe('AbstractScannerHealthCheckParam', () => {
  /**
   * Creating a new instance of AbstractScannerHealthCheckParam for all tests
   */
  let scannerHealthCheckParam: TestScannerHealthCheckParam;
  beforeAll(async () => {
    const currentTime = 1621411200000; // milliseconds!
    vitest.spyOn(Date, 'now').mockReturnValue(currentTime);
    scannerHealthCheckParam = new TestScannerHealthCheckParam(
      'test-chain',
      () => Promise.resolve({ height: 1111, timestamp: Date.now() }),
      1000,
      3000,
      30,
      3000,
    );
  });

  describe('getHealthStatus', () => {
    /**
     * @target AbstractScannerHealthCheckParam.getHealthStatus should return HEALTHY
     * when block gap is less than warn threshold
     * @dependencies
     * @scenario
     * - mock lastBlockHeight and lastBlockTime to be now
     * - get health status
     * @expected
     * - The status should be HEALTHY
     */
    it(`should return HEALTHY when block gap is less than warn threshold`, async () => {
      scannerHealthCheckParam.setLastBlockHeight(1111);
      scannerHealthCheckParam.setLastBlockGap(20 * 1000);
      const status = await scannerHealthCheckParam.getHealthStatus();
      expect(status).toEqual(HealthStatusLevel.HEALTHY);
    });

    /**
     * @target AbstractScannerHealthCheckParam.getHealthStatus should return
     * UNSTABLE when block gap is more than warn block gap
     * and less than critical block gap
     * @dependencies
     * @scenario
     * - mock lastBlockHeight and lastBlockTime so that block gap be more than
     * warn block gap
     * - get health status
     * @expected
     * - The status should be UNSTABLE
     */
    it(`should return UNSTABLE when block gap is more than warn block gap 
      and less than critical block gap`, async () => {
      scannerHealthCheckParam.setLastBlockHeight(1111);
      scannerHealthCheckParam.setLastBlockGap(60 * 1000);
      const status = await scannerHealthCheckParam.getHealthStatus();
      expect(status).toEqual(HealthStatusLevel.UNSTABLE);
    });

    /**
     * @target AbstractScannerHealthCheckParam.getHealthStatus should return
     * UNSTABLE when last block gap is less than critical block gap
     * @dependencies
     * @scenario
     * - mock lastBlockHeight and lastBlockTime so that block gap be less than
     * critical block gap
     * - get health status
     * @expected
     * - The status should be UNSTABLE
     */
    it(`should return UNSTABLE when block gap is less than critical
      block gap`, async () => {
      scannerHealthCheckParam.setLastBlockHeight(100);
      scannerHealthCheckParam.setLastBlockGap(40 * 1000);
      const status = await scannerHealthCheckParam.getHealthStatus();
      expect(status).toEqual(HealthStatusLevel.UNSTABLE);
    });

    /**
     * @target AbstractScannerHealthCheckParam.getHealthStatus should return
     * BROKEN when block gap is more than critical block gap
     * @dependencies
     * @scenario
     * - mock lastBlockHeight and lastBlockTime so that block gap be more than
     * critical block gap
     * - get health status
     * @expected
     * - The status should be BROKEN
     */
    it(`should return BROKEN when block gap is more than critical block gap`, async () => {
      scannerHealthCheckParam.setLastBlockHeight(100);
      scannerHealthCheckParam.setLastBlockGap(400 * 1000);
      const status = await scannerHealthCheckParam.getHealthStatus();
      expect(status).toEqual(HealthStatusLevel.BROKEN);
    });

    /**
     * @target AbstractScannerHealthCheckParam.getHealthStatus should return
     * BROKEN when block gap is more than critical threshold
     * @dependencies
     * @scenario
     * - mock lastBlockTime
     * - mock lastBlockHeight
     * - get health status
     * @expected
     * - The status should be BROKEN
     */
    it('should return BROKEN when block gap is more than critical threshold', async () => {
      scannerHealthCheckParam.setLastBlockHeight(1111);
      scannerHealthCheckParam.setLastBlockGap(300 * 1000);
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
      const status = await scannerHealthCheckParam.getHealthStatus();
      expect(status).toEqual(HealthStatusLevel.BROKEN);
    });

    /**
     * @target getHealthStatus should return
     * UNSTABLE when block gap is greater than max(warnBlockTimeGap, 2 * updateInterval)
     * @dependencies
     * - ScannerHealthCheckParam instance
     * @scenario
     * - set lastBlockGap to a value larger than both warnBlockTimeGap and 2 * updateInterval
     * - call getHealthStatus
     * @expected
     * - The status should be UNSTABLE
     */
    it('should return UNSTABLE when block gap is greater than max(warnBlockTimeGap, 2 * updateInterval)', async () => {
      scannerHealthCheckParam.setLastBlockHeight(1111);
      scannerHealthCheckParam.setLastBlockGap(80_000);
      scannerHealthCheckParam.setInterval(30_000);
      const status = await scannerHealthCheckParam.getHealthStatus();
      expect(status).toEqual(HealthStatusLevel.UNSTABLE);
    });
  });

  describe('update', () => {
    /**
     * @target AbstractScannerHealthCheckParam.update should update last block time and height correctly
     * @dependencies
     * @scenario
     * - mock current time (Date.now())
     * - run test (call `update`)
     * @expected
     * - The last block time should be updated to now
     * - The last block height should be updated to last stored block
     */
    it('should update the height and time correctly', async () => {
      const currentTime = 1621411200; // May 19, 2021 12:00:00 AM UTC
      vitest.spyOn(Date, 'now').mockReturnValue(currentTime);
      scannerHealthCheckParam.setLastBlockHeight(1107);
      scannerHealthCheckParam.setLastBlockGap(20 * 1000);
      await scannerHealthCheckParam.update();
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
    it(' should not change last block time when the last block height is not changed', async () => {
      const currentTime = 1621411200000; // May 19, 2021 12:00:00 AM UTC
      vitest.spyOn(Date, 'now').mockReturnValue(currentTime);
      scannerHealthCheckParam.setLastBlockHeight(1111);
      scannerHealthCheckParam.setLastBlockGap(100000);
      await scannerHealthCheckParam.update();
    });
  });
});
