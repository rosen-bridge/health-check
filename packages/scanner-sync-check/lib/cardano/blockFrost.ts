import { DataSource } from 'typeorm';
import { BlockFrostAPI } from '@blockfrost/blockfrost-js';

import { AbstractScannerSyncHealthCheckParam } from '../abstract';

export class CardanoBlockFrostScannerHealthCheck extends AbstractScannerSyncHealthCheckParam {
  protected client;

  constructor(
    dataSource: DataSource,
    scannerName: string,
    warnDifference: number,
    criticalDifference: number,
    projectId: string,
    url?: string,
  ) {
    super(dataSource, scannerName, warnDifference, criticalDifference);
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
    return `Cardano Scanner Sync (BlockFrost)`;
  };

  /**
   * generate parameter description
   * @returns parameter description
   */
  getDescription = async () => {
    return `Cardano blockfrost scanner health status. Last saved block by cardano blockfrost scanner is ${await this.getLastSavedBlockHeight()}.`;
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
