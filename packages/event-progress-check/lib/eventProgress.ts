import {
  AbstractHealthCheckParam,
  HealthStatusLevel,
} from '@rosen-bridge/health-check';
import { minBy } from 'lodash-es';

import { EventInfo } from './interfaces';

export class EventProgressHealthCheckParam extends AbstractHealthCheckParam {
  private stuckEvents: Array<EventInfo> = [];
  private eventWithMaxTry: EventInfo | undefined;
  private currentTimeStamp = () => Math.round(Date.now() / 1000);

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
    return `Checks the amount of time passed by the first attempt to process the event.`;
  };

  /**
   * return passed stuck duration threshold and number of events with higher stuck duration
   */
  private getStuckDetails = () => {
    if (!this.eventWithMaxTry) return undefined;
    const currentTimestamp = this.currentTimeStamp();
    let stuckDuration = 0;
    if (
      currentTimestamp - Number(this.eventWithMaxTry.firstTry) >=
      this.durationCriticalThreshold
    )
      stuckDuration = this.durationCriticalThreshold;
    else if (
      currentTimestamp - Number(this.eventWithMaxTry.firstTry) >=
      this.durationWarnThreshold
    )
      stuckDuration = this.durationWarnThreshold;
    const stuckEventCount = this.stuckEvents.filter(
      (tx) => currentTimestamp - Number(tx.firstTry) >= stuckDuration,
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
    const stuckDurationInMinute = Math.round(stuckDuration / 60);
    const highestDurationInMinute = Math.round(
      Math.round(Date.now() / 1000) -
        Number(this.eventWithMaxTry.firstTry) / 60,
    );
    return `Service is not working properly because ${stuckEventCount} ` +
      (stuckEventCount === 1)
      ? 'event is '
      : 'events are ' +
          `stuck for more than ${stuckDurationInMinute} minutes. ` +
          `Event with the highest stuck duration is ` +
          `${this.eventWithMaxTry.id} with status ` +
          `${this.eventWithMaxTry.status} which is stuck for ` +
          `${highestDurationInMinute} minutes.`;
  };

  /**
   * return event progress health status
   */
  getHealthStatus = async (): Promise<HealthStatusLevel> => {
    if (!this.eventWithMaxTry) return HealthStatusLevel.HEALTHY;
    const currentTimestamp = this.currentTimeStamp();
    if (
      currentTimestamp - Number(this.eventWithMaxTry.firstTry) >=
      this.durationCriticalThreshold
    )
      return HealthStatusLevel.BROKEN;
    if (
      currentTimestamp - Number(this.eventWithMaxTry.firstTry) >=
      this.durationWarnThreshold
    )
      return HealthStatusLevel.UNSTABLE;
    return HealthStatusLevel.HEALTHY;
  };

  /** update the stuck event list and event with max stuck duration */
  updateStatus = async () => {
    const currentTimestamp = this.currentTimeStamp();
    const activeTransactions = await this.getActiveEvents();
    this.stuckEvents = activeTransactions.filter(
      (event) =>
        currentTimestamp - Number(event.firstTry) >= this.durationWarnThreshold,
    );
    this.eventWithMaxTry = minBy(this.stuckEvents, 'firstTry');
  };
}
