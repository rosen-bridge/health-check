import { describe, expect, it } from 'vitest';

import { ErgoExplorerScannerHealthCheck } from '../../lib';

describe('ErgoScannerHealthCheck', () => {
  describe('ErgoExplorerScannerHealthCheck.getLastAvailableBlock', () => {
    /**
     * @target ErgoExplorerScannerHealthCheck.getLastAvailableBlock Should return the last available block in network
     * @dependencies
     * - ergoExplorerClientFactory
     * @scenario
     * - mock return value of explorer last block info
     * - create new instance of ErgoExplorerScannerHealthCheck
     * - update the parameter
     * @expected
     * - The block height should be correct
     */
    it('Should return the last available block in network', async () => {
      const scannerHealthCheckParam = new ErgoExplorerScannerHealthCheck(
        () => Promise.resolve(1115),
        () => Promise.resolve(1111),
        100,
        10,
      );
      const height = await scannerHealthCheckParam.getLastAvailableBlock();
      expect(height).toEqual(1115);
    });
  });
});
