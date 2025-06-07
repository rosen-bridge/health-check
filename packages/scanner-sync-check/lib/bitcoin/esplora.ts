import { AbstractScannerSyncHealthCheckParam } from '../abstract';

export class BitcoinEsploraScannerHealthCheck extends AbstractScannerSyncHealthCheckParam {
  protected chain: string;

  constructor(
    chain: string,
    getLastNetworkHeight: () => number | undefined,
    getLastSavedBlockHeight: () => Promise<number>,
    warnDifference: number,
    criticalDifference: number,
    warnBlockGap = warnDifference,
    criticalBlockGap = criticalDifference,
    blockTime = 600,
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
    return `${this.chain}_esplora_scanner`;
  };

  /**
   * generate a unique title with network name and type
   * @returns parameter title
   */
  getTitle = () => {
    return `${this.chain} Esplora Scanner Sync`;
  };

  /**
   * generate parameter description
   * @returns parameter description
   */
  getLastSavedBlockMessage = () => {
    return `The last block saved by the Bitcoin Esplora scanner is ${this.lastBlockHeight}.`;
  };
}
