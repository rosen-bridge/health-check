import { describe, expect, it, vi } from 'vitest';

import {
  NotificationSeverity,
  NotifyWithSeverity,
} from '@rosen-bridge/abstract-notification';

import { AbstractHealthCheckParam } from '../../lib';
import NotificationManager from '../../lib/notification/notificationManager';

const trueCheckTitle = 'Always true title';
const trueCheckDescription = 'Always true description';
const falseCheckTitle = 'Always false title';
const falseCheckDescription = 'Always false description';
const checkSeverity = () => 'info' as NotificationSeverity;

/**
 * create an instance of NotificationManager and register two checks to it
 */
const createFixture = ({
  notify = async () => {},
  notifiedHandler = () => {},
}: {
  notify?: NotifyWithSeverity;
  notifiedHandler?: () => void;
} = {}) => {
  const notificationManager = new NotificationManager(
    notify,
    () => ({}) as AbstractHealthCheckParam,
    notifiedHandler,
  );

  notificationManager.registerCheck(() => ({
    [Symbol.toStringTag]: 'AlwaysTrueCheck',
    id: 'always-true',
    check: () => true,
    getTitle: async () => trueCheckTitle,
    getDescription: async () => trueCheckDescription,
    getSeverity: checkSeverity,
  }));
  notificationManager.registerCheck(() => ({
    [Symbol.toStringTag]: 'AlwaysFalseCheck',
    id: 'always-false',
    check: () => false,
    getTitle: async () => falseCheckTitle,
    getDescription: async () => falseCheckDescription,
    getSeverity: checkSeverity,
  }));

  return notificationManager;
};

describe('NotificationManager', () => {
  describe('sendNotifications', () => {
    /**
     * @target `sendNotifications` should send notifications
     * @dependencies
     * @scenario
     * - create an instance of notification manager
     * - register two checks, one that triggers a notification and one that
     * doesn't
     * - call `sendNotification`
     * @expected
     * - eligible check notification should be sent
     */
    it('should send notifications', async () => {
      const notify = vi.fn();
      const notificationManager = createFixture({ notify });

      await notificationManager.sendNotifications('some-param', [
        { result: 'unknown', timestamp: 123456 },
      ]);

      expect(notify).toHaveBeenCalledOnce();
      expect(notify).toBeCalledWith(
        checkSeverity(),
        trueCheckTitle,
        trueCheckDescription,
      );
    });

    /**
     * @target `sendNotifications` should call `notifiedHandler` after a
     * successful notification sending
     * @dependencies
     * @scenario
     * - create an instance of notification manager
     * - register two checks, one that triggers a notification and one that
     * doesn't
     * - call `sendNotification`
     * @expected
     * - `notifiedHandler` should be called with correct arguments
     */
    it('should call `notifiedHandler` after a successful notification sending', async () => {
      const notifiedHandler = vi.fn();
      const paramName = 'some-param';
      const notificationManager = createFixture({ notifiedHandler });

      await notificationManager.sendNotifications(paramName, [
        { result: 'unknown', timestamp: 123456 },
      ]);

      expect(notifiedHandler).toHaveBeenCalledOnce();
      expect(notifiedHandler).toBeCalledWith(paramName, [
        checkSeverity(),
        trueCheckTitle,
        trueCheckDescription,
      ]);
    });
  });

  describe('onNotified', () => {
    /**
     * @target `onNotified` should call all of the notified handlers
     * @dependencies
     * @scenario
     * - create an instance of notification manager
     * - register two additional notified handlers
     * - call `sendNotification`
     * @expected
     * - both notified handlers should get called
     */
    it('should call all of the update handlers', async () => {
      const notifiedHandler1 = vi.fn();
      const notifiedHandler2 = vi.fn();
      const notificationManager = createFixture();
      notificationManager.onNotified(notifiedHandler1);
      notificationManager.onNotified(notifiedHandler2);

      await notificationManager.sendNotifications('some-param', [
        { result: 'unknown', timestamp: 123456 },
      ]);

      expect(notifiedHandler1).toHaveBeenCalledOnce();
      expect(notifiedHandler2).toHaveBeenCalledOnce();
    });
  });
});
