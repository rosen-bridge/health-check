import {
  NotificationSeverity,
  NotifyWithSeverity,
} from '@rosen-bridge/abstract-notification';

import { ParamHistory, ParamId } from '../history/types';
import { AbstractHealthCheckParam } from '../abstractHealthCheckParam';

/**
 * The context (or this type) {@link NotificationCheck} works in
 */
export interface NotificationCheckContext {
  history: ParamHistory;
  param: AbstractHealthCheckParam;
}

/**
 * The main interface for notification checks
 *
 * Note that all of the functions of the interface are this-aware, so an
 * appropriate {@link NotificationCheckContext} should be provided (implicitly
 * via delegation, or explicitly with `call`, etc.) for them to work
 */
export interface NotificationCheck {
  [Symbol.toStringTag]: string;
  id: string;
  /**
   * notifications of this check will be sent with this severity
   */
  getSeverity(this: NotificationCheckContext): NotificationSeverity;
  /**
   * check if a notification should be sent based on the history
   */
  check(this: NotificationCheckContext): boolean;
  /**
   * get title for the notification to be sent
   */
  getTitle(this: NotificationCheckContext): Promise<string>;
  /**
   * get description for the notification to be sent
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
