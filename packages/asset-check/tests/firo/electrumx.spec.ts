import { EventEmitter } from 'events';
import { describe, expect, it, vi } from 'vitest';

import { FIRO_NATIVE_ASSET } from '../../lib/constants';
import { addressToScripthash } from '../../lib/firo/electrumx';
import { TestFiroElectrumXAssetHealthCheck } from './testFiro';

const VALID_FIRO_ADDRESS = 'a3io3zMLfg9nchA3KSoSEvPz1tztnKDuaT';
const INVALID_FIRO_ADDRESS = 'a3io3zMLfg9nchA3KSoSEvPz1tztnKDUZZ';
const VALID_FIRO_SCRIPTHASH =
  'c97f9d23117ebb9abf6e1f36d7e7362a8f3961a2052c43db3d77598229fb6348';
const VALID_FIRO_P2SH_ADDRESS = '2EdAinnuw3zCy8arpSKRwQYQK2MBC5VMXu9';
const VALID_FIRO_P2SH_SCRIPTHASH =
  '7914236249d96d4931978817b2fe3c9071e8b4daf4decd3087dbba955fd7f66f';

function createMockSocket(responses: Array<Record<string, unknown>>) {
  const socket = new EventEmitter() as EventEmitter & {
    written: string[];
    destroyed: boolean;
    write: (data: string) => boolean;
    destroy: () => void;
    setEncoding: () => void;
    setNoDelay: () => void;
    setTimeout: () => void;
    end: () => void;
    ref: () => void;
    unref: () => void;
  };
  socket.written = [];
  socket.destroyed = false;
  socket.write = (data: string) => {
    socket.written.push(data);
    const lines = data.split('\n').filter((l) => l.trim());
    for (const line of lines) {
      try {
        const req = JSON.parse(line);
        // Respond to server.version and the actual request
        if (req.method === 'server.version') {
          setTimeout(
            () =>
              socket.emit(
                'data',
                Buffer.from(
                  JSON.stringify({
                    jsonrpc: '2.0',
                    id: req.id,
                    result: ['health-check', '1.4'],
                  }) + '\n',
                ),
              ),
            0,
          );
        } else {
          const resp = responses.shift();
          if (resp !== undefined && resp !== null) {
            const isError =
              typeof resp === 'object' &&
              'error' in resp &&
              resp.error !== null &&
              resp.error !== undefined;
            setTimeout(
              () =>
                socket.emit(
                  'data',
                  Buffer.from(
                    JSON.stringify({
                      jsonrpc: '2.0',
                      id: req.id,
                      [isError ? 'error' : 'result']: isError
                        ? resp.error
                        : resp,
                    }) + '\n',
                  ),
                ),
              0,
            );
          }
        }
      } catch {
        /* ignore */
      }
    }
    return true;
  };
  socket.destroy = () => {
    socket.destroyed = true;
  };
  socket.setEncoding = vi.fn();
  socket.setNoDelay = vi.fn();
  socket.setTimeout = vi.fn();
  socket.end = vi.fn();
  socket.ref = vi.fn();
  socket.unref = vi.fn();
  return socket;
}

vi.mock('net', () => {
  let socket: ReturnType<typeof createMockSocket>;
  return {
    createConnection: vi.fn(() => {
      socket = createMockSocket(socketResponses);
      setTimeout(() => socket.emit('connect'), 0);
      return socket;
    }),
  };
});

let socketResponses: Array<Record<string, unknown>> = [];

describe('FiroElectrumXAssetHealthCheck', () => {
  describe('update', () => {
    /**
     * @target FiroElectrumXAssetHealthCheck.update Should update FIRO amount using ElectrumX
     * @dependencies
     * - net (TCP)
     * @scenario
     * - mock ElectrumX blockchain.scripthash.get_balance response
     * - create new instance of TestFiroElectrumXAssetHealthCheck
     * - update the parameter
     * @expected
     * - The native firo asset amount should update successfully
     */
    it('Should update FIRO amount using ElectrumX', async () => {
      socketResponses = [{ confirmed: 1575000000, unconfirmed: 0 }];

      const assetHealthCheckParam = new TestFiroElectrumXAssetHealthCheck(
        FIRO_NATIVE_ASSET,
        VALID_FIRO_ADDRESS,
        100n,
        10n,
        '127.0.0.1',
        50001,
      );

      await assetHealthCheckParam.update();

      expect(assetHealthCheckParam.getTokenAmount()).toBe(1575000000n);
    });

    /**
     * @target FiroElectrumXAssetHealthCheck.update Should handle zero balance
     * @dependencies
     * - net (TCP)
     * @scenario
     * - mock ElectrumX response with zero balance
     * - create new instance of TestFiroElectrumXAssetHealthCheck
     * - update the parameter
     * @expected
     * - The native firo asset amount should be 0
     */
    it('Should handle zero balance', async () => {
      socketResponses = [{ confirmed: 0, unconfirmed: 0 }];

      const assetHealthCheckParam = new TestFiroElectrumXAssetHealthCheck(
        FIRO_NATIVE_ASSET,
        VALID_FIRO_ADDRESS,
        100n,
        10n,
        '127.0.0.1',
        50001,
      );

      await assetHealthCheckParam.update();

      expect(assetHealthCheckParam.getTokenAmount()).toBe(0n);
    });
  });

  describe('addressToScripthash', () => {
    /**
     * @target addressToScripthash should produce correct scripthash for a known Firo address
     * @scenario
     * - compute scripthash for a valid Firo P2PKH address
     * @expected
     * - it should return the expected scripthash (pre-computed with verified decoder)
     */
    it('should produce correct scripthash for known address', () => {
      const scripthash = addressToScripthash(VALID_FIRO_ADDRESS);
      expect(scripthash).toBe(VALID_FIRO_SCRIPTHASH);
    });

    /**
     * @target addressToScripthash should produce consistent non-zero result
     * @scenario
     * - compute scripthash for two different addresses
     * @expected
     * - scripthashes are 64-char hex strings, non-equal
     */
    it('should produce distinct non-empty scripthashes', () => {
      const a = addressToScripthash(VALID_FIRO_ADDRESS);
      const b = addressToScripthash(VALID_FIRO_P2SH_ADDRESS);
      expect(a).toHaveLength(64);
      expect(b).toHaveLength(64);
      expect(a).not.toBe(b);
    });

    /**
     * @target addressToScripthash should produce correct scripthash for P2SH
     * @scenario
     * - compute scripthash for a valid Firo testnet P2SH address
     * @expected
     * - it should use P2SH script format before hashing
     */
    it('should produce correct scripthash for P2SH address', () => {
      const scripthash = addressToScripthash(VALID_FIRO_P2SH_ADDRESS);
      expect(scripthash).toBe(VALID_FIRO_P2SH_SCRIPTHASH);
    });

    /**
     * @target addressToScripthash should reject invalid characters
     * @scenario
     * - pass an address with characters not in the base58 alphabet
     * @expected
     * - it should throw
     */
    it('should throw for invalid base58 characters', () => {
      expect(() => addressToScripthash('invalid-address')).toThrow();
    });

    /**
     * @target addressToScripthash should reject invalid checksum
     * @scenario
     * - pass an address with valid base58 characters but modified checksum
     * @expected
     * - it should throw
     */
    it('should throw for invalid checksum', () => {
      expect(() => addressToScripthash(INVALID_FIRO_ADDRESS)).toThrow(
        'checksum',
      );
    });
  });
});
