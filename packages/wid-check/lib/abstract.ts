import {
  AbstractHealthCheckParam,
  HealthStatusLevel,
} from '@rosen-bridge/health-check';

abstract class AbstractWidHealthCheckParam extends AbstractHealthCheckParam {
  protected collateralAddress: string;
  protected awcNft: string;
  protected address: string;
  protected widExists: boolean;
  protected updateTimeStamp: Date;

  constructor(collateralAddress: string, awcNft: string, address: string) {
    super();
    this.collateralAddress = collateralAddress;
    this.address = address;
    this.awcNft = awcNft;
  }

  /**
   * generates a unique id
   * @returns parameter id
   */
  getId = (): string => {
    return `WID`;
  };

  /**
   * generates a unique title
   * @returns parameter title
   */
  getTitle = async () => {
    return `WID Token`;
  };

  /**
   * generates description
   * @returns parameter description
   */
  getDescription = async () => {
    return `Checks for the existence of the WID token in the watcher address.`;
  };

  /**
   * if WID doesn't exist fot this address, returns the required notification.
   * @returns parameter health details
   */
  getDetails = async (): Promise<string | undefined> => {
    if (!this.widExists)
      return (
        `Service has stopped working since there is no available WID for this address ${this.address}.\n` +
        `You should lock RSN to get permit and WID.`
      );
    return undefined;
  };

  /**
   * @returns wid health status
   */
  getHealthStatus = async (): Promise<HealthStatusLevel> => {
    if (!this.widExists) return HealthStatusLevel.BROKEN;
    return HealthStatusLevel.HEALTHY;
  };
}

export { AbstractWidHealthCheckParam };
