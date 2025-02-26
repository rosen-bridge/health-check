import cardanoKoiosClientFactory from '@rosen-clients/cardano-koios';

import { AbstractScannerSyncHealthCheckParam } from '../abstract';

export class CardanoKoiosScannerHealthCheck extends AbstractScannerSyncHealthCheckParam {
  private koiosApi;

  constructor(
    getLastSavedBlockHeight: () => Promise<number>,
    warnDifference: number,
    criticalDifference: number,
    networkUrl: string,
    authToken?: string,
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
    this.koiosApi = cardanoKoiosClientFactory(networkUrl, authToken);
  }

  /**
   * generate a unique id with network name and type
   * @returns parameter id
   */
  getId = (): string => {
    return `cardano_koios_scanner`;
  };

  /**
   * generate a unique title with network name and type
   * @returns parameter title
   */
  getTitle = async () => {
    return `Cardano Koios Scanner Sync`;
  };

  /**
   * generate parameter description
   * @returns parameter description
   */
  getLastSavedBlockMessage = () => {
    return `The last block saved by the Cardano Koios scanner is ${this.lastBlockHeight}.`;
  };

  /**
   * @returns last available block in network
   */
  getLastAvailableBlock = async () => {
    return Number((await this.koiosApi.getTip())[0].block_no);
  };
}
