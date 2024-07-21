import {
  NotificationSeverity,
  NotifyWithSeverity,
} from '@rosen-bridge/abstract-notification';

import { ParamHistory, ParamId } from '../history/types';
import { AbstractHealthCheckParam } from '../abstractHealthCheckParam';

export interface NotificationCheckContext {
  history: ParamHistory;
  param: AbstractHealthCheckParam;
}

export interface NotificationCheck {
  [Symbol.toStringTag]: string;
  id: string;
  /**
   * notifications of this check will be sent with this severity
   */
  getSeverity(this: NotificationCheckContext): NotificationSeverity;
  /**
   * check if a notification should be sent based on the history
   * @param history
   */
  check(this: NotificationCheckContext): boolean;
  /**
   * get title for the notification to be sent
   * @param param
   */
  getTitle(this: NotificationCheckContext): Promise<string>;
  /**
   * get description for the notification to be sent
   * @param param
   */
  getDescription(this: NotificationCheckContext): Promise<string>;
}

export type HealthNotificationManagerNotifiedHandler = (
  param: ParamId,
  /**
   * the arguments that were passed to `notify`
   */
  notifyArgs: Readonly<Parameters<NotifyWithSeverity>>,
) => unknown;
