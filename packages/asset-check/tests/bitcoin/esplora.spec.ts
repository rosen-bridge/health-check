import { AxiosInstance } from 'axios';
import { describe, expect, it, vitest } from 'vitest';

import { BITCOIN_NATIVE_ASSET } from '../../lib/constants';
import { TestBitcoinEsploraAssetHealthCheck } from './testBitcoin';

describe('BitcoinEsploraAssetHealthCheck', () => {
  const mockGet = (client: AxiosInstance, result: unknown) => {
    vitest.spyOn(client, 'get').mockResolvedValue({ data: result });
  };

  describe('update', () => {
    /**
     * @target BitcoinEsploraAssetHealthCheck.update Should update BTC amount using esplora api
     * @dependencies
     * - axios
     * @scenario
     * - mock return value of esplora address api
     * - create new instance of BitcoinEsploraAssetHealthCheck
     * - update the parameter
     * @expected
     * - The native bitcoin asset amount should update successfully using esplora api
     */
    it('Should update BTC amount using esplora api', async () => {
      const assetHealthCheckParam = new TestBitcoinEsploraAssetHealthCheck(
        BITCOIN_NATIVE_ASSET,
        BITCOIN_NATIVE_ASSET,
        'address',
        100n,
        10n,
        'url',
      );
      mockGet(assetHealthCheckParam.getClient(), {
        address: 'bc1qlhlqd2lvdft9alekqndnplfsq6dj723gh49wrt',
        chain_stats: {
          funded_txo_count: 235,
          funded_txo_sum: 4993840244,
          spent_txo_count: 172,
          spent_txo_sum: 3953305887,
          tx_count: 236,
        },
        mempool_stats: {
          funded_txo_count: 0,
          funded_txo_sum: 0,
          spent_txo_count: 0,
          spent_txo_sum: 0,
          tx_count: 0,
        },
      });
      await assetHealthCheckParam.update();

      expect(assetHealthCheckParam.getTokenAmount()).toBe(1040534357n);
    });
  });
});
