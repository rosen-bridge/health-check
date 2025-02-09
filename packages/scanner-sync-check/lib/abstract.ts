import {
  AbstractHealthCheckParam,
  HealthStatusLevel,
} from '@rosen-bridge/health-check';
import { formatDistance } from 'date-fns';

abstract class AbstractScannerSyncHealthCheckParam extends AbstractHealthCheckParam {
  protected difference: number;
  protected lastBlockHeight: number;
  protected lastBlockTime: number;
  protected warnBlockTimeGap: number;
  protected criticalBlockTimeGap: number;

  constructor(
    protected getLastSavedBlockHeight: () => Promise<number>,
    protected warnDifference: number,
    protected criticalDifference: number,
    blockTime: number,
  ) {
    super();
    this.criticalBlockTimeGap = criticalDifference * blockTime;
    this.warnBlockTimeGap = warnDifference * blockTime;
  }

  protected rawDetails = async (): Promise<string | undefined> => {
    const baseHeightDiffMessage = ` Scanner is out of sync by ${this.difference} blocks.`;
    const blockGap = (Date.now() - this.lastBlockTime) / 1000;
    const time = formatDistance(Date.now(), this.lastBlockTime);
    const baseDelayedBlockMessage = ` Last block is stored ${time} ago.`;

    if (this.difference >= this.criticalDifference)
      return `Service has stopped working.` + baseHeightDiffMessage;
    else if (blockGap >= this.criticalBlockTimeGap)
      return `Service has stopped working.` + baseDelayedBlockMessage;
    else if (this.difference >= this.warnDifference)
      return `Service may stop working soon.` + baseHeightDiffMessage;
    else if (blockGap >= this.warnBlockTimeGap)
      return `Service may stop working soon.` + baseDelayedBlockMessage;

    return undefined;
  };

  /**
   * if the difference between scanned blocks and network blocks is more than
   * the differences returns the required notification
   * if the last scanned block is stored a long time ago (more than specified
   * block time gaps) returns the required notification
   * @returns parameter health description
   */
  getDetails = async (): Promise<string | undefined> => {
    return this.rawDetails();
  };

  /**
   * @returns scanner sync health status
   */
  getHealthStatus = async (): Promise<HealthStatusLevel> => {
    const blockGap = (Date.now() - this.lastBlockTime) / 1000;
    if (
      this.difference >= this.criticalDifference ||
      blockGap >= this.criticalBlockTimeGap
    )
      return HealthStatusLevel.BROKEN;
    else if (
      this.difference >= this.warnDifference ||
      blockGap >= this.warnBlockTimeGap
    )
      return HealthStatusLevel.UNSTABLE;
    return HealthStatusLevel.HEALTHY;
  };

  protected rawUpdate = async () => {
    const lastSavedBlockHeight = await this.getLastSavedBlockHeight();
    if (lastSavedBlockHeight != this.lastBlockHeight) {
      this.lastBlockHeight = lastSavedBlockHeight;
      this.lastBlockTime = Date.now();
    }
    const networkHeight = await this.getLastAvailableBlock();
    this.difference = Number(networkHeight) - lastSavedBlockHeight;
  };

  /**
   * Update the health status
   */
  updateStatus = async () => {
    this.rawUpdate();
  };

  /**
   * Returns last available block in the network
   */
  abstract getLastAvailableBlock: () => Promise<number>;
}

export { AbstractScannerSyncHealthCheckParam };
