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
    return `Ergo Explorer Scanner Sync`;
  };

  /**
   * generate parameter description
   * @returns parameter description
   */
  getDescription = async () => {
    return `Checks if the scanner is in sync with the network. The last block saved by the Ergo Explorer is ${await this.getLastSavedBlockHeight()}.`;
  };

  /**
   * @returns last available block in network
   */
  getLastAvailableBlock = async () => {
    return Number((await this.explorerApi.v1.getApiV1Networkstate()).height);
  };
}
