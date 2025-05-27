import { upperFirst } from 'lodash-es';

import { AbstractScannerSyncHealthCheckParam } from '../abstract';

export class EvmRPCScannerHealthCheck extends AbstractScannerSyncHealthCheckParam {
  protected chain: string;

  constructor(
    chain: string,
    getLastNetworkHeight: () => number | undefined,
    getLastSavedBlockHeight: () => Promise<number>,
    warnDifference: number,
    criticalDifference: number,
    blockTime: number,
    warnBlockGap = warnDifference,
    criticalBlockGap = criticalDifference,
  ) {
    super(
      getLastNetworkHeight,
      getLastSavedBlockHeight,
      warnDifference,
      criticalDifference,
      warnBlockGap,
      criticalBlockGap,
      blockTime,
    );
    this.chain = chain;
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
  getLastSavedBlockMessage = () => {
    return `The last block saved by the ${upperFirst(this.chain.toLowerCase())} RPC scanner is ${this.lastBlockHeight}.`;
  };
}
