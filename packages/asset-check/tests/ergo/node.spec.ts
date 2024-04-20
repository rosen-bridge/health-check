import ergoNodeClientFactory from '@rosen-clients/ergo-node';
import { beforeEach, describe, expect, it, vitest } from 'vitest';

import { TestErgoNodeAssetHealthCheck } from './testErgo';
import { ERGO_NATIVE_ASSET } from '../../lib/constants';

vitest.mock('@rosen-clients/ergo-node');

describe('ErgoNodeAssetHealthCheck', () => {
  describe('update', () => {
    /**
     * Mock return value of node address total balance
     */
    beforeEach(() => {
      vitest.mocked(ergoNodeClientFactory).mockReturnValue({
        getAddressBalanceTotal: async () => ({
          confirmed: {
            tokens: [{ tokenId: 'assetId', amount: 1200n }],
            nanoErgs: 120000n,
          },
        }),
      } as unknown as ReturnType<typeof ergoNodeClientFactory>);
    });

    /**
     * @target ErgoNodeAssetHealthCheck.update Should update the token amount using node
     * @dependencies
     * - ergoNodeClientFactory
     * @scenario
     * - create new instance of ErgoNodeAssetHealthCheck
     * - update the parameter
     * @expected
     * - The token amount should update successfully using node api
     */
    it('Should update the token amount using node', async () => {
      const assetHealthCheckParam = new TestErgoNodeAssetHealthCheck(
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
     * @target ErgoNodeAssetHealthCheck.update Should update the erg amount using node
     * @dependencies
     * - ergoNodeClientFactory
     * @scenario
     * - create new instance of ErgoNodeAssetHealthCheck
     * - update the parameter
     * @expected
     * - The erg amount should update successfully using node api
     */
    it('Should update the erg amount using node', async () => {
      const assetHealthCheckParam = new TestErgoNodeAssetHealthCheck(
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
