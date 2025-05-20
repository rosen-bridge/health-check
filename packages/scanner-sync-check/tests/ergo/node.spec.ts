import { describe, expect, it, vitest } from 'vitest';

import { ErgoNodeScannerHealthCheck } from '../../lib';

vitest.mock('@rosen-clients/ergo-node');

describe('ErgoNodeScannerHealthCheck.getLastAvailableBlock', () => {
  /**
   * @target ErgoNodeScannerHealthCheck.getLastAvailableBlock Should return the last available block in network
   * @dependencies
   * - ergoNodeClientFactory
   * @scenario
   * - mock return value of node last block info
   * - create new instance of ErgoNodeScannerHealthCheck
   * - update the parameter
   * @expected
   * - The block height should be correct
   */
  it('Should return the last available block in network', async () => {
    const scannerHealthCheckParam = new ErgoNodeScannerHealthCheck(
      () => Promise.resolve(1115),
      () => Promise.resolve(1111),
      100,
      10,
    );
    const height = await scannerHealthCheckParam.getLastAvailableBlock();
    expect(height).toEqual(1115);
  });
});
