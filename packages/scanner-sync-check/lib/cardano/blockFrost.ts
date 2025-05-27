import { AbstractScannerSyncHealthCheckParam } from '../abstract';

export class CardanoBlockFrostScannerHealthCheck extends AbstractScannerSyncHealthCheckParam {
  constructor(
    getLastNetworkHeight: () => number | undefined,
    getLastSavedBlockHeight: () => Promise<number>,
    warnDifference: number,
    criticalDifference: number,
    warnBlockGap = warnDifference,
    criticalBlockGap = criticalDifference,
    blockTime = 20,
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

  /**
   * generate a unique id with network name and type
   * @returns parameter id
   */
  getId = (): string => {
    return `cardano_blockfrost_scanner`;
  };

  /**
   * generate a unique title with network name and type
   * @returns parameter title
   */
  getTitle = async () => {
    return `Cardano BlockFrost Scanner Sync`;
  };

  /**
   * generate parameter description
   * @returns parameter description
   */
  getLastSavedBlockMessage = () => {
    return `The last block saved by the Cardano BlockFrost scanner is ${this.lastBlockHeight}.`;
  };
}
