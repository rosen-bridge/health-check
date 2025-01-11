import {
  AbstractHealthCheckParam,
  HealthStatusLevel,
} from '@rosen-bridge/health-check';
import { minBy } from 'lodash-es';

import { EventInfo } from './interfaces';

export class EventProgressHealthCheckParam extends AbstractHealthCheckParam {
  private stuckEvents: Array<EventInfo> = [];
  private eventWithMaxTry: EventInfo | undefined;

  constructor(
    private getActiveEvents: () => Promise<Array<EventInfo>>,
    private durationWarnThreshold: number,
    private durationCriticalThreshold: number,
  ) {
    super();
  }

  /**
   * get param title
   */
  getTitle = async (): Promise<string> => {
    return `Event Progress`;
  };

  /**
   * get param id
   */
  getId = (): string => {
    return `event_progress`;
  };

  /**
   * get param description
   */
  getDescription = async (): Promise<string> => {
    return `Checks the elapsed time since the first attempt at processing the event.`;
  };

  /**
   * return the elapsed time from a timestamp
   * @timestamp timestamp in seconds
   */
  private getElapsedTime = (timestamp: string): number => {
    return Math.round(Date.now() / 1000) - Number(timestamp);
  };

  /**
   * return passed stuck duration threshold and number of events with higher stuck duration
   */
  private getStuckDetails = () => {
    if (!this.eventWithMaxTry) return undefined;
    const elapsedTime = this.getElapsedTime(this.eventWithMaxTry.firstTry);
    let stuckDuration = 0;
    if (elapsedTime >= this.durationCriticalThreshold)
      stuckDuration = this.durationCriticalThreshold;
    else if (elapsedTime >= this.durationWarnThreshold)
      stuckDuration = this.durationWarnThreshold;
    const stuckEventCount = this.stuckEvents.filter(
      (tx) => this.getElapsedTime(tx.firstTry) >= stuckDuration,
    ).length;
    return {
      stuckDuration,
      stuckEventCount,
    };
  };

  /**
   * generate description based on the stuck duration of the events
   */
  getDetails = async (): Promise<string | undefined> => {
    if (!this.eventWithMaxTry) return undefined;
    const { stuckDuration, stuckEventCount } = this.getStuckDetails()!;
    const stuckDurationInHour = Math.round(stuckDuration / 3600);
    const highestDurationInHour = Math.round(
      this.getElapsedTime(this.eventWithMaxTry.firstTry) / 3600,
    );
    return (
      `Service is not working properly because ${stuckEventCount} ` +
      (stuckEventCount === 1 ? 'event is ' : 'events are ') +
      `stuck for more than ${stuckDurationInHour} hours. ` +
      `Event with the highest stuck duration is ` +
      `${this.eventWithMaxTry.id} with status ` +
      `${this.eventWithMaxTry.status} which is stuck for ` +
      `${highestDurationInHour} hours.`
    );
  };

  /**
   * return event progress health status
   */
  getHealthStatus = async (): Promise<HealthStatusLevel> => {
    if (!this.eventWithMaxTry) return HealthStatusLevel.HEALTHY;
    const elapsedTime = this.getElapsedTime(this.eventWithMaxTry.firstTry);
    if (elapsedTime >= this.durationCriticalThreshold)
      return HealthStatusLevel.BROKEN;
    if (elapsedTime >= this.durationWarnThreshold)
      return HealthStatusLevel.UNSTABLE;
    return HealthStatusLevel.HEALTHY;
  };

  /** update the stuck event list and event with max stuck duration */
  updateStatus = async () => {
    const activeTransactions = await this.getActiveEvents();
    this.stuckEvents = activeTransactions.filter(
      (event) =>
        this.getElapsedTime(event.firstTry) >= this.durationWarnThreshold,
    );
    this.eventWithMaxTry = minBy(this.stuckEvents, 'firstTry');
  };
}
