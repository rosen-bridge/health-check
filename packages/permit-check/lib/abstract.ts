import {
  AbstractHealthCheckParam,
  HealthStatusLevel,
} from '@rosen-bridge/health-check';

abstract class AbstractPermitHealthCheckParam extends AbstractHealthCheckParam {
  protected RWT: string;
  protected permitAddress: string;
  protected WID: string;
  protected warnThreshold: bigint;
  protected criticalThreshold: bigint;
  protected reportsCount: bigint;
  protected rwtPerCommitment: bigint;

  constructor(
    RWT: string,
    permitAddress: string,
    WID: string,
    warnThreshold: bigint,
    criticalThreshold: bigint,
    rwtPerCommitment: bigint,
  ) {
    super();
    this.RWT = RWT;
    this.permitAddress = permitAddress;
    this.WID = WID;
    this.warnThreshold = warnThreshold;
    this.criticalThreshold = criticalThreshold;
    this.rwtPerCommitment = rwtPerCommitment;
  }

  /**
   * generates a unique id with WID
   * @returns parameter id
   */
  getId = (): string => {
    return `permit`;
  };

  /**
   * generates a unique title
   * @returns parameter title
   */
  getTitle = async () => {
    return `Available Reporting Permits`;
  };

  /**
   * generate description
   * @returns parameter description
   */
  getDescription = async () => {
    return `Checks if the watcher has sufficient permits for reporting. Currently has ${this.reportsCount} available report permit.`;
  };

  /**
   * if RWT count in permits is less than the thresholds returns the required notification
   * @returns parameter health description
   */
  getDetails = async (): Promise<string | undefined> => {
    if (this.reportsCount <= this.criticalThreshold)
      return (
        `Insufficient or critical amount of permit tokens.\n` +
        `Service may stop working soon. Only ${this.reportsCount} report permits is left.` +
        ` Please lock more RSN to get more report permits.`
      );
    else if (this.reportsCount <= this.warnThreshold)
      return (
        `Service may stop working soon. Available report permits ${this.reportsCount} is less than ` +
        `the recommended reports ${this.warnThreshold}. Please lock more RSN to get more report permits.`
      );
    return undefined;
  };

  /**
   * @returns asset health status
   */
  getHealthStatus = async (): Promise<HealthStatusLevel> => {
    if (this.reportsCount <= this.criticalThreshold)
      return HealthStatusLevel.BROKEN;
    else if (this.reportsCount <= this.warnThreshold)
      return HealthStatusLevel.UNSTABLE;
    return HealthStatusLevel.HEALTHY;
  };

  /**
   * Updates the rwtPerCommitment to adapt to config changes
   * @param rwtPerCommitment
   */
  updateRwtPerCommitment = async (rwtPerCommitment: bigint) => {
    this.rwtPerCommitment = rwtPerCommitment;
  };
}

export { AbstractPermitHealthCheckParam };
