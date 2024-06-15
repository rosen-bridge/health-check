import { HealthStatusLevel } from './interfaces';

export abstract class AbstractHealthCheckParam {
  lastUpdateTime: Date | undefined;
  lastTrialError: string | undefined;

  /**
   * get param id
   */
  abstract getId: () => string;

  /**
   * get param title
   */
  abstract getTitle: () => Promise<string>;

  /**
   * get param description
   */
  abstract getDescription: () => Promise<string>;

  /**
   * update health status for this param
   */
  abstract updateStatus: () => unknown;

  /**
   * try to update the health status and store update timestamp
   * store error message in case of failure
   */
  update = async () => {
    try {
      await this.updateStatus();
      this.lastUpdateTime = new Date();
    } catch (e) {
      if (e instanceof Error) this.lastTrialError = e.message;
      else this.lastTrialError = `Unknown error occurred during update: ${e}`;
    }
  };

  /**
   * get health status for this param
   */
  abstract getHealthStatus: () => Promise<HealthStatusLevel>;

  /**
   * get health status details for this param.
   * if status is HEALTHY return undefined otherwise return detail string
   */
  abstract getDetails: () => Promise<string | undefined>;

  /**
   * get last updated time
   * if not running till now return undefined
   */
  getLastUpdatedTime = () => this.lastUpdateTime;

  /**
   * get last update trial error
   * if parameter update encounter any error, it stores the error message
   */
  getLastTrialError = () => this.lastTrialError;
}
