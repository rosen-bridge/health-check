import { HealthStatusLevel } from '@rosen-bridge/health-check';

import { AbstractScannerSyncHealthCheckParam } from '../abstract';

export class CardanoOgmiosScannerHealthCheck extends AbstractScannerSyncHealthCheckParam {
  private disconnectionTime: number | undefined;

  constructor(
    getLastNetworkHeight: () => Promise<number>,
    getLastSavedBlockHeight: () => Promise<number>,
    private connected: () => boolean,
    warnDifference: number,
    criticalDifference: number,
    private unstableTimeWindow: number,
    warnBlockGap = warnDifference,
    criticalBlockGap = criticalDifference,
    blockTime = 20,
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
  getLastSavedBlockMessage = () => {
    return `The last block saved by the Cardano Ogmios scanner is ${this.lastBlockHeight}.`;
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

    return this.rawDetails();
  };

  /**
   * @returns scanner sync health status
   */
  getHealthStatus = async (): Promise<HealthStatusLevel> => {
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
   * update the height difference and set disconnectionTime when client is disconnected
   */
  updateStatus = async () => {
    if (this.connected()) {
      this.disconnectionTime = undefined;
      await this.rawUpdate();
    } else if (!this.disconnectionTime) this.disconnectionTime = Date.now();
  };
}
