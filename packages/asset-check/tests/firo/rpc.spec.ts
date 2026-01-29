import { describe, expect, it, vi } from 'vitest';

import { FIRO_NATIVE_ASSET } from '../../lib/constants';
import { TestFiroRpcAssetHealthCheck } from './testFiro';

const mockClient = {
  post: vi.fn(),
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

describe('FiroRpcAssetHealthCheck', () => {
  const mockPost = (balance: string) => {
    mockClient.post.mockImplementationOnce(
      async (_url: string, body?: unknown) => {
        const { id } = body as { id: string };

        return {
          data: {
            jsonrpc: '2.0',
            id,
            result: {
              balance,
              received: balance,
            },
          },
        };
      },
    );
  };

  describe('update', () => {
    /**
     * @target FiroRpcAssetHealthCheck.update Should update FIRO amount using RPC api
     * @dependencies
     * - axios
     * @scenario
     * - mock return value of Firo RPC getaddressbalance api
     * - create new instance of TestFiroRpcAssetHealthCheck
     * - update the parameter
     * @expected
     * - The native firo asset amount should update successfully using RPC api
     */
    it('Should update FIRO amount using RPC api', async () => {
      const assetHealthCheckParam = new TestFiroRpcAssetHealthCheck(
        FIRO_NATIVE_ASSET,
        'THzVvKwY5dAD6gM5z4Mz3jG9RbqhkS8h7V',
        100n,
        10n,
        'http://localhost:8888',
        'firouser',
        'firopwd',
      );

      mockPost('1575000000');

      await assetHealthCheckParam.update();

      expect(assetHealthCheckParam.getTokenAmount()).toBe(1575000000n);
    });

    /**
     * @target FiroRpcAssetHealthCheck.update Should handle zero balance
     * @dependencies
     * - axios
     * @scenario
     * - mock return value of Firo RPC getaddressbalance api with zero balance
     * - create new instance of TestFiroRpcAssetHealthCheck
     * - update the parameter
     * @expected
     * - The native firo asset amount should be 0
     */
    it('Should handle zero balance', async () => {
      const assetHealthCheckParam = new TestFiroRpcAssetHealthCheck(
        FIRO_NATIVE_ASSET,
        'THzVvKwY5dAD6gM5z4Mz3jG9RbqhkS8h7V',
        100n,
        10n,
        'http://localhost:8888',
        'firouser',
        'firopwd',
      );

      mockPost('0');

      await assetHealthCheckParam.update();

      expect(assetHealthCheckParam.getTokenAmount()).toBe(0n);
    });
  });
});
