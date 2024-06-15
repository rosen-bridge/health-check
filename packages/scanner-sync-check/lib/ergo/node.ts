import ergoNodeClientFactory from '@rosen-clients/ergo-node';
import { DataSource } from 'typeorm';

import { AbstractScannerSyncHealthCheckParam } from '../abstract';

export class ErgoNodeScannerHealthCheck extends AbstractScannerSyncHealthCheckParam {
  private nodeApi;

  constructor(
    dataSource: DataSource,
    scannerName: string,
    warnDifference: number,
    criticalDifference: number,
    networkUrl: string,
  ) {
    super(dataSource, scannerName, warnDifference, criticalDifference);
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
  getTitle = async () => {
    return `Ergo Scanner Sync (Node)`;
  };

  /**
   * generate parameter description
   * @returns parameter description
   */
  getDescription = async () => {
    return `Ergo node scanner health status. Last saved block by ergo node scanner is ${await this.getLastSavedBlockHeight()}.`;
  };

  /**
   * @returns last available block in network
   */
  getLastAvailableBlock = async () => {
    return Number((await this.nodeApi.getNodeInfo()).fullHeight);
  };
}
