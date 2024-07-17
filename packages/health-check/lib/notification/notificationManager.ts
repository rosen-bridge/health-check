import { NotifyWithSeverity } from '@rosen-bridge/abstract-notification';

import { AbstractHealthCheckParam } from '../abstractHealthCheckParam';

import {
  HealthNotificationManagerNotifiedHandler,
  NotificationCheck,
} from './types';
import { ParamHistory, ParamId } from '../history/types';

/**
 * Wrap a function for sending notifications based on a history. Whenever the
 * function gets called, a list of checks are run against the history and a list
 * of notifications are sent for passed checks.
 */
class NotificationManager {
  private notificationChecks: NotificationCheck[] = [];
  private notify: NotifyWithSeverity;
  private getParamById: (id: ParamId) => AbstractHealthCheckParam | undefined;
  private notifiedHandler: HealthNotificationManagerNotifiedHandler;

  [Symbol.toStringTag] = 'NotificationManager';

  /**
   * @param notify the function that sends notifications
   * @param notifiedHandler an event handler that gets called when a
   * notification is sent successfully
   * @param getParamById a function to get a param object from its id
   */
  constructor(
    notify: NotifyWithSeverity,
    getParamById: (id: ParamId) => AbstractHealthCheckParam | undefined,
    notifiedHandler?: HealthNotificationManagerNotifiedHandler,
  ) {
    this.notify = notify;
    this.getParamById = getParamById;
    this.notifiedHandler = notifiedHandler ?? (() => {});
  }

  /**
   * set a callback to be run whenever a notification for a param is sent
   * @param updateHandler
   */
  onNotified = (notifiedHandler: HealthNotificationManagerNotifiedHandler) => {
    this.notifiedHandler = notifiedHandler;
  };

  /**
   * register a notification check
   * @param notificationCheck
   */
  registerCheck = (notificationCheck: NotificationCheck) => {
    this.notificationChecks.push(notificationCheck);
  };

  /**
   * send all required notifications for a specific param based on its history
   * @param paramId
   * @param paramHistory
   */
  sendNotifications = async (paramId: ParamId, paramHistory: ParamHistory) => {
    const eligibleNotificationChecks = this.notificationChecks.filter(
      (notificationCheck) => notificationCheck.check(paramHistory),
    );

    const param = this.getParamById(paramId);
    if (!param) return;

    await Promise.all(
      eligibleNotificationChecks.map(async (notificationCheck) => {
        await this.notify(
          notificationCheck.severity,
          await notificationCheck.getTitle(param),
          await notificationCheck.getDescription(param),
        );
        await this.notifiedHandler(paramId);
      }),
    );
  };
}

export default NotificationManager;
