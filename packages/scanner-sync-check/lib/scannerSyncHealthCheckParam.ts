import {
  AbstractHealthCheckParam,
  HealthStatusLevel,
} from '@rosen-bridge/health-check';
import { formatDistance } from 'date-fns';
import { upperFirst } from 'lodash-es';
import { LastSavedBlock } from './config';

class ScannerSyncHealthCheckParam extends AbstractHealthCheckParam {
  protected chain: string;
  protected lastBlockHeight: number;
  protected warnBlockTimeGap: number;
  protected formattedTime: string;
  protected lastBlockGap: number | undefined;
  protected criticalBlockTimeGap: number;

  constructor(
    chain: string,
    protected getLastSavedBlock: () => Promise<LastSavedBlock>,
    protected warnDifference: number,
    protected criticalDifference: number,
    blockTime: number,
  ) {
    super();
    this.chain = chain;
    this.criticalBlockTimeGap = criticalDifference * blockTime;
    this.warnBlockTimeGap = warnDifference * blockTime;
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
    return `The last block saved by the ${upperFirst(this.chain)} scanner is ${this.lastBlockHeight}, saved ${this.formattedTime} ago.`;
  };

  /**
   * generate parameter description
   * @returns parameter description
   */
  getDescription = () => {
    const baseMessage = 'Checks if the scanner is in sync with the network.';
    if (this.lastBlockHeight !== undefined) {
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
    if (!this.lastBlockGap) {
      return;
    }
    const message = `Last block at height ${this.lastBlockHeight} is stored ${this.formattedTime} ago.`;

    if (this.lastBlockGap >= this.criticalBlockTimeGap)
      return `Service has stopped working. ${message}`;
    else if (this.lastBlockGap >= this.warnBlockTimeGap)
      return `Service may stop working soon. ${message}`;

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
    if (
      this.lastBlockHeight == undefined ||
      this.lastBlockGap == undefined ||
      this.lastBlockGap >= this.criticalBlockTimeGap
    )
      return HealthStatusLevel.BROKEN;
    else if (this.lastBlockGap >= this.warnBlockTimeGap)
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
      this.lastBlockGap = Date.now() - timestamp * 1000;
      this.formattedTime = formatDistance(Date.now(), timestamp * 1000);
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
