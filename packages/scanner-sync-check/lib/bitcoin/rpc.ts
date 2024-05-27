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
   * generates a unique id with network name and type
   * @returns parameter id
   */
  getId = (): string => {
    return `Bitcoin Scanner Sync (RPC)`;
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
