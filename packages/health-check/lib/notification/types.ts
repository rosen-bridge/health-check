import {
  NotificationSeverity,
  NotifyWithSeverity,
} from '@rosen-bridge/abstract-notification';

import { ParamHistory, ParamId } from '../history/types';
import { AbstractHealthCheckParam } from '../abstractHealthCheckParam';

export interface NotificationCheck {
  (
    param: AbstractHealthCheckParam,
    history: ParamHistory,
  ): {
    [Symbol.toStringTag]: string;
    id: string;
    /**
     * notifications of this check will be sent with this severity
     */
    getSeverity(): NotificationSeverity;
    /**
     * check if a notification should be sent based on the history
     */
    check(): boolean;
    /**
     * get title for the notification to be sent
     */
    getTitle(): Promise<string>;
    /**
     * get description for the notification to be sent
     */
    getDescription(): Promise<string>;
  };
}

export type HealthNotificationManagerNotifiedHandler = (
  param: ParamId,
  /**
   * the arguments that were passed to `notify`
   */
  notifyArgs: Readonly<Parameters<NotifyWithSeverity>>,
) => unknown;
