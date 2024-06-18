import { HealthStatusLevel } from './interfaces';

export abstract class AbstractHealthCheckParam {
  protected lastUpdateTime: Date | undefined;
  protected lastTrialErrorMessage: string | undefined;
  protected lastTrialErrorTime: Date | undefined;

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
      this.lastTrialErrorMessage = undefined;
      this.lastTrialErrorTime = undefined;
    } catch (e) {
      if (e instanceof Error) this.lastTrialErrorMessage = e.message;
      else
        this.lastTrialErrorMessage = `Unknown error occurred during update: ${e}`;
      this.lastTrialErrorTime = new Date();
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
   * get last update trial error message
   * if parameter update encountered any error during last update, it returns the error message
   */
  getLastTrialErrorMessage = () => this.lastTrialErrorMessage;

  /**
   * get last update trial error time
   * if parameter update encountered any error during last update, it returns the error time
   */
  getLastTrialErrorTime = () => this.lastTrialErrorTime;
}
