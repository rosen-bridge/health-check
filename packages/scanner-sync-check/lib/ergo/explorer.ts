import { AbstractScannerSyncHealthCheckParam } from '../abstract';

export class ErgoExplorerScannerHealthCheck extends AbstractScannerSyncHealthCheckParam {
  constructor(
    getLastNetworkHeight: () => Promise<number>,
    getLastSavedBlockHeight: () => Promise<number>,
    warnDifference: number,
    criticalDifference: number,
    warnBlockGap = warnDifference,
    criticalBlockGap = criticalDifference,
    blockTime = 120,
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
    return `ergo_explorer_scanner`;
  };

  /**
   * generate a unique title with network name and type
   * @returns parameter title
   */
  getTitle = () => {
    return `Ergo Explorer Scanner Sync`;
  };

  /**
   * generate parameter description
   * @returns parameter description
   */
  getLastSavedBlockMessage = () => {
    return `The last block saved by the Ergo Explorer is ${this.lastBlockHeight}.`;
  };
}
