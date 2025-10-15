import { upperFirst } from 'lodash-es';

import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import { CallbackLoggerFactory } from '@rosen-bridge/callback-logger';
import {
  AbstractHealthCheckParam,
  HealthStatusLevel,
} from '@rosen-bridge/health-check';

type LogLevel = keyof AbstractLogger;

class LogLevelHealthCheck extends AbstractHealthCheckParam {
  // list of occurrence of logs
  protected times: Array<number>;
  // last occurred log
  protected lastMessage: string;
  // expected log level
  protected readonly level: LogLevel;
  // unhealthy status
  protected readonly unhealthyStatus: HealthStatusLevel;
  // maximum allowed log in selected level. if more logs occurred status become unhealthy
  protected readonly maxAllowedCount: number;
  // time window for occurrence of logs
  protected readonly timeWindow: number;

  /**
   * wrapping a log function.
   * if logging level is as what we expected store logging time
   * then call old logging function
   * @param level: selected logs level
   * @param oldFn: old logging function
   */
  protected callbackGenerator = (level: LogLevel) => {
    return (message: string) => {
      if (level === this.level) {
        this.times.push(Date.now());
        this.lastMessage = message;
        this.update();
      }
    };
  };

  constructor(
    loggerFactory: CallbackLoggerFactory,
    unhealthyStatus: HealthStatusLevel,
    maxAllowedLog: number,
    durationSeconds: number,
    level: LogLevel,
  ) {
    super();
    this.times = [];
    this.level = level;
    this.unhealthyStatus = unhealthyStatus;
    this.maxAllowedCount = maxAllowedLog;
    this.timeWindow = durationSeconds * 1000;
    loggerFactory.registerCallback(level, this.callbackGenerator(level));
  }

  /**
   * update parameter and remove old logging times
   */
  updateStatus = () => {
    const firstTime = Date.now() - this.timeWindow;
    this.times = this.times.filter((item) => item > firstTime);
  };

  /**
   * get logging description. if status is not HEALTHY return last occurred error
   */
  getDetails = () => {
    if (this.times.length > this.maxAllowedCount) {
      return `There are ${this.times.length} ${this.level}s in logs. The last one is "${this.lastMessage}".`;
    }
    return undefined;
  };

  /**
   * get current health status.
   * if logs in time window more than expected count return selected unhealthy status
   * otherwise return HEALTHY
   */
  getHealthStatus = () => {
    if (this.times.length > this.maxAllowedCount) {
      return this.unhealthyStatus;
    }
    return HealthStatusLevel.HEALTHY;
  };

  /**
   * get logger health param id
   */
  getId = () => {
    return `${this.level}_logs`;
  };

  /**
   * get logger health param title
   */
  getTitle = () => {
    return `${upperFirst(this.level)} in Logs`;
  };

  /**
   * get logger health param description
   */
  getDescription = () => {
    return `Counts number of ${upperFirst(this.level)}s in log.`;
  };
}

export { LogLevelHealthCheck };
