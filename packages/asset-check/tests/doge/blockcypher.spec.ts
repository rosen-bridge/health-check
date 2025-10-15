import { describe, expect, it, vitest } from 'vitest';

import { Axios } from '@rosen-clients/rate-limited-axios';

import { DOGE_NATIVE_ASSET } from '../../lib/constants';
import { TestDogeBlockCypherAssetHealthCheck } from './testDoge';

describe('DogeBlockCypherAssetHealthCheck', () => {
  const mockGet = (client: Axios, result: unknown) => {
    vitest.spyOn(client, 'get').mockResolvedValue({ data: result });
  };

  describe('update', () => {
    /**
     * @target DogeBlockCypherAssetHealthCheck.update Should update DOGE amount using BlockCypher api
     * @dependencies
     * - axios
     * @scenario
     * - mock return value of BlockCypher address api
     * - create new instance of TestDogeBlockCypherAssetHealthCheck
     * - update the parameter
     * @expected
     * - The native dogecoin asset amount should update successfully using BlockCypher api
     */
    it('Should update DOGE amount using BlockCypher api', async () => {
      const assetHealthCheckParam = new TestDogeBlockCypherAssetHealthCheck(
        DOGE_NATIVE_ASSET,
        'address',
        100n,
        10n,
        'url',
      );
      mockGet(assetHealthCheckParam.getClient(), {
        address: 'DLPaeuaJi2JLUcvYHD4ddLxadwnGaVSt4p',
        total_received: 1000000000,
        total_sent: 300000000,
        balance: 700000000,
        unconfirmed_balance: 0,
        final_balance: 700000000,
        n_tx: 10,
        unconfirmed_n_tx: 0,
        final_n_tx: 10,
        txrefs: [],
      });
      await assetHealthCheckParam.update();

      expect(assetHealthCheckParam.getTokenAmount()).toBe(700000000n);
    });
  });
});
