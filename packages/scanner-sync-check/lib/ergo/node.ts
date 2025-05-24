import ergoNodeClientFactory from '@rosen-clients/ergo-node';

import { AbstractScannerSyncHealthCheckParam } from '../abstract';

export class ErgoNodeScannerHealthCheck extends AbstractScannerSyncHealthCheckParam {
  private nodeApi;

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
    this.nodeApi = ergoNodeClientFactory(networkUrl);
  }

  /**
   * generate a unique id with network name and type
   * @returns parameter id
   */
  getId = (): string => {
    return `ergo_node_scanner`;
  };

  /**
   * generate a unique title with network name and type
   * @returns parameter title
   */
  getTitle = () => {
    return `Ergo Node Scanner Sync`;
  };

  /**
   * generate parameter description
   * @returns parameter description
   */
  getLastSavedBlockMessage = () => {
    return `The last block saved by the Ergo Node scanner is ${this.lastBlockHeight}.`;
  };

  /**
   * @returns last available block in network
   */
  getLastAvailableBlock = async () => {
    return Number((await this.nodeApi.getNodeInfo()).fullHeight);
  };
}
