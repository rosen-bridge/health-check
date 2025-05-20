import { describe, expect, it } from 'vitest';

import { TestCardanoBlockFrostScannerHealthCheck } from './testCardano';

describe('CardanoBlockFrostScannerHealthCheck.getLastAvailableBlock', () => {
  /**
   * @target CardanoBlockFrostScannerHealthCheck.update should return the last available block in network
   * @dependencies
   * - BlockFrostAPI
   * @scenario
   * - mock return value of blockfrost last block height
   * - create new instance of CardanoBlockFrostScannerHealthCheck
   * - update the parameter
   * @expected
   * - The block height should be correct
   */
  it('should return the last available block in network', async () => {
    const scannerHealthCheckParam = new TestCardanoBlockFrostScannerHealthCheck(
      () => Promise.resolve(1115),
      () => Promise.resolve(1111),
      100,
      10,
    );
    const height = await scannerHealthCheckParam.getLastAvailableBlock();
    expect(height).toEqual(1115);
  });
});
