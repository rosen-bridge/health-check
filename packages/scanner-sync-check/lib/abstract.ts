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
    warnBlockGap: number,
    criticalBlockGap: number,
    blockTime: number,
  ) {
    super();
    this.criticalBlockTimeGap = criticalBlockGap * blockTime;
    this.warnBlockTimeGap = warnBlockGap * blockTime;
  }

  /**
   * @returns a message showing the last stored block by the scanner
   */
  abstract getLastSavedBlockMessage: () => string;

  /**
   * generate parameter description
   * @returns parameter description
   */
  getDescription = async () => {
    const baseMessage = 'Checks if the scanner is in sync with the network. ';
    if (this.lastBlockHeight != undefined) {
      return baseMessage + this.getLastSavedBlockMessage();
    } else {
      return baseMessage + `There is no available block in database.`;
    }
  };

  /**
   * The common logic of parameter details in all scanner sync checks
   * @returns
   */
  protected rawDetails = async (): Promise<string | undefined> => {
    const baseHeightDiffMessage = ` Scanner is out of sync by ${this.difference} blocks.`;
    const blockGap = (Date.now() - this.lastBlockTime) / 1000;
    let time = '';
    if (this.lastBlockTime)
      time = formatDistance(Date.now(), this.lastBlockTime);
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
      this.lastBlockHeight == undefined ||
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

  /**
   * The common logic of status update in all scanner sync checks
   */
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
    await this.rawUpdate();
  };

  /**
   * Returns last available block in the network
   */
  abstract getLastAvailableBlock: () => Promise<number>;
}

export { AbstractScannerSyncHealthCheckParam };
