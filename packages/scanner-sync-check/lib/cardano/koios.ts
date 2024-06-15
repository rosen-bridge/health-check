import { AbstractScannerSyncHealthCheckParam } from '../abstract';
import { DataSource } from 'typeorm';
import cardanoKoiosClientFactory from '@rosen-clients/cardano-koios';

export class CardanoKoiosScannerHealthCheck extends AbstractScannerSyncHealthCheckParam {
  private koiosApi;

  constructor(
    dataSource: DataSource,
    scannerName: string,
    warnDifference: number,
    criticalDifference: number,
    networkUrl: string,
    authToken?: string,
  ) {
    super(dataSource, scannerName, warnDifference, criticalDifference);
    this.koiosApi = cardanoKoiosClientFactory(networkUrl, authToken);
  }

  /**
   * generate a unique id with network name and type
   * @returns parameter id
   */
  getId = (): string => {
    return `cardano_koios_scanner`;
  };

  /**
   * generate a unique title with network name and type
   * @returns parameter title
   */
  getTitle = async () => {
    return `Cardano Scanner Sync (Koios)`;
  };

  /**
   * generate parameter description
   * @returns parameter description
   */
  getDescription = async () => {
    return `Cardano koios scanner health status. Last saved block by cardano koios scanner is ${await this.getLastSavedBlockHeight()}.`;
  };

  /**
   * @returns last available block in network
   */
  getLastAvailableBlock = async () => {
    return Number((await this.koiosApi.getTip())[0].block_no);
  };
}
