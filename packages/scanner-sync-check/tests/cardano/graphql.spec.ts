import { describe, expect, it } from 'vitest';

import { TestCardanoGraphQLScannerHealthCheck } from './testCardano';

describe('CardanoGraphQLScannerHealthCheck.getLastAvailableBlock', () => {
  /**
   * @target CardanoGraphQLScannerHealthCheck.update should return the last available block in network
   * @dependencies
   * - ApolloClient
   * @scenario
   * - mock return value of graphql last block height
   * - create new instance of CardanoGraphQLScannerHealthCheck
   * - update the parameter
   * @expected
   * - The block height should be correct
   */
  it('should return the last available block in network', async () => {
    const scannerHealthCheckParam = new TestCardanoGraphQLScannerHealthCheck(
      () => Promise.resolve(1115),
      () => Promise.resolve(1111),
      100,
      10,
    );
    const height = await scannerHealthCheckParam.getLastAvailableBlock();
    expect(height).toEqual(1115);
  });
});
