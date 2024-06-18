import { describe, expect, it, vitest } from 'vitest';

import { TestBitcoinRPCScannerHealthCheck } from './testBitcoin';
import { createDataSource } from '../utils';

describe('BitcoinRPCScannerHealthCheck.getLastAvailableBlock', () => {
  /**
   * @target BitcoinRPCScannerHealthCheck.update should return the last
   * available block in network
   * @dependencies
   * - axios
   * @scenario
   * - mock return value of RPC `getchaintips`
   * - create new instance of BitcoinRPCScannerHealthCheck
   * - update the parameter
   * @expected
   * - The block height should be correct
   */
  it('should return the last available block in network', async () => {
    const dataSource = await createDataSource();
    const scannerHealthCheckParam = new TestBitcoinRPCScannerHealthCheck(
      dataSource,
      'scannerName',
      100,
      10,
      'url',
    );
    scannerHealthCheckParam['generateRandomId'] = () =>
      '19774cdc6bc663926590dc2fe7bfe77ba57a5343aaa16db5ffc377e95663fd4e';
    const mockedHeight = 1115;
    vitest
      .spyOn(scannerHealthCheckParam.getClient(), 'post')
      .mockResolvedValue({
        data: {
          result: [
            {
              height: mockedHeight,
              status: 'active',
            },
            {
              height: mockedHeight - 10,
              status: 'invalid',
            },
          ],
          id: '19774cdc6bc663926590dc2fe7bfe77ba57a5343aaa16db5ffc377e95663fd4e',
        },
      });
    const height = await scannerHealthCheckParam.getLastAvailableBlock();
    expect(height).toEqual(mockedHeight);
  });
});
