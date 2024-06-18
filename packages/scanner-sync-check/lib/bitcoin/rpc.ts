import { DataSource } from 'typeorm';
import axios, { AxiosInstance } from 'axios';

import { AbstractScannerSyncHealthCheckParam } from '../abstract';

type PartialGetChainTipsResult = {
  result: {
    height: number;
    status:
      | 'invalid'
      | 'headers-only'
      | 'valid-headers'
      | 'valid-fork'
      | 'active';
  }[];
};

export class BitcoinRPCScannerHealthCheck extends AbstractScannerSyncHealthCheckParam {
  protected client: AxiosInstance;

  constructor(
    dataSource: DataSource,
    scannerName: string,
    warnDifference: number,
    criticalDifference: number,
    rpcURL: string,
  ) {
    super(dataSource, scannerName, warnDifference, criticalDifference);
    this.client = axios.create({
      baseURL: rpcURL,
    });
  }

  /**
   * generate a unique id with network name and type
   * @returns parameter id
   */
  getId = (): string => {
    return `bitcoin_rpc_scanner`;
  };

  /**
   * generate a unique title with network name and type
   * @returns parameter title
   */
  getTitle = async () => {
    return `Bitcoin RPC Scanner Sync`;
  };

  /**
   * generate parameter description
   * @returns parameter description
   */
  getDescription = async () => {
    return `Checks if the scanner is in sync with the network. The last block saved by the Bitcoin RPC scanner is  ${await this.getLastSavedBlockHeight()}.`;
  };

  /**
   * @returns last available block in network
   */
  getLastAvailableBlock = async () => {
    const response = await this.client.post<PartialGetChainTipsResult>('', {
      method: 'getchaintips',
      params: [],
    });
    const chainTips = response.data.result;
    return chainTips.find((tip) => tip.status === 'active')?.height ?? 0;
  };
}
