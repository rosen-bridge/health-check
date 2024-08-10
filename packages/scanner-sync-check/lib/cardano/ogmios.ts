import {
  createInteractionContext,
  InteractionContext,
  createLedgerStateQueryClient,
} from '@cardano-ogmios/client';

import { AbstractScannerSyncHealthCheckParam } from '../abstract';
import { HealthStatusLevel } from '@rosen-bridge/health-check';

export class CardanoOgmiosScannerHealthCheck extends AbstractScannerSyncHealthCheckParam {
  private ogmiosPort: number;
  private ogmiosHost: string;
  private useTls: boolean;

  constructor(
    getLastSavedBlockHeight: () => Promise<number>,
    private connected: () => boolean,
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
   * if the difference between scanned blocks and network blocks is more than the differences returns the required notification
   * @returns parameter health description
   */
  getDetails = async (): Promise<string | undefined> => {
    if (!this.connected())
      return (
        'Service has stopped working since Ogmios client is not connected. ' +
        'Please check the connection and restart your service.'
      );
    const baseMessage = ` Scanner is out of sync by ${this.difference} blocks.`;
    if (this.difference >= this.criticalDifference)
      return `Service has stopped working.` + baseMessage;
    else if (this.difference >= this.warnDifference)
      return `Service may stop working soon.` + baseMessage;
    return undefined;
  };

  /**
   * @returns scanner sync health status
   */
  getHealthStatus = async (): Promise<HealthStatusLevel> => {
    console.log(this.connected());
    if (this.difference >= this.criticalDifference || !this.connected())
      return HealthStatusLevel.BROKEN;
    else if (this.difference >= this.warnDifference)
      return HealthStatusLevel.UNSTABLE;
    return HealthStatusLevel.HEALTHY;
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
