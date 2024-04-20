import ergoNodeClientFactory from '@rosen-clients/ergo-node';
import { describe, expect, it, vitest } from 'vitest';

import { createDataSource } from '../Utils';
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
    vitest.mocked(ergoNodeClientFactory).mockReturnValue({
      getNodeInfo: async () => ({
        fullHeight: 1115,
      }),
    } as unknown as ReturnType<typeof ergoNodeClientFactory>);

    const dataSource = await createDataSource();
    const scannerHealthCheckParam = new ErgoNodeScannerHealthCheck(
      dataSource,
      'scannerName',
      100,
      10,
      'url',
    );
    const height = await scannerHealthCheckParam.getLastAvailableBlock();
    expect(height).toEqual(1115);
  });
});
