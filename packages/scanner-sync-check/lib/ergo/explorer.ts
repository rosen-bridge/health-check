import { DataSource } from 'typeorm';
import ergoExplorerClientFactory from '@rosen-clients/ergo-explorer';

import { AbstractScannerSyncHealthCheckParam } from '../abstract';

export class ErgoExplorerScannerHealthCheck extends AbstractScannerSyncHealthCheckParam {
  private explorerApi;

  constructor(
    dataSource: DataSource,
    scannerName: string,
    warnDifference: number,
    criticalDifference: number,
    networkUrl: string,
  ) {
    super(dataSource, scannerName, warnDifference, criticalDifference);
    this.explorerApi = ergoExplorerClientFactory(networkUrl);
  }

  /**
   * generates a unique id with network name and type
   * @returns parameter id
   */
  getId = (): string => {
    return `Ergo Scanner Sync (Explorer)`;
  };

  /**
   * @returns last available block in network
   */
  getLastAvailableBlock = async () => {
    return Number((await this.explorerApi.v1.getApiV1Networkstate()).height);
  };
}
