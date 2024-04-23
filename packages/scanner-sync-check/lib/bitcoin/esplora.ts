import { DataSource } from 'typeorm';
import axios, { AxiosInstance } from 'axios';

import { AbstractScannerSyncHealthCheckParam } from '../abstract';

export class BitcoinEsploraScannerHealthCheck extends AbstractScannerSyncHealthCheckParam {
  protected client: AxiosInstance;

  constructor(
    dataSource: DataSource,
    scannerName: string,
    warnDifference: number,
    criticalDifference: number,
    esploraUrl: string,
  ) {
    super(dataSource, scannerName, warnDifference, criticalDifference);
    this.client = axios.create({
      baseURL: esploraUrl,
    });
  }

  /**
   * generates a unique id with network name and type
   * @returns parameter id
   */
  getId = (): string => {
    return `Bitcoin Scanner Sync (Esplora)`;
  };

  /**
   * @returns last available block in network
   */
  getLastAvailableBlock = () => {
    return this.client
      .get<number>(`/api/blocks/tip/height`)
      .then((res) => Number(res.data));
  };
}
