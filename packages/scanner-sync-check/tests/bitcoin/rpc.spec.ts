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
        },
      });
    const height = await scannerHealthCheckParam.getLastAvailableBlock();
    expect(height).toEqual(mockedHeight);
  });
});
