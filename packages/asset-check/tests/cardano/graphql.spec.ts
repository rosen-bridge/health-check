import { ApolloClient, NormalizedCacheObject } from '@apollo/client/core';
import { describe, expect, it, vitest } from 'vitest';

import { TestCardanoGraphQLAssetHealthCheck } from './testCardano';
import { addressAssetsResult } from './graphglTestData';
import { CARDANO_NATIVE_ASSET } from '../../lib/constants';

describe('CardanoGraphQLAssetHealthCheckParam', () => {
  const mockQueryResult = (
    client: ApolloClient<NormalizedCacheObject>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    result: any,
  ) => {
    vitest.spyOn(client, 'query').mockResolvedValue(result);
  };

  describe('update', () => {
    /**
     * @target CardanoGraphQLAssetHealthCheckParam.update should update the token amount using koios api
     * @dependencies
     * - ApolloClient
     * @scenario
     * - create new instance of CardanoGraphQLAssetHealthCheckParam
     * - mock return value of graphql address assets
     * - update the parameter
     * @expected
     * - The token amount should update successfully using graphql api
     */
    it('should update the token amount using graphql api', async () => {
      const assetHealthCheckParam = new TestCardanoGraphQLAssetHealthCheck(
        'policy_id.asset_name',
        'assetName',
        'address',
        100n,
        10n,
        'url',
      );
      mockQueryResult(assetHealthCheckParam.getClient(), addressAssetsResult);
      await assetHealthCheckParam.update();

      expect(assetHealthCheckParam.getTokenAmount()).toBe(1200n);
    });

    /**
     * @target CardanoGraphQLAssetHealthCheckParam.update should update the ada amount using graphql api
     * @dependencies
     * - ApolloClient
     * @scenario
     * - create new instance of CardanoGraphQLAssetHealthCheckParam
     * - mock return value of graphql address assets
     * - update the parameter
     * @expected
     * - The native cardano asset amount should update successfully using graphql api
     */
    it('should update the ada amount using graphql api', async () => {
      const assetHealthCheckParam = new TestCardanoGraphQLAssetHealthCheck(
        CARDANO_NATIVE_ASSET,
        CARDANO_NATIVE_ASSET,
        'address',
        100n,
        10n,
        'url',
      );
      mockQueryResult(assetHealthCheckParam.getClient(), addressAssetsResult);
      await assetHealthCheckParam.update();

      expect(assetHealthCheckParam.getTokenAmount()).toBe(120000n);
    });
  });
});
