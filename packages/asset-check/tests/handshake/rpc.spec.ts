import { describe, expect, it, vi } from 'vitest';

import { HANDSHAKE_NATIVE_ASSET } from '../../lib/constants';
import { TestHandshakeRpcAssetHealthCheck } from './testHandshake';

const mockClient = {
  get: vi.fn(),
};

/**
 * Mock the module BEFORE the class under test is instantiated.
 * This prevents RateLimitedAxios internals from loading.
 */
vi.mock('@rosen-clients/rate-limited-axios', () => ({
  default: {
    create: () => mockClient,
  },
}));

describe('HandshakeRpcAssetHealthCheck', () => {
  const mockGet = (coins: unknown) => {
    mockClient.get.mockResolvedValueOnce({ data: coins });
  };

  describe('update', () => {
    /**
     * @target HandshakeRpcAssetHealthCheck.update Should update HNS amount using RPC api
     * @dependencies
     * - axios
     * @scenario
     * - mock return value of Handshake RPC coin/address api
     * - create new instance of TestHandshakeRpcAssetHealthCheck
     * - update the parameter
     * @expected
     * - The native handshake asset amount should update successfully using RPC api
     */
    it('Should update HNS amount using RPC api', async () => {
      const assetHealthCheckParam = new TestHandshakeRpcAssetHealthCheck(
        HANDSHAKE_NATIVE_ASSET,
        'hs1q48ayeud97cjaux3xqx3zhmumdjw7ga7qdrrglf',
        100n,
        10n,
        'http://localhost:12037',
      );

      mockGet([
        {
          version: 0,
          height: 315256,
          value: 2000000000,
          address: 'hs1q48ayeud97cjaux3xqx3zhmumdjw7ga7qdrrglf',
          covenant: {
            type: 0,
            action: 'NONE',
            items: [],
          },
          coinbase: false,
          hash: '5988a220f577b9ff75c2af81d174f5ff0b73ca8ad3e7cf10e066d67186c5176a',
          index: 0,
        },
        {
          version: 0,
          height: 315300,
          value: 2000000000,
          address: 'hs1q48ayeud97cjaux3xqx3zhmumdjw7ga7qdrrglf',
          covenant: {
            type: 0,
            action: 'NONE',
            items: [],
          },
          coinbase: false,
          hash: 'ffaab95b75c3db650191920a69915e480ced19a8f58cba867382fc8163654299',
          index: 1,
        },
      ]);

      await assetHealthCheckParam.update();

      expect(assetHealthCheckParam.getTokenAmount()).toBe(4000000000n);
    });

    /**
     * @target HandshakeRpcAssetHealthCheck.update Should handle zero balance
     * @dependencies
     * - axios
     * @scenario
     * - mock return value of Handshake RPC coin/address api with empty array
     * - create new instance of TestHandshakeRpcAssetHealthCheck
     * - update the parameter
     * @expected
     * - The native handshake asset amount should be 0
     */
    it('Should handle zero balance', async () => {
      const assetHealthCheckParam = new TestHandshakeRpcAssetHealthCheck(
        HANDSHAKE_NATIVE_ASSET,
        'hs1qz3jhgnl4te6fqammkqz6lj96ywpwcfyqjjsy4r',
        100n,
        10n,
        'http://localhost:12037',
      );

      mockGet([]);

      await assetHealthCheckParam.update();

      expect(assetHealthCheckParam.getTokenAmount()).toBe(0n);
    });
  });
});
