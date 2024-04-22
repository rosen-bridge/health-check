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
   * generates a unique id with network name and type
   * @returns parameter id
   */
  getId = (): string => {
    return `Ergo Scanner Sync (Node)`;
  };

  /**
   * @returns last available block in network
   */
  getLastAvailableBlock = async () => {
    return Number((await this.nodeApi.getNodeInfo()).fullHeight);
  };
}
