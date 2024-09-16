import {
  createInteractionContext,
  InteractionContext,
  createLedgerStateQueryClient,
} from '@cardano-ogmios/client';

import {
  AbstractHealthCheckParam,
  HealthStatusLevel,
} from '@rosen-bridge/health-check';

export class CardanoOgmiosScannerHealthCheck extends AbstractHealthCheckParam {
  private disconnectionTime: number | undefined;
  private difference: number;

  constructor(
    private getLastSavedBlockHeight: () => Promise<number>,
    private connected: () => boolean,
    private warnDifference: number,
    private criticalDifference: number,
    private ogmiosHost: string,
    private ogmiosPort: number,
    private unstableTimeWindow: number,
    private useTls = false,
  ) {
    super();
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
   * if ogmios client is disconnected return the required details
   * if the difference between scanned blocks and network blocks is more than
   *   the threshold returns the required notification
   * @returns parameter health description
   */
  getDetails = async (): Promise<string | undefined> => {
    if (
      this.disconnectionTime &&
      this.disconnectionTime + this.unstableTimeWindow < Date.now()
    )
      return (
        'Service has stopped working since Ogmios client is not connected. ' +
        'Please check the connection and restart your service.'
      );
    else if (this.disconnectionTime)
      return 'Ogmios client connection is disrupted. Service may stop working soon.';
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
    if (
      this.difference >= this.criticalDifference ||
      (this.disconnectionTime &&
        this.disconnectionTime + this.unstableTimeWindow < Date.now())
    )
      return HealthStatusLevel.BROKEN;
    else if (this.difference >= this.warnDifference || this.disconnectionTime)
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
    try {
      const height = await ogmiosClient.networkBlockHeight();
      ogmiosClient.shutdown();
      if (height == 'origin') return 0;
      else return height;
    } catch (e) {
      ogmiosClient.shutdown();
      throw new Error(
        `Checking ogmios last network block failed with error: ${e}`,
      );
    }
  };

  /**
   * update the height difference and set disconnectionTime when client is disconnected
   */
  updateStatus = async () => {
    if (this.connected()) {
      this.disconnectionTime = undefined;
      const lastSavedBlockHeight = await this.getLastSavedBlockHeight();
      const networkHeight = await this.getLastAvailableBlock();
      this.difference = networkHeight - lastSavedBlockHeight;
    } else if (!this.disconnectionTime) this.disconnectionTime = Date.now();
  };
}
