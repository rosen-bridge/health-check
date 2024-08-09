import { describe, expect, it, vitest } from 'vitest';

import { TestCardanoGraphQLScannerHealthCheck } from './testCardano';

describe('CardanoGraphQLScannerHealthCheck.getLastAvailableBlock', () => {
  /**
   * @target CardanoGraphQLScannerHealthCheck.update should return the last available block in network
   * @dependencies
   * - ApolloClient
   * @scenario
   * - mock return value of graphql last block info
   * - create new instance of CardanoGraphQLScannerHealthCheck
   * - update the parameter
   * @expected
   * - The block height should be correct
   */
  it('should return the last available block in network', async () => {
    const mockedCurrentHeightResult = {
      data: {
        cardano: {
          __typename: 'Cardano',
          tip: { __typename: 'Block', number: 1115, slotNo: '1114' },
        },
      },
      loading: false,
      networkStatus: 7,
    };

    const scannerHealthCheckParam = new TestCardanoGraphQLScannerHealthCheck(
      () => Promise.resolve(1111),
      'scannerName',
      100,
      10,
      'url',
    );
    vitest
      .spyOn(scannerHealthCheckParam.getClient(), 'query')
      .mockResolvedValue(mockedCurrentHeightResult);
    const height = await scannerHealthCheckParam.getLastAvailableBlock();
    expect(height).toEqual(1115);
  });
});
