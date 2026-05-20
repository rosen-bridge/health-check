import { createHash } from 'crypto';
import * as net from 'net';

import { AbstractAssetHealthCheckParam } from '../abstract';
import { FIRO_NATIVE_ASSET } from '../constants';

// Base58 alphabet (Bitcoin/Firo style)
const BASE58_ALPHABET =
  '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

function base58Decode(encoded: string): Buffer {
  // Count leading '1' characters (each encodes a zero byte)
  let leadingZeros = 0;
  for (const char of encoded) {
    if (char === '1') leadingZeros++;
    else break;
  }

  // Use BigInt for correct multi-byte arithmetic
  let big = 0n;
  for (const c of encoded) {
    const digit = BASE58_ALPHABET.indexOf(c);
    if (digit < 0) throw new Error(`Invalid base58 character: ${c}`);
    big = big * 58n + BigInt(digit);
  }

  const hex = big.toString(16);
  const paddedHex = (hex.length % 2 === 0 ? '' : '0') + hex;
  const fullHex = '00'.repeat(leadingZeros) + paddedHex;
  return Buffer.from(fullHex, 'hex');
}

export function addressToScripthash(address: string): string {
  const decoded = base58Decode(address);
  // Skip version byte, extract 20-byte pubkey hash, skip 4-byte checksum
  const pubkeyHash = decoded.subarray(1, 21);
  // Build P2PKH script: OP_DUP OP_HASH160 <20 bytes> OP_EQUALVERIFY OP_CHECKSIG
  const script = Buffer.concat([
    Buffer.from([0x76, 0xa9, 0x14]),
    pubkeyHash,
    Buffer.from([0x88, 0xac]),
  ]);
  const scripthash = createHash('sha256').update(script).digest().reverse();
  return scripthash.toString('hex');
}

export class FiroElectrumXAssetHealthCheckParam extends AbstractAssetHealthCheckParam {
  private readonly host: string;
  private readonly port: number;
  private readonly timeout: number;

  /**
   * Creates a Firo ElectrumX asset health check parameter
   * @param assetName Name of the asset
   * @param address Firo address to monitor
   * @param warnThreshold Warning threshold in satoshis
   * @param criticalThreshold Critical threshold in satoshis
   * @param electrumxHost ElectrumX host
   * @param electrumxPort ElectrumX port
   * @param assetDecimal Number of decimal places (default 8)
   */
  constructor(
    assetName: string,
    address: string,
    warnThreshold: bigint,
    criticalThreshold: bigint,
    electrumxHost: string,
    electrumxPort: number,
    assetDecimal = 8,
  ) {
    super(
      'Firo',
      FIRO_NATIVE_ASSET,
      assetName.toUpperCase(),
      address,
      warnThreshold,
      criticalThreshold,
      assetDecimal,
    );

    this.host = electrumxHost;
    this.port = electrumxPort;
    this.timeout = 30000;
  }

  /**
   * Send a JSON-RPC request to ElectrumX over TCP and return the result.
   */
  private sendRequest = (
    method: string,
    params: unknown[],
  ): Promise<unknown> => {
    return new Promise((resolve, reject) => {
      const socket = net.createConnection(this.port, this.host);
      let buffer = '';
      let id = 1;

      const timer = setTimeout(() => {
        socket.destroy();
        reject(new Error(`ElectrumX request timeout [${method}]`));
      }, this.timeout);

      socket.on('data', (data: Buffer) => {
        buffer += data.toString('utf-8');
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const response = JSON.parse(line);
            if (response.id === id && response.result !== undefined) {
              clearTimeout(timer);
              socket.destroy();
              resolve(response.result);
            } else if (response.error) {
              clearTimeout(timer);
              socket.destroy();
              reject(new Error(`ElectrumX error: ${response.error.message}`));
            }
          } catch {
            // ignore parse errors
          }
        }
      });

      socket.on('error', (err: Error) => {
        clearTimeout(timer);
        reject(err);
      });

      socket.once('connect', () => {
        // Send server.version first
        socket.write(
          JSON.stringify({
            jsonrpc: '2.0',
            id: 0,
            method: 'server.version',
            params: ['health-check', '1.4'],
          }) + '\n',
        );

        // Then send the actual request
        id = 1;
        socket.write(
          JSON.stringify({
            jsonrpc: '2.0',
            id,
            method,
            params,
          }) + '\n',
        );
      });
    });
  };

  /**
   * update health status
   */
  updateStatus = async () => {
    const scripthash = addressToScripthash(this.address);
    const result = (await this.sendRequest(
      'blockchain.scripthash.get_balance',
      [scripthash],
    )) as { confirmed: number; unconfirmed: number };

    // Balance is in satoshis
    this.tokenAmount = BigInt(result.confirmed + result.unconfirmed);
  };
}
