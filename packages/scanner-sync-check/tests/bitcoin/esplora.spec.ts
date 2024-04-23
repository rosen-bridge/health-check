import { describe, expect, it, vitest } from 'vitest';

import { TestBitcoinEsploraScannerHealthCheck } from './testBitcoin';
import { createDataSource } from '../utils';

describe('BitcoinEsploraScannerHealthCheck.getLastAvailableBlock', () => {
  /**
   * @target BitcoinEsploraScannerHealthCheck.update should return the last available block in network
   * @dependencies
   * - axios
   * @scenario
   * - mock return value of esplora current block height
   * - create new instance of BitcoinEsploraScannerHealthCheck
   * - update the parameter
   * @expected
   * - The block height should be correct
   */
  it('should return the last available block in network', async () => {
    const dataSource = await createDataSource();
    const scannerHealthCheckParam = new TestBitcoinEsploraScannerHealthCheck(
      dataSource,
      'scannerName',
      100,
      10,
      'url',
    );
    const mockedHeight = 1115;
    vitest
      .spyOn(scannerHealthCheckParam.getClient(), 'get')
      .mockResolvedValue({ data: mockedHeight });
    const height = await scannerHealthCheckParam.getLastAvailableBlock();
    expect(height).toEqual(mockedHeight);
  });
});
