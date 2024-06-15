import {
  AbstractHealthCheckParam,
  HealthStatusLevel,
} from '@rosen-bridge/health-check';
import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import { upperFirst } from 'lodash-es';

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
  protected wrapLoggingFn = (
    level: LogLevel,
    oldFn: (message: string) => unknown,
  ) => {
    return (message: string) => {
      if (level === this.level) {
        this.times.push(Date.now());
        this.lastMessage = message;
        this.update();
      }
      oldFn(message);
    };
  };

  /**
   * wrap all logging functions in a logger
   * @param logger
   */
  protected wrapLogger = (logger: AbstractLogger) => {
    logger.debug = this.wrapLoggingFn('debug', logger.debug);
    logger.info = this.wrapLoggingFn('info', logger.info);
    logger.warn = this.wrapLoggingFn('warn', logger.warn);
    logger.error = this.wrapLoggingFn('error', logger.error);
  };

  constructor(
    logger: AbstractLogger,
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
    this.timeWindow = durationSeconds;
    this.wrapLogger(logger);
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
  getDetails = async () => {
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
  getHealthStatus = async () => {
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
  getTitle = async () => {
    return `${upperFirst(this.level)} in Logs`;
  };

  /**
   * get logger health param description
   */
  getDescription = async () => {
    return `Number of ${upperFirst(this.level)} lines in Logs.`;
  };
}

export { LogLevelHealthCheck };
