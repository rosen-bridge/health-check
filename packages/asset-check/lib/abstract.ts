import {
  AbstractHealthCheckParam,
  HealthStatusLevel,
} from '@rosen-bridge/health-check';

abstract class AbstractAssetHealthCheckParam extends AbstractHealthCheckParam {
  protected assetName: string;
  protected assetId: string;
  protected address: string;
  protected tokenAmount: bigint;
  protected warnThreshold: bigint;
  protected criticalThreshold: bigint;
  protected assetDecimal: number;

  constructor(
    assetId: string,
    assetName: string,
    address: string,
    warnThreshold: bigint,
    criticalThreshold: bigint,
    assetDecimal: number,
  ) {
    super();
    this.assetId = assetId;
    this.assetName = assetName;
    this.address = address;
    this.warnThreshold = warnThreshold;
    this.criticalThreshold = criticalThreshold;
    this.assetDecimal = assetDecimal;
    this.tokenAmount = 0n;
  }

  /**
   * generates a title for parameter with asset name
   * @returns parameter title
   */
  getTitle = async (): Promise<string> => {
    return `Available ${this.assetName} Balance`;
  };

  /**
   * generates a unique id with asset name and address
   * @returns parameter id
   */
  getId = (): string => {
    return `asset_${this.assetId}_${this.address}`;
  };

  /**
   * generate parameter description
   * @returns parameter description
   */
  getDescription = async (): Promise<string> => {
    return `Checks if the ${this.address.slice(0, 6)} address has a sufficient ${this.assetName} balance. The current balance is ${this.getTokenDecimalStr(
      this.tokenAmount,
    )}.`;
  };

  /**
   * if asset amount is less than the thresholds returns the required notification
   * @returns parameter health description
   */
  getDetails = async (): Promise<string | undefined> => {
    if (this.tokenAmount < this.criticalThreshold)
      return (
        `Service has stopped working due to insufficient ${this.assetName} balance` +
        ` (${this.getTokenDecimalStr(this.criticalThreshold)} ${
          this.assetName
        } is required, but ${this.getTokenDecimalStr(
          this.tokenAmount,
        )} is available).\n` +
        `Please top up ${this.address} with ${this.assetName}`
      );
    else if (this.tokenAmount < this.warnThreshold)
      return (
        `Service is in an unstable situation due to a low ${this.assetName} balance` +
        ` (${this.getTokenDecimalStr(this.warnThreshold)} ${
          this.assetName
        } is recommended, but ${this.getTokenDecimalStr(
          this.tokenAmount,
        )} is available).\n` +
        `Please top up ${this.address} with ${this.assetName}, otherwise your service will stop working soon.`
      );
    return undefined;
  };

  /**
   * @returns asset health status
   */
  getHealthStatus = async (): Promise<HealthStatusLevel> => {
    if (this.tokenAmount < this.criticalThreshold)
      return HealthStatusLevel.BROKEN;
    else if (this.tokenAmount < this.warnThreshold)
      return HealthStatusLevel.UNSTABLE;
    else return HealthStatusLevel.HEALTHY;
  };

  /**
   * Generates asset amount with its decimal
   * @param amount token amount without decimal
   * @returns token amount string considering decimal
   */
  getTokenDecimalStr = (amount: bigint) => {
    if (!this.assetDecimal) return amount.toString();
    const roundTokenAmount =
      amount.toString().slice(0, -this.assetDecimal) || '0';
    const decimalTokenAmount = amount
      .toString()
      .slice(-this.assetDecimal)
      .padStart(this.assetDecimal, '0');
    return `${roundTokenAmount}.${decimalTokenAmount}`.replace(/\.?0+$/, '');
  };
}

export { AbstractAssetHealthCheckParam };
