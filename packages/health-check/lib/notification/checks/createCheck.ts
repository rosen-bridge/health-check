import { NotificationCheck, NotificationCheckContext } from '../types';

/**
 * Merge a notification check object with a context, essentially enabling the
 * usage of its functions by providing required `this` parameters
 * The main reason for the existence of this function is for typechecking
 * purposes
 * @param proto
 * @param context
 */
const createCheck = (
  proto: NotificationCheck,
  context: NotificationCheckContext,
): NotificationCheck & NotificationCheckContext =>
  ({
    __proto__: proto,
    ...context,
  }) as unknown as NotificationCheck & NotificationCheckContext;

export default createCheck;
