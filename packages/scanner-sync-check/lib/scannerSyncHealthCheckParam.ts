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
    protected getLastSavedBlock: () => Promise<{
      height: number;
      timestamp: number;
    }>,
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
    const formattedTime = this.lastBlockTime
      ? formatDistance(Date.now(), this.lastBlockTime)
      : 'an unknown time';
    return `The last block saved by the ${upperFirst(this.chain)} scanner is ${this.lastBlockHeight}, saved ${formattedTime} ago.`;
  };

  /**
   * generate parameter description
   * @returns parameter description
   */
  getDescription = () => {
    const baseMessage = 'Checks if the scanner has saved any recent block. ';
    if (
      this.lastBlockHeight !== undefined &&
      this.lastBlockTime !== undefined
    ) {
      return baseMessage + this.getLastSavedBlockMessage();
    } else {
      return baseMessage + `There is no available block in the database.`;
    }
  };

  /**
   * The common logic of parameter details in all scanner sync checks
   * @returns
   */
  protected rawDetails = (): string | undefined => {
    const blockGap = (Date.now() - this.lastBlockTime) / 1000;
    const time = this.lastBlockTime
      ? formatDistance(Date.now(), this.lastBlockTime)
      : 'unknown time';
    const message = `Last block (height: ${this.lastBlockHeight}) saved ${time} ago.`;

    if (blockGap >= this.criticalBlockTimeGap)
      return `Service has stopped working. ` + message;
    else if (blockGap >= this.warnBlockTimeGap)
      return `Service may stop working soon. ` + message;

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
      this.lastBlockTime == undefined ||
      blockGap >= this.criticalBlockTimeGap
    )
      return HealthStatusLevel.BROKEN;
    else if (blockGap >= this.warnBlockTimeGap)
      return HealthStatusLevel.UNSTABLE;
    return HealthStatusLevel.HEALTHY;
  };

  /**
   * The common logic of status update in all scanner sync checks
   */
  protected rawUpdate = async () => {
    const { height, timestamp } = await this.getLastSavedBlock();
    if (height !== this.lastBlockHeight) {
      this.lastBlockHeight = height;
      this.lastBlockTime = timestamp * 1000; // تبدیل به میلی‌ثانیه
    }
  };

  /**
   * Update the health status
   */
  updateStatus = async () => {
    await this.rawUpdate();
  };
}

export { ScannerSyncHealthCheckParam };
