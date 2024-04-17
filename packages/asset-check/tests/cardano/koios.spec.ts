import cardanoKoiosClientFactory from '@rosen-clients/cardano-koios';
import { describe, expect, it, vitest } from 'vitest';

import { CARDANO_NATIVE_ASSET } from '../../lib/constants';
import { TestCardanoKoiosAssetHealthCheck } from './testCardano';

vitest.mock('@rosen-clients/cardano-koios');

describe('CardanoKoiosAssetHealthCheck', () => {
  describe('update', () => {
    /**
     * @target CardanoKoiosAssetHealthCheck.update Should update the token amount using koios api
     * @dependencies
     * - cardanoKoiosClientFactory
     * @scenario
     * - mock return value of koios token amount
     * - create new instance of CardanoKoiosAssetHealthCheck
     * - update the parameter
     * @expected
     * - The token amount should update successfully using koios api
     */
    it('Should update the token amount using koios api', async () => {
      vitest.mocked(cardanoKoiosClientFactory).mockReturnValue({
        postAddressAssets: async () => [
          {
            address: 'address',
            policy_id: 'policy_id',
            asset_name: 'asset_name',
            quantity: '1200',
          },
        ],
      } as unknown as ReturnType<typeof cardanoKoiosClientFactory>);
      const assetHealthCheckParam = new TestCardanoKoiosAssetHealthCheck(
        'policy_id.asset_name',
        'assetName',
        'address',
        100n,
        10n,
        'url',
      );
      await assetHealthCheckParam.update();

      expect(assetHealthCheckParam.getTokenAmount()).toBe(1200n);
    });

    /**
     * @target CardanoKoiosAssetHealthCheck.update Should update the ada amount using koios api
     * @dependencies
     * - cardanoKoiosClientFactory
     * @scenario
     * - mock return value of koios ada balance
     * - create new instance of CardanoKoiosAssetHealthCheck
     * - update the parameter
     * @expected
     * - The native cardano asset amount should update successfully using koios api
     */
    it('Should update the ada amount using koios api', async () => {
      vitest.mocked(cardanoKoiosClientFactory).mockReturnValue({
        postAddressInfo: async () => [
          {
            balance: 120000n,
          },
        ],
      } as unknown as ReturnType<typeof cardanoKoiosClientFactory>);
      const assetHealthCheckParam = new TestCardanoKoiosAssetHealthCheck(
        CARDANO_NATIVE_ASSET,
        CARDANO_NATIVE_ASSET,
        'address',
        100n,
        10n,
        'url',
      );
      await assetHealthCheckParam.update();

      expect(assetHealthCheckParam.getTokenAmount()).toBe(120000n);
    });
  });
});
