import {
  AbstractHealthCheckParam,
  HealthStatusLevel,
} from '@rosen-bridge/health-check';
import { formatDistance } from 'date-fns';
import { upperFirst } from 'lodash-es';

class ScannerSyncHealthCheckParam extends AbstractHealthCheckParam {
  protected chain: string;
  protected difference: number;
  protected lastBlockHeight: number;
  protected lastBlockTime: number;
  protected warnBlockTimeGap: number;
  protected criticalBlockTimeGap: number;

  constructor(
    chain: string,
    protected getLastNetworkHeight: () => number | undefined,
    protected getLastSavedBlockHeight: () => Promise<number>,
    protected warnDifference: number,
    protected criticalDifference: number,
    warnBlockGap: number,
    criticalBlockGap: number,
    blockTime: number,
  ) {
    super();
    this.chain = chain;
    this.criticalBlockTimeGap = criticalBlockGap * blockTime;
    this.warnBlockTimeGap = warnBlockGap * blockTime;
  }

  /**
   * generate a unique id with network name and type
   * @returns parameter id
   */
  getId = (): string => {
    return `${this.chain.toLowerCase()}_scanner`;
  };

  /**
   * generate a unique title with network name and type
   * @returns parameter title
   */
  getTitle = () => {
    return `${upperFirst(this.chain)} Scanner Sync`;
  };

  /**
   * @returns a message showing the last stored block by the scanner
   */
  getLastSavedBlockMessage: () => string = () => {
    return `The last block saved by the ${upperFirst(this.chain)} scanner is ${this.lastBlockHeight}.`;
  };

  /**
   * generate parameter description
   * @returns parameter description
   */
  getDescription = () => {
    const baseMessage = `Checks if the scanner is in sync with the ${upperFirst(this.chain)} network. `;
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
  protected rawDetails = (): string | undefined => {
    const baseHeightDiffMessage = `The ${upperFirst(this.chain)} scanner is out of sync by ${this.difference} blocks.`;
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
  getDetails = (): string | undefined => {
    return this.rawDetails();
  };

  /**
   * @returns scanner sync health status
   */
  getHealthStatus = (): HealthStatusLevel => {
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
    const networkHeight = this.getLastNetworkHeight();
    if (networkHeight == undefined)
      throw new Error(
        `The last ${upperFirst(this.chain)} network height is undefined.`,
      );
    this.difference = Number(networkHeight) - lastSavedBlockHeight;
  };

  /**
   * Update the health status
   */
  updateStatus = async () => {
    await this.rawUpdate();
  };
}

export { ScannerSyncHealthCheckParam };
