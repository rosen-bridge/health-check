import { HealthStatusLevel } from '@rosen-bridge/health-check';
import { describe, expect, it, beforeAll } from 'vitest';

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
    );
  });

  describe('getHealthStatus', () => {
    /**
     * @target AbstractScannerHealthCheckParam.getHealthStatus should return HEALTHY when difference is less than warning threshold
     * @dependencies
     * @scenario
     * - mock difference is less than warning threshold
     * - get health status
     * @expected
     * - The status should be HEALTHY
     */
    it('should return HEALTHY when difference is less than warning threshold', async () => {
      scannerHealthCheckParam.setDifference(2);
      const status = await scannerHealthCheckParam.getHealthStatus();
      expect(status).toEqual(HealthStatusLevel.HEALTHY);
    });

    /**
     * @target AbstractScannerHealthCheckParam.getHealthStatus Should return UNSTABLE when difference is more than warning threshold and less than critical threshold
     * @dependencies
     * @scenario
     * - mock difference to more than warning threshold
     * - get health status
     * @expected
     * - The status should be UNSTABLE
     */
    it('should return UNSTABLE when difference is more than warning threshold and less than critical threshold', async () => {
      scannerHealthCheckParam.setDifference(20);
      const status = await scannerHealthCheckParam.getHealthStatus();
      expect(status).toEqual(HealthStatusLevel.UNSTABLE);
    });

    /**
     * @target AbstractScannerHealthCheckParam.getHealthStatus Should return the should return BROKEN when difference is more than critical threshold
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
     * @target AbstractScannerHealthCheckParam.update should update the height difference correctly
     * @dependencies
     * @scenario
     * - save a block in database
     * - update the parameter
     * - check the difference
     * @expected
     * - The difference should set correctly
     */
    it('should update the height difference correctly', async () => {
      await scannerHealthCheckParam.update();
      expect(scannerHealthCheckParam.getDifference()).toEqual(4);
    });
  });
});
