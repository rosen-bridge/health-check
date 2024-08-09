import axios, { AxiosInstance } from 'axios';

import { AbstractScannerSyncHealthCheckParam } from '../abstract';

export class BitcoinEsploraScannerHealthCheck extends AbstractScannerSyncHealthCheckParam {
  protected client: AxiosInstance;

  constructor(
    getLastSavedBlockHeight: () => Promise<number>,
    scannerName: string,
    warnDifference: number,
    criticalDifference: number,
    esploraUrl: string,
  ) {
    super(
      getLastSavedBlockHeight,
      scannerName,
      warnDifference,
      criticalDifference,
    );
    this.client = axios.create({
      baseURL: esploraUrl,
    });
  }

  /**
   * generate a unique id with network name and type
   * @returns parameter id
   */
  getId = (): string => {
    return `bitcoin_esplora_scanner`;
  };

  /**
   * generate a unique title with network name and type
   * @returns parameter title
   */
  getTitle = async () => {
    return `Bitcoin Esplora Scanner Sync`;
  };

  /**
   * generate parameter description
   * @returns parameter description
   */
  getDescription = async () => {
    return `Checks if the scanner is in sync with the network. The last block saved by the Bitcoin Esplora scanner is ${await this.getLastSavedBlockHeight()}.`;
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
