import { randomBytes } from 'crypto';

import { AbstractScannerSyncHealthCheckParam } from '../abstract';

export class BitcoinRPCScannerHealthCheck extends AbstractScannerSyncHealthCheckParam {
  constructor(
    getLastNetworkHeight: () => Promise<number | undefined>,
    getLastSavedBlockHeight: () => Promise<number>,
    warnDifference: number,
    criticalDifference: number,
    warnBlockGap = warnDifference,
    criticalBlockGap = criticalDifference,
    blockTime = 600,
  ) {
    super(
      getLastNetworkHeight,
      getLastSavedBlockHeight,
      warnDifference,
      criticalDifference,
      warnBlockGap,
      criticalBlockGap,
      blockTime,
    );
  }

  private generateRandomId = () => randomBytes(32).toString('hex');

  /**
   * generate a unique id with network name and type
   * @returns parameter id
   */
  getId = (): string => {
    return `bitcoin_rpc_scanner`;
  };

  /**
   * generate a unique title with network name and type
   * @returns parameter title
   */
  getTitle = async () => {
    return `Bitcoin RPC Scanner Sync`;
  };

  /**
   * generate parameter description
   * @returns parameter description
   */
  getLastSavedBlockMessage = () => {
    return `The last block saved by the Bitcoin RPC scanner is ${this.lastBlockHeight}.`;
  };
}
