import ergoExplorerClientFactory from '@rosen-clients/ergo-explorer';

import { AbstractScannerSyncHealthCheckParam } from '../abstract';

export class ErgoExplorerScannerHealthCheck extends AbstractScannerSyncHealthCheckParam {
  private explorerApi;

  constructor(
    getLastSavedBlockHeight: () => Promise<number>,
    warnDifference: number,
    criticalDifference: number,
    networkUrl: string,
    warnBlockGap = warnDifference,
    criticalBlockGap = criticalDifference,
    blockTime = 120,
  ) {
    super(
      getLastSavedBlockHeight,
      warnDifference,
      criticalDifference,
      warnBlockGap,
      criticalBlockGap,
      blockTime,
    );
    this.explorerApi = ergoExplorerClientFactory(networkUrl);
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
  getTitle = async () => {
    return `Ergo Explorer Scanner Sync`;
  };

  /**
   * generate parameter description
   * @returns parameter description
   */
  getLastSavedBlockMessage = () => {
    return `The last block saved by the Ergo Explorer is ${this.lastBlockHeight}.`;
  };

  /**
   * @returns last available block in network
   */
  getLastAvailableBlock = async () => {
    return Number((await this.explorerApi.v1.getApiV1Networkstate()).height);
  };
}
