import { JsonRpcProvider } from 'ethers';

import { AbstractScannerSyncHealthCheckParam } from '../abstract';

export class EthereumRPCScannerHealthCheck extends AbstractScannerSyncHealthCheckParam {
  protected readonly provider: JsonRpcProvider;

  constructor(
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
    return `ethereum_rpc_scanner`;
  };

  /**
   * generate a unique title with network name and type
   * @returns parameter title
   */
  getTitle = async () => {
    return `Ethereum RPC Scanner Sync`;
  };

  /**
   * generate parameter description
   * @returns parameter description
   */
  getDescription = async () => {
    return `Checks if the scanner is in sync with the network. The last block saved by the Ethereum RPC scanner is ${await this.getLastSavedBlockHeight()}.`;
  };

  /**
   * @returns last available block in network
   */
  getLastAvailableBlock = async () => {
    return await this.provider.getBlockNumber();
  };
}
