import { describe, expect, it, vitest } from 'vitest';

import { TestCardanoBlockFrostScannerHealthCheck } from './TestCardano';
import { createDataSource } from '../Utils';
import { BlockFrostAPI } from '@blockfrost/blockfrost-js';

describe('CardanoBlockFrostScannerHealthCheck.getLastAvailableBlock', () => {
  /**
   * @target CardanoBlockFrostScannerHealthCheck.update should return the last available block in network
   * @dependencies
   * - BlockFrostAPI
   * @scenario
   * - mock return value of blockfrost last block info
   * - create new instance of CardanoBlockFrostScannerHealthCheck
   * - update the parameter
   * @expected
   * - The block height should be correct
   */
  it('should return the last available block in network', async () => {
    type blockLatestReturnType = Awaited<
      ReturnType<InstanceType<typeof BlockFrostAPI>['blocksLatest']>
    >;
    const dataSource = await createDataSource();
    const scannerHealthCheckParam = new TestCardanoBlockFrostScannerHealthCheck(
      dataSource,
      'scannerName',
      100,
      10,
      'url',
    );
    vitest
      .spyOn(scannerHealthCheckParam.getClient(), 'blocksLatest')
      .mockResolvedValue({ height: 1115 } as unknown as blockLatestReturnType);
    const height = await scannerHealthCheckParam.getLastAvailableBlock();
    expect(height).toEqual(1115);
  });
});
