import { describe, expect, it, vitest } from 'vitest';

import { Axios } from '@rosen-clients/rate-limited-axios';

import { HANDSHAKE_NATIVE_ASSET } from '../../lib/constants';
import { TestHandshakeRpcAssetHealthCheck } from './testHandshake';

describe('HandshakeRpcAssetHealthCheck', () => {
  const mockGet = (client: Axios, result: unknown) => {
    vitest.spyOn(client, 'get').mockResolvedValue({ data: result });
  };

  describe('update', () => {
    it('should update HNS amount using RPC API', async () => {
      const assetHealthCheckParam = new TestHandshakeRpcAssetHealthCheck(
        HANDSHAKE_NATIVE_ASSET,
        'rs1qpu06wprkwleh579mureghcasjhu9uwge6pltn5',
        100n,
        10n,
        'url',
      );

      mockGet(assetHealthCheckParam.getClient(), [
        {
          version: 0,
          height: 69,
          value: 2000000000,
          address: 'rs1qpu06wprkwleh579mureghcasjhu9uwge6pltn5',
          covenant: {
            type: 0,
            action: 'NONE',
            items: [],
          },
          coinbase: true,
          hash: 'fcc1f0656b5e6a0856abf21424579b87c30bc30b89a3c3925923052cb636d80b',
          index: 0,
        },
        {
          version: 0,
          height: 74,
          value: 2000000000,
          address: 'rs1qpu06wprkwleh579mureghcasjhu9uwge6pltn5',
          covenant: {
            type: 0,
            action: 'NONE',
            items: [],
          },
          coinbase: true,
          hash: 'ffaab95b75c3db650191920a69915e480ced19a8f58cba867382fc8163654299',
          index: 0,
        },
      ]);

      await assetHealthCheckParam.updateStatus();

      // Balance = 2000000000 + 2000000000 = 4000000000
      expect(assetHealthCheckParam.getTokenAmount()).toBe(4000000000n);
    });

    it('should handle empty coin array', async () => {
      const assetHealthCheckParam = new TestHandshakeRpcAssetHealthCheck(
        HANDSHAKE_NATIVE_ASSET,
        'rs1qempty000000000000000000000000000000000',
        100n,
        10n,
        'url',
      );

      mockGet(assetHealthCheckParam.getClient(), []);

      await assetHealthCheckParam.updateStatus();

      expect(assetHealthCheckParam.getTokenAmount()).toBe(0n);
    });

    it('should sum multiple coins correctly', async () => {
      const assetHealthCheckParam = new TestHandshakeRpcAssetHealthCheck(
        HANDSHAKE_NATIVE_ASSET,
        'rs1qtest000000000000000000000000000000000',
        100n,
        10n,
        'url',
      );

      mockGet(assetHealthCheckParam.getClient(), [
        {
          version: 0,
          height: 100,
          value: 1500000000,
          address: 'rs1qtest000000000000000000000000000000000',
          covenant: {
            type: 0,
            action: 'NONE',
            items: [],
          },
          coinbase: false,
          hash: 'hash1',
          index: 0,
        },
        {
          version: 0,
          height: 200,
          value: 2500000000,
          address: 'rs1qtest000000000000000000000000000000000',
          covenant: {
            type: 0,
            action: 'NONE',
            items: [],
          },
          coinbase: false,
          hash: 'hash2',
          index: 0,
        },
        {
          version: 0,
          height: 300,
          value: 3000000000,
          address: 'rs1qtest000000000000000000000000000000000',
          covenant: {
            type: 0,
            action: 'NONE',
            items: [],
          },
          coinbase: false,
          hash: 'hash3',
          index: 0,
        },
      ]);

      await assetHealthCheckParam.updateStatus();

      expect(assetHealthCheckParam.getTokenAmount()).toBe(7000000000n);
    });
  });
});
