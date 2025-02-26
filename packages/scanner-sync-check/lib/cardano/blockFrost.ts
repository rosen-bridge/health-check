import { BlockFrostAPI } from '@blockfrost/blockfrost-js';

import { AbstractScannerSyncHealthCheckParam } from '../abstract';

export class CardanoBlockFrostScannerHealthCheck extends AbstractScannerSyncHealthCheckParam {
  protected client;

  constructor(
    getLastSavedBlockHeight: () => Promise<number>,
    warnDifference: number,
    criticalDifference: number,
    projectId: string,
    url?: string,
    warnBlockGap = warnDifference,
    criticalBlockGap = criticalDifference,
    blockTime = 20,
  ) {
    super(
      getLastSavedBlockHeight,
      warnDifference,
      criticalDifference,
      warnBlockGap,
      criticalBlockGap,
      blockTime,
    );
    this.client = new BlockFrostAPI({
      projectId: projectId,
      customBackend: url,
      network: 'mainnet',
    });
  }

  /**
   * generate a unique id with network name and type
   * @returns parameter id
   */
  getId = (): string => {
    return `cardano_blockfrost_scanner`;
  };

  /**
   * generate a unique title with network name and type
   * @returns parameter title
   */
  getTitle = async () => {
    return `Cardano BlockFrost Scanner Sync`;
  };

  /**
   * generate parameter description
   * @returns parameter description
   */
  getLastSavedBlockMessage = async () => {
    return `The last block saved by the Cardano BlockFrost scanner is ${this.lastBlockHeight}.`;
  };

  /**
   * @returns last available block in network
   */
  getLastAvailableBlock = () => {
    return this.client.blocksLatest().then((block) => {
      const height = block.height;
      return height ?? 0;
    });
  };
}
