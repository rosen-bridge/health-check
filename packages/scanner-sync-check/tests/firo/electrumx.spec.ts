import { describe, expect, it, beforeEach } from 'vitest';

import { HealthStatusLevel } from '@rosen-bridge/health-check';

import { FiroElectrumXScannerHealthCheck } from '../../lib';

describe('FiroElectrumXScannerHealthCheck', () => {
  let scannerHealthCheckParam: FiroElectrumXScannerHealthCheck;

  beforeEach(() => {
    scannerHealthCheckParam = new FiroElectrumXScannerHealthCheck(
      async () => Promise.resolve({ height: 1111, timestamp: 289497 }),
      2,
      4,
      '127.0.0.1',
      50001,
      150,
    );
    scannerHealthCheckParam['lastBlockGap'] = 0;
  });

  describe('getHealthStatus', () => {
    /**
     * @target getHealthStatus should return HEALTHY when scanner and network are in sync
     * @dependencies
     * @scenario
     * - mock last block gap below warn threshold
     * - mock network height difference below warn threshold
     * - get health status
     * @expected
     * - The status should be HEALTHY
     */
    it('should return HEALTHY when scanner and network are in sync', () => {
      scannerHealthCheckParam['heightDifference'] = 1;

      const status = scannerHealthCheckParam.getHealthStatus();

      expect(status).toEqual(HealthStatusLevel.HEALTHY);
    });

    /**
     * @target getHealthStatus should return UNSTABLE when scanner is behind network warning threshold
     * @dependencies
     * @scenario
     * - mock last block gap below warn threshold
     * - mock network height difference above warn threshold
     * - get health status
     * @expected
     * - The status should be UNSTABLE
     */
    it('should return UNSTABLE when scanner is behind network warning threshold', () => {
      scannerHealthCheckParam['heightDifference'] = 3;

      const status = scannerHealthCheckParam.getHealthStatus();

      expect(status).toEqual(HealthStatusLevel.UNSTABLE);
    });

    /**
     * @target getHealthStatus should return BROKEN when scanner is behind network critical threshold
     * @dependencies
     * @scenario
     * - mock last block gap below warn threshold
     * - mock network height difference above critical threshold
     * - get health status
     * @expected
     * - The status should be BROKEN
     */
    it('should return BROKEN when scanner is behind network critical threshold', () => {
      scannerHealthCheckParam['heightDifference'] = 5;

      const status = scannerHealthCheckParam.getHealthStatus();

      expect(status).toEqual(HealthStatusLevel.BROKEN);
    });

    /**
     * @target getHealthStatus should return BROKEN when ElectrumX height check fails
     * @dependencies
     * @scenario
     * - mock last block gap below warn threshold
     * - mock ElectrumX height error
     * - get health status
     * @expected
     * - The status should be BROKEN
     */
    it('should return BROKEN when ElectrumX height check fails', () => {
      scannerHealthCheckParam['networkHeightError'] = 'connection refused';

      const status = scannerHealthCheckParam.getHealthStatus();

      expect(status).toEqual(HealthStatusLevel.BROKEN);
    });
  });
});
