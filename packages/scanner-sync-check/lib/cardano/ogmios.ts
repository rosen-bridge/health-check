import {
  createInteractionContext,
  InteractionContext,
  createLedgerStateQueryClient,
} from '@cardano-ogmios/client';

import { AbstractScannerSyncHealthCheckParam } from '../abstract';

export class CardanoOgmiosScannerHealthCheck extends AbstractScannerSyncHealthCheckParam {
  private ogmiosPort: number;
  private ogmiosHost: string;
  private useTls: boolean;

  constructor(
    getLastSavedBlockHeight: () => Promise<number>,
    scannerName: string,
    warnDifference: number,
    criticalDifference: number,
    ogmiosHost: string,
    ogmiosPort: number,
    useTls = false,
  ) {
    super(
      getLastSavedBlockHeight,
      scannerName,
      warnDifference,
      criticalDifference,
    );
    this.ogmiosHost = ogmiosHost;
    this.ogmiosPort = ogmiosPort;
    this.useTls = useTls;
  }

  /**
   * generate a unique id with network name and type
   * @returns parameter id
   */
  getId = (): string => {
    return `cardano_ogmios_scanner`;
  };

  /**
   * generate a unique title with network name and type
   * @returns parameter title
   */
  getTitle = async () => {
    return `Cardano Ogmios Scanner Sync`;
  };

  /**
   * generate parameter description
   * @returns parameter description
   */
  getDescription = async () => {
    return `Checks if the scanner is in sync with the network. The last block saved by the Cardano Ogmios scanner is ${await this.getLastSavedBlockHeight()}.`;
  };

  /**
   * @returns last available block in network
   */
  getLastAvailableBlock = async () => {
    const context: InteractionContext = await createInteractionContext(
      (err) => console.error(err),
      () => undefined,
      {
        connection: {
          port: this.ogmiosPort,
          host: this.ogmiosHost,
          tls: this.useTls,
        },
      },
    );
    const ogmiosClient = await createLedgerStateQueryClient(context);
    const height = await ogmiosClient.networkBlockHeight();
    if (height == 'origin') return 0;
    else return height;
  };
}
