import ergoExplorerClientFactory from '@rosen-clients/ergo-explorer';
import { beforeEach, describe, expect, it, vitest } from 'vitest';

import { TestErgoExplorerAssetHealthCheck } from './testErgo';
import { ERGO_NATIVE_ASSET } from '../../lib/constants';

vitest.mock('@rosen-clients/ergo-explorer');

describe('ErgoExplorerAssetHealthCheck', () => {
  describe('update', () => {
    /**
     * Mock return value of explorer address total balance
     */
    beforeEach(() => {
      vitest.mocked(ergoExplorerClientFactory).mockReturnValue({
        v1: {
          getApiV1AddressesP1BalanceConfirmed: async () => ({
            tokens: [{ tokenId: 'assetId', amount: 1200n }],
            nanoErgs: 120000n,
          }),
        },
      } as unknown as ReturnType<typeof ergoExplorerClientFactory>);
    });

    /**
     * @target ErgoExplorerAssetHealthCheck.update Should update the token amount using explorer
     * @dependencies
     * - ergoExplorerClientFactory
     * @scenario
     * - create new instance of ErgoExplorerAssetHealthCheck
     * - update the parameter
     * @expected
     * - The token amount update successfully using explorer api
     */
    it('Should update the token amount using explorer', async () => {
      const assetHealthCheckParam = new TestErgoExplorerAssetHealthCheck(
        'assetId',
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
     * @target ErgoExplorerAssetHealthCheck.update Should update the erg amount using explorer
     * @dependencies
     * - ergoExplorerClientFactory
     * @scenario
     * - create new instance of ErgoExplorerAssetHealthCheck
     * - update the parameter
     * @expected
     * - The erg amount should update successfully using explorer api
     */
    it('Should update the erg amount using explorer', async () => {
      const assetHealthCheckParam = new TestErgoExplorerAssetHealthCheck(
        ERGO_NATIVE_ASSET,
        ERGO_NATIVE_ASSET,
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
