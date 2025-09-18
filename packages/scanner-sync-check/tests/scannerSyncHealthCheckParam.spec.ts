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
      () =>
        Promise.resolve({
          height: 1111,
          timestamp: Number(currentTime / 1000) - 20,
        }),
      1, // warn difference
      3, // critical difference
      30, // block time
      20, // scanner update interval
    );
  });

  describe('getHealthStatus', () => {
    /**
     * @target AbstractScannerHealthCheckParam.getHealthStatus should return HEALTHY
     * when block gap is less than warn threshold
     * @dependencies
     * @scenario
     * - mock lastBlockGap to be less than warn threshold
     * - get health status
     * @expected
     * - The status should be HEALTHY
     */
    it(`should return HEALTHY when block gap is less than warn threshold`, async () => {
      scannerHealthCheckParam.setLastBlockGap(20);
      const status = await scannerHealthCheckParam.getHealthStatus();
      expect(status).toEqual(HealthStatusLevel.HEALTHY);
    });

    /**
     * @target AbstractScannerHealthCheckParam.getHealthStatus should return
     * UNSTABLE when block gap is more than warn block gap
     * and less than critical block gap
     * @dependencies
     * @scenario
     * - mock lastBlockGap to be more than warn block gap and less than critical block gap
     * - get health status
     * @expected
     * - The status should be UNSTABLE
     */
    it(`should return UNSTABLE when block gap is more than warn block gap 
      and less than critical block gap`, async () => {
      scannerHealthCheckParam.setLastBlockGap(60);
      const status = await scannerHealthCheckParam.getHealthStatus();
      expect(status).toEqual(HealthStatusLevel.UNSTABLE);
    });

    /**
     * @target AbstractScannerHealthCheckParam.getHealthStatus should return
     * BROKEN when block gap is more than critical block gap
     * @dependencies
     * @scenario
     * - mock lastBlockGap so that block gap be more than critical block gap
     * - get health status
     * @expected
     * - The status should be BROKEN
     */
    it(`should return BROKEN when block gap is more than critical block gap`, async () => {
      scannerHealthCheckParam.setLastBlockGap(400);
      const status = await scannerHealthCheckParam.getHealthStatus();
      expect(status).toEqual(HealthStatusLevel.BROKEN);
    });

    /**
     * @target AbstractScannerHealthCheckParam.getHealthStatus should return
     * BROKEN when last block gap is undefined
     * @dependencies
     * @scenario
     * - not set lastBlockGap and leave it to be undefined
     * - get health status
     * @expected
     * - The status should be BROKEN
     */
    it('should return BROKEN when last block gap is undefined', async () => {
      const status = await scannerHealthCheckParam.getHealthStatus();
      expect(status).toEqual(HealthStatusLevel.BROKEN);
    });

    /**
     * @target AbstractScannerHealthCheckParam.getHealthStatus should return
     * HEALTHY when block gap is greater than max warnBlockTimeGap and less then 2 * scannerUpdateInterval
     * @dependencies
     * - ScannerHealthCheckParam instance
     * @scenario
     * - set lastBlockGap to a value larger than warnBlockTimeGap and smaller then 2 * scannerUpdateInterval
     * - call getHealthStatus
     * @expected
     * - The status should be HEALTHY
     */
    it('should return HEALTHY when block gap is greater than max warnBlockTimeGap and less then 2 * scannerUpdateInterval', async () => {
      scannerHealthCheckParam.setLastBlockGap(80);
      scannerHealthCheckParam.setScannerUpdateInterval(44);
      const status = await scannerHealthCheckParam.getHealthStatus();
      expect(status).toEqual(HealthStatusLevel.HEALTHY);
    });
  });

  describe('update', () => {
    /**
     * @target AbstractScannerHealthCheckParam.update should update last block time and height correctly
     * @dependencies
     * @scenario
     * - mock last block height and gap
     * - run test (call `update`)
     * @expected
     * - The last block height should be updated to last stored block
     * - The last block gap should be updated to the difference between now and the last stored block
     */
    it('should update the height and time correctly', async () => {
      scannerHealthCheckParam.setLastBlockHeight(1107);
      scannerHealthCheckParam.setLastBlockGap(70);
      await scannerHealthCheckParam.update();
      expect(scannerHealthCheckParam['lastBlockHeight']).toEqual(1111);
      expect(scannerHealthCheckParam['lastBlockGap']).toEqual(20);
    });
  });
});
