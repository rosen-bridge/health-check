import {
  AbstractHealthCheckParam,
  HealthStatusLevel,
} from '@rosen-bridge/health-check';

abstract class AbstractScannerSyncHealthCheckParam extends AbstractHealthCheckParam {
  protected difference: number;

  constructor(
    protected getLastSavedBlockHeight: () => Promise<number>,
    protected scannerName: string,
    protected warnDifference: number,
    protected criticalDifference: number,
  ) {
    super();
  }

  /**
   * if the difference between scanned blocks and network blocks is more than the differences returns the required notification
   * @returns parameter health description
   */
  getDetails = async (): Promise<string | undefined> => {
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
    if (this.difference >= this.criticalDifference)
      return HealthStatusLevel.BROKEN;
    else if (this.difference >= this.warnDifference)
      return HealthStatusLevel.UNSTABLE;
    return HealthStatusLevel.HEALTHY;
  };

  /**
   * Update the health status
   */
  updateStatus = async () => {
    const lastSavedBlockHeight = await this.getLastSavedBlockHeight();
    const networkHeight = await this.getLastAvailableBlock();
    this.difference = Number(networkHeight) - lastSavedBlockHeight;
  };

  /**
   * Returns last available block in the network
   */
  abstract getLastAvailableBlock: () => Promise<number>;
}

export { AbstractScannerSyncHealthCheckParam };
