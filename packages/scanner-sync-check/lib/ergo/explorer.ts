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
    return `Ergo Scanner Sync (Explorer)`;
  };

  /**
   * generate parameter description
   * @returns parameter description
   */
  getDescription = async () => {
    return `Ergo explorer scanner health status. Last saved block by ergo explorer scanner is ${await this.getLastSavedBlockHeight()}.`;
  };

  /**
   * @returns last available block in network
   */
  getLastAvailableBlock = async () => {
    return Number((await this.explorerApi.v1.getApiV1Networkstate()).height);
  };
}
