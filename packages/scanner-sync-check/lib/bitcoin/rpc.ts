import axios, { AxiosInstance } from 'axios';
import { randomBytes } from 'crypto';

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
  id: string;
};

export class BitcoinRPCScannerHealthCheck extends AbstractScannerSyncHealthCheckParam {
  protected client: AxiosInstance;

  constructor(
    getLastSavedBlockHeight: () => Promise<number>,
    scannerName: string,
    warnDifference: number,
    criticalDifference: number,
    rpcURL: string,
    username?: string,
    password?: string,
  ) {
    super(
      getLastSavedBlockHeight,
      scannerName,
      warnDifference,
      criticalDifference,
    );
    const auth =
      username && password
        ? { username: username, password: password }
        : undefined;
    this.client = axios.create({
      baseURL: rpcURL,
      headers: { 'Content-Type': 'application/json' },
      auth: auth,
    });
  }

  private generateRandomId = () => randomBytes(32).toString('hex');

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
    return `Checks if the scanner is in sync with the network. The last block saved by the Bitcoin RPC scanner is ${await this.getLastSavedBlockHeight()}.`;
  };

  /**
   * @returns last available block in network
   */
  getLastAvailableBlock = async () => {
    const randomId = this.generateRandomId();
    const response = await this.client.post<PartialGetChainTipsResult>('', {
      method: 'getchaintips',
      params: [],
      id: randomId,
    });
    if (response.data.id !== randomId)
      throw Error(`UnexpectedBehavior: Request and response id are different`);
    const chainTips = response.data.result;
    return chainTips.find((tip) => tip.status === 'active')?.height ?? 0;
  };
}
