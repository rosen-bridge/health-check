import { DataSource } from 'typeorm';
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
    dataSource: DataSource,
    scannerName: string,
    warnDifference: number,
    criticalDifference: number,
    ogmiosHost: string,
    ogmiosPort: number,
    useTls = false,
  ) {
    super(dataSource, scannerName, warnDifference, criticalDifference);
    this.ogmiosHost = ogmiosHost;
    this.ogmiosPort = ogmiosPort;
    this.useTls = useTls;
  }

  /**
   * generates a unique id with network name and type
   * @returns parameter id
   */
  getId = (): string => {
    return `Cardano Scanner Sync (Ogmios)`;
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
