import {
  AbstractHealthCheckParam,
  HealthStatusLevel,
} from '@rosen-bridge/health-check';

import {
  BITCOIN_NATIVE_ASSET,
  CARDANO_NATIVE_ASSET,
  ERGO_NATIVE_ASSET,
} from './constants';

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
    if (
      [ERGO_NATIVE_ASSET, CARDANO_NATIVE_ASSET, BITCOIN_NATIVE_ASSET].includes(
        assetId,
      )
    )
      this.assetName = assetName.toUpperCase();
    else this.assetName = assetName;
    this.address = address;
    this.warnThreshold = warnThreshold;
    this.criticalThreshold = criticalThreshold;
    this.assetDecimal = assetDecimal;
  }

  /**
   * generates a title for parameter with asset name and asset id
   * @returns parameter title
   */
  getTitle = async (): Promise<string> => {
    return `Available ${this.assetName}`;
  };

  /**
   * generates a unique id with asset name and address
   * @returns parameter id
   */
  getId = (): string => {
    return `asset_${this.assetName}_${this.address.slice(0, 6)}`;
  };

  /**
   * generate parameter description
   * @returns parameter description
   */
  getDescription = async (): Promise<string> => {
    return `Health status of ${this.assetName} balance in address ${this.address.slice(0, 6)}. Current balance is ${this.tokenAmount}.`;
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
    return `${roundTokenAmount}.${decimalTokenAmount}`;
  };
}

export { AbstractAssetHealthCheckParam };
