import { JsonRpcProvider } from 'ethers';
import { upperFirst } from 'lodash-es';

import { AbstractScannerSyncHealthCheckParam } from '../abstract';

export class EvmRPCScannerHealthCheck extends AbstractScannerSyncHealthCheckParam {
  protected readonly provider: JsonRpcProvider;
  protected chain: string;

  constructor(
    chain: string,
    getLastSavedBlockHeight: () => Promise<number>,
    warnDifference: number,
    criticalDifference: number,
    url: string,
    blockTime: number,
    authToken?: string,
    warnBlockGap = warnDifference,
    criticalBlockGap = criticalDifference,
    timeout?: number,
  ) {
    super(
      getLastSavedBlockHeight,
      warnDifference,
      criticalDifference,
      warnBlockGap,
      criticalBlockGap,
      blockTime,
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
    return `${upperFirst(this.chain)} RPC Scanner Sync`;
  };

  /**
   * generate parameter description
   * @returns parameter description
   */
  getLastSavedBlockMessage = async () => {
    return `The last block saved by the ${upperFirst(this.chain.toLowerCase())} RPC scanner is ${this.lastBlockHeight}.`;
  };

  /**
   * @returns last available block in network
   */
  getLastAvailableBlock = async () => {
    return await this.provider.getBlockNumber();
  };
}
