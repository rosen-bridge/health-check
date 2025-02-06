import {
  AbstractHealthCheckParam,
  HealthStatusLevel,
} from '@rosen-bridge/health-check';

import { ConvertTime } from './utils';

abstract class AbstractScannerSyncHealthCheckParam extends AbstractHealthCheckParam {
  protected difference: number;
  protected lastBlockHeight: number;
  protected lastBlockTime: number;

  constructor(
    protected getLastSavedBlockHeight: () => Promise<number>,
    protected scannerName: string,
    protected warnDifference: number,
    protected criticalDifference: number,
    protected warnBlockTimeDelay: number, // in seconds
    protected criticalBlockTimeDelay: number, // in seconds
  ) {
    super();
  }

  /**
   * if the difference between scanned blocks and network blocks is more than
   * the differences returns the required notification
   * if the last scanned block is stored a long time ago (more than specified
   * block time delays) returns the required notification
   * @returns parameter health description
   */
  getDetails = async (): Promise<string | undefined> => {
    const baseHeightDiffMessage = ` Scanner is out of sync by ${this.difference} blocks.`;
    let blockDelay = (Date.now() - this.lastBlockTime) / 1000;
    const time = ConvertTime(blockDelay);
    const baseDelayedBlockMessage = ` Last block is stored ${time} ago.`;

    if (this.difference >= this.criticalDifference)
      return `Service has stopped working.` + baseHeightDiffMessage;
    else if (blockDelay >= this.criticalBlockTimeDelay)
      return `Service has stopped working.` + baseDelayedBlockMessage;
    else if (this.difference >= this.warnDifference)
      return `Service may stop working soon.` + baseHeightDiffMessage;
    else if (blockDelay >= this.warnBlockTimeDelay)
      return `Service may stop working soon.` + baseDelayedBlockMessage;

    return undefined;
  };

  /**
   * @returns scanner sync health status
   */
  getHealthStatus = async (): Promise<HealthStatusLevel> => {
    let blockDelay = (Date.now() - this.lastBlockTime) / 1000;
    if (
      this.difference >= this.criticalDifference ||
      blockDelay >= this.criticalBlockTimeDelay
    )
      return HealthStatusLevel.BROKEN;
    else if (
      this.difference >= this.warnDifference ||
      blockDelay >= this.warnBlockTimeDelay
    )
      return HealthStatusLevel.UNSTABLE;
    return HealthStatusLevel.HEALTHY;
  };

  /**
   * Update the health status
   */
  updateStatus = async () => {
    const lastSavedBlockHeight = await this.getLastSavedBlockHeight();
    if (lastSavedBlockHeight != this.lastBlockHeight) {
      this.lastBlockHeight = lastSavedBlockHeight;
      this.lastBlockTime = Date.now();
    }
    const networkHeight = await this.getLastAvailableBlock();
    this.difference = Number(networkHeight) - lastSavedBlockHeight;
  };

  /**
   * Returns last available block in the network
   */
  abstract getLastAvailableBlock: () => Promise<number>;
}

export { AbstractScannerSyncHealthCheckParam };
