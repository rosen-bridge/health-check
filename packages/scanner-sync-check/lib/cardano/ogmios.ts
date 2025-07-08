import {
  createInteractionContext,
  InteractionContext,
  createLedgerStateQueryClient,
} from '@cardano-ogmios/client';
import { HealthStatusLevel } from '@rosen-bridge/health-check';

import { ScannerSyncHealthCheckParam } from '../scannerSyncHealthCheckParam';

export class CardanoOgmiosScannerHealthCheck extends ScannerSyncHealthCheckParam {
  private disconnectionTime: number | undefined;
  private lastNetworkBlock: number | undefined;

  constructor(
    getLastSavedBlockHeight: () => Promise<number>,
    private connected: () => boolean,
    warnDifference: number,
    criticalDifference: number,
    private ogmiosHost: string,
    private ogmiosPort: number,
    private unstableTimeWindow: number,
    private useTls = false,
    warnBlockGap = warnDifference,
    criticalBlockGap = criticalDifference,
    blockTime = 20,
  ) {
    super(
      'cardano',
      () => this.getLastNetworkHeight(),
      getLastSavedBlockHeight,
      warnDifference,
      criticalDifference,
      warnBlockGap,
      criticalBlockGap,
      blockTime,
    );
  }

  /**
   * if ogmios client is disconnected return the required details
   * if the difference between scanned blocks and network blocks is more than
   *   the threshold returns the required notification
   * @returns parameter health description
   */
  getDetails = (): string | undefined => {
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

    return this.rawDetails();
  };

  /**
   * @returns scanner sync health status
   */
  getHealthStatus = (): HealthStatusLevel => {
    const blockDelay = (Date.now() - this.lastBlockTime) / 1000;
    if (
      this.difference >= this.criticalDifference ||
      (this.disconnectionTime &&
        this.disconnectionTime + this.unstableTimeWindow < Date.now()) ||
      blockDelay >= this.criticalBlockTimeGap
    )
      return HealthStatusLevel.BROKEN;
    else if (
      this.difference >= this.warnDifference ||
      this.disconnectionTime ||
      blockDelay > this.warnBlockTimeGap
    )
      return HealthStatusLevel.UNSTABLE;
    return HealthStatusLevel.HEALTHY;
  };

  /**
   * update last available block in network
   */
  updateLastNetworkBlock = async () => {
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
      if (height == 'origin') this.lastNetworkBlock = 0;
      else this.lastNetworkBlock = height;
    } catch (e) {
      ogmiosClient.shutdown();
      throw new Error(
        `Checking ogmios last network block failed with error: ${e}`,
      );
    }
  };

  /**
   * @returns last network height
   */
  getLastNetworkHeight = (): number | undefined => {
    return this.lastNetworkBlock;
  };

  /**
   * update the height difference and set disconnectionTime when client is disconnected
   */
  updateStatus = async () => {
    await this.updateLastNetworkBlock();
    if (this.connected()) {
      this.disconnectionTime = undefined;
      await this.rawUpdate();
    } else if (!this.disconnectionTime) this.disconnectionTime = Date.now();
  };
}
