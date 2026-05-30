import * as net from 'net';

import { HealthStatusLevel } from '@rosen-bridge/health-check';

import { ScannerSyncHealthCheckParam } from '../scannerSyncHealthCheckParam';
import { LastSavedBlock } from '../types';

export class FiroElectrumXScannerHealthCheck extends ScannerSyncHealthCheckParam {
  private readonly host: string;
  private readonly port: number;
  private readonly timeout: number;

  private heightDifference?: number;
  private networkHeightError?: string;

  constructor(
    getLastSavedBlock: () => Promise<LastSavedBlock>,
    warnDifference: number,
    criticalDifference: number,
    electrumxHost: string,
    electrumxPort: number,
    blockTime = 150,
    scannerUpdateInterval = 0,
  ) {
    super(
      'firo',
      getLastSavedBlock,
      warnDifference,
      criticalDifference,
      blockTime,
      scannerUpdateInterval,
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
   * Get current block height from ElectrumX.
   */
  private getCurrentBlockHeight = async (): Promise<number> => {
    const result = (await this.sendRequest(
      'blockchain.headers.subscribe',
      [],
    )) as { height: number };
    return result.height;
  };

  /**
   * Enhanced health details that compare with network height
   */
  getDetails = (): string | undefined => {
    const baseDetails = this.rawDetails();
    if (this.networkHeightError) {
      const errorSuffix = ` Unable to check network height: ${this.networkHeightError}.`;
      return baseDetails
        ? baseDetails + errorSuffix
        : `Network connectivity issue.${errorSuffix}`;
    }
    if (this.heightDifference !== undefined) {
      const networkHeight = this.lastBlockHeight + this.heightDifference;
      if (baseDetails && this.heightDifference > this.criticalDifference) {
        return `${baseDetails} Scanner is ${this.heightDifference} blocks behind the network (height ${networkHeight}).`;
      } else if (baseDetails && this.heightDifference > this.warnDifference) {
        return `${baseDetails} Scanner is ${this.heightDifference} blocks behind the network (height ${networkHeight}).`;
      } else if (this.heightDifference > this.criticalDifference) {
        return `Scanner is critically behind the network by ${this.heightDifference} blocks (network height: ${networkHeight}, scanner height: ${this.lastBlockHeight}).`;
      } else if (this.heightDifference > this.warnDifference) {
        return `Scanner is behind the network by ${this.heightDifference} blocks (network height: ${networkHeight}, scanner height: ${this.lastBlockHeight}).`;
      }
    }
    return baseDetails;
  };

  /**
   * @returns scanner sync health status including ElectrumX network height checks
   */
  getHealthStatus = (): HealthStatusLevel => {
    if (this.lastBlockGap === undefined || this.networkHeightError) {
      return HealthStatusLevel.BROKEN;
    }

    const criticalBlockGap = Math.max(
      this.criticalBlockTimeGap,
      this.scannerUpdateInterval * this.scannerIntervalMultiplier,
    );
    const warnBlockGap = Math.max(
      this.warnBlockTimeGap,
      this.scannerUpdateInterval * this.scannerIntervalMultiplier,
    );

    if (
      this.lastBlockGap >= criticalBlockGap ||
      (this.heightDifference !== undefined &&
        this.heightDifference > this.criticalDifference)
    ) {
      return HealthStatusLevel.BROKEN;
    }

    if (
      this.lastBlockGap >= warnBlockGap ||
      (this.heightDifference !== undefined &&
        this.heightDifference > this.warnDifference)
    ) {
      return HealthStatusLevel.UNSTABLE;
    }

    return HealthStatusLevel.HEALTHY;
  };

  /**
   * Update status with enhanced network height comparison
   */
  updateStatus = async () => {
    await this.rawUpdate();
    this.heightDifference = undefined;
    this.networkHeightError = undefined;

    try {
      const networkHeight = await this.getCurrentBlockHeight();
      this.heightDifference = networkHeight - this.lastBlockHeight;
    } catch (error) {
      this.networkHeightError =
        error instanceof Error ? error.message : 'Unknown error';
    }
  };
}
