import { HealthStatusLevel } from '@rosen-bridge/health-check';

import { ScannerSyncHealthCheckParam } from '../scannerSyncHealthCheckParam';
import { LastSavedBlock } from '../config';

export class CardanoOgmiosScannerHealthCheck extends ScannerSyncHealthCheckParam {
  private disconnectionTime: number | undefined;

  constructor(
    getLastSavedBlock: () => Promise<LastSavedBlock>,
    private connected: () => boolean,
    warnDifference: number,
    criticalDifference: number,
    private unstableTimeWindow: number,
    warnBlockGap = warnDifference,
    criticalBlockGap = criticalDifference,
    blockTime = 20,
  ) {
    super(
      'cardano',
      getLastSavedBlock,
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
    ) {
      return (
        'Service has stopped working since Ogmios client is not connected. ' +
        'Please check the connection and restart your service.'
      );
    } else if (this.disconnectionTime) {
      return 'Ogmios client connection is disrupted. Service may stop working soon.';
    }

    return this.rawDetails();
  };

  /**
   * @returns scanner sync health status
   */
  getHealthStatus = (): HealthStatusLevel => {
    if (this.lastBlockTime === undefined || this.difference === undefined) {
      return HealthStatusLevel.BROKEN;
    }

    const now = Math.floor(Date.now());
    const blockTimestamp = this.lastBlockTime;
    const blockDelay = now - blockTimestamp;

    if (
      (this.disconnectionTime &&
        this.disconnectionTime + this.unstableTimeWindow < Date.now()) ||
      blockDelay >= this.criticalBlockTimeGap ||
      this.difference >= this.criticalDifference
    ) {
      return HealthStatusLevel.BROKEN;
    }

    if (
      this.disconnectionTime ||
      blockDelay >= this.warnBlockTimeGap ||
      this.difference >= this.warnDifference
    ) {
      return HealthStatusLevel.UNSTABLE;
    }

    return HealthStatusLevel.HEALTHY;
  };

  /**
   * update the height difference and set disconnectionTime when client is disconnected
   */
  updateStatus = async () => {
    if (this.connected()) {
      this.disconnectionTime = undefined;
      await this.rawUpdate();
    } else if (!this.disconnectionTime) {
      this.disconnectionTime = Date.now();
    }
  };
}
