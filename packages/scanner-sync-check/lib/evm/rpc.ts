import { JsonRpcProvider } from 'ethers';

import { AbstractScannerSyncHealthCheckParam } from '../abstract';

export class EvmRPCScannerHealthCheck extends AbstractScannerSyncHealthCheckParam {
  protected readonly provider: JsonRpcProvider;
  protected chain: string;

  constructor(
    chain: string,
    getLastSavedBlockHeight: () => Promise<number>,
    scannerName: string,
    warnDifference: number,
    criticalDifference: number,
    url: string,
    authToken?: string,
    timeout?: number,
  ) {
    super(
      getLastSavedBlockHeight,
      scannerName,
      warnDifference,
      criticalDifference,
    );
    this.chain = chain;
    this.provider = authToken
      ? new JsonRpcProvider(`${url}/${authToken}`)
      : new JsonRpcProvider(`${url}`);
    if (timeout) {
      this.provider._getConnection().timeout = timeout;
    }
  }

  /**
   * generate a unique id with network name and type
   * @returns parameter id
   */
  getId = (): string => {
    return `${this.chain}_rpc_scanner`;
  };

  /**
   * generate a unique title with network name and type
   * @returns parameter title
   */
  getTitle = async () => {
    return `${this.chain} RPC Scanner Sync`;
  };

  /**
   * generate parameter description
   * @returns parameter description
   */
  getDescription = async () => {
    return `Checks if the scanner is in sync with the network. The last block saved by the ${this.chain} RPC scanner is ${await this.getLastSavedBlockHeight()}.`;
  };

  /**
   * @returns last available block in network
   */
  getLastAvailableBlock = async () => {
    return await this.provider.getBlockNumber();
  };
}
