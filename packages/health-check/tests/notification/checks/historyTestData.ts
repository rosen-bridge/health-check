import { AbstractHealthCheckParam, HealthStatusLevel } from '../../../lib';

import { HistoryItemTag } from '../../../lib/constants';

import {
  ErrorProneHealthStatusLevel,
  ParamHistory,
  ParamHistoryItem,
} from '../../../lib/history/types';
import { NotificationCheckContext } from '../../../lib/notification/types';

/**
 * The difference between the timestamp of history items
 */
export const historyItemsInterval = 1000;

/**
 * A param serving as the context param for notification check objects
 */
class DummyParam extends AbstractHealthCheckParam {
  getId = () => 'dummy-param';
  getTitle = async () => 'Dummy Param';
  getDescription = async () => 'This is a dummy param';
  updateStatus = () => {};
  getHealthStatus = async () => HealthStatusLevel.HEALTHY;
  getDetails = async () => undefined;
}

/**
 * Create a `NotificationCheckContext` with the provided history and a dummy
 * param
 * @param history
 * @returns
 */
export const withDummyParam = (
  history: ParamHistory,
): NotificationCheckContext => ({
  history,
  param: new DummyParam(),
});

/**
 * generate history items based on the provided status and an optional tag
 */
function* createHistoryItem(): Generator<
  ParamHistoryItem,
  void,
  { status: ErrorProneHealthStatusLevel; tag?: true }
> {
  let status = 'unknown' as ErrorProneHealthStatusLevel;
  let tag = undefined;
  let timestamp = 0;
  while (true) {
    const input: { status: ErrorProneHealthStatusLevel; tag?: true } = yield {
      result: status,
      timestamp: timestamp,
      ...(tag && { tag: HistoryItemTag.NOTIFIED }),
    };
    if (!input) return;

    status = input.status;
    tag = input.tag;
    timestamp += historyItemsInterval;
  }
}
const it = createHistoryItem();
it.next();

/**
 * last item is broken
 */
export const brokenHistory: ParamHistory = [
  it.next({ status: HealthStatusLevel.HEALTHY }).value!,
  it.next({ status: HealthStatusLevel.BROKEN }).value!,
];

/**
 * a bunch of last items are broken
 */
export const recentlyBrokenHistory: ParamHistory = [
  it.next({ status: HealthStatusLevel.BROKEN }).value!,
  it.next({ status: HealthStatusLevel.BROKEN }).value!,
];

/**
 * a bunch of last items are broken
 */
export const recentlyBrokenHistoryWithUnknownBeforeTail: ParamHistory = [
  it.next({ status: HealthStatusLevel.BROKEN, tag: true }).value!,
  it.next({ status: 'unknown' }).value!,
  it.next({ status: HealthStatusLevel.BROKEN }).value!,
];

/**
 * a bunch of last items are broken
 */
export const notifiedBrokenHistoryWithUnknownTail: ParamHistory = [
  it.next({ status: HealthStatusLevel.BROKEN, tag: true }).value!,
  it.next({ status: 'unknown' }).value!,
];

/**
 * last item returned to healthy after being unhealthy and notified
 */
export const stabilizedHistory: ParamHistory = [
  it.next({ status: HealthStatusLevel.BROKEN, tag: true }).value!,
  it.next({ status: HealthStatusLevel.HEALTHY }).value!,
];

/**
 * last item returned to healthy after being unhealthy and notified
 */
export const unknownStabilizedHistory: ParamHistory = [
  it.next({ status: HealthStatusLevel.HEALTHY, tag: true }).value!,
  it.next({ status: 'unknown' }).value!,
  it.next({ status: 'unknown' }).value!,
  it.next({ status: 'unknown', tag: true }).value!,
  it.next({ status: HealthStatusLevel.HEALTHY }).value!,
];

/**
 * last item returned to healthy after being unhealthy without being notified
 */
export const notNotifiedStabilizedHistory: ParamHistory = [
  it.next({ status: HealthStatusLevel.HEALTHY, tag: true }).value!,
  it.next({ status: HealthStatusLevel.BROKEN }).value!,
  it.next({ status: HealthStatusLevel.HEALTHY }).value!,
];

/**
 * last two items are healthy after being unhealthy without being notified
 */
export const alreadyStabilizedHistory: ParamHistory = [
  it.next({ status: HealthStatusLevel.BROKEN }).value!,
  it.next({ status: HealthStatusLevel.HEALTHY }).value!,
  it.next({ status: HealthStatusLevel.HEALTHY }).value!,
];

/**
 * last two items are healthy after being unhealthy without being notified
 */
export const alreadyStabilizedHistoryWithUnknownItems: ParamHistory = [
  it.next({ status: HealthStatusLevel.BROKEN }).value!,
  it.next({ status: HealthStatusLevel.HEALTHY, tag: true }).value!,
  it.next({ status: 'unknown' }).value!,
  it.next({ status: HealthStatusLevel.HEALTHY }).value!,
];

/**
 * a bunch of last items are unstable
 */
export const recentlyUnstableHistory: ParamHistory = [
  it.next({ status: HealthStatusLevel.UNSTABLE }).value!,
  it.next({ status: HealthStatusLevel.UNSTABLE }).value!,
];

/**
 * a bunch of last items are unstable, one of which has notified tag
 */
export const notifiedRecentlyUnstableHistory: ParamHistory = [
  it.next({ status: HealthStatusLevel.UNSTABLE }).value!,
  it.next({ status: HealthStatusLevel.UNSTABLE }).value!,
  it.next({ status: HealthStatusLevel.UNSTABLE, tag: true }).value!,
  it.next({ status: HealthStatusLevel.UNSTABLE }).value!,
];

/**
 * a bunch of last items are unknown
 */
export const recentlyUnknownHistory: ParamHistory = [
  it.next({ status: 'unknown' }).value!,
  it.next({ status: 'unknown' }).value!,
];

/**
 * a bunch of last items are unknown, one of which has notified tag
 */
export const notifiedRecentlyUnknownHistory: ParamHistory = [
  it.next({ status: 'unknown' }).value!,
  it.next({ status: 'unknown' }).value!,
  it.next({ status: 'unknown', tag: true }).value!,
  it.next({ status: 'unknown' }).value!,
];

/**
 * a bunch of broken items, first one being tagged
 */
export const taggedBrokenHistory: ParamHistory = [
  it.next({ status: HealthStatusLevel.BROKEN, tag: true }).value!,
  it.next({ status: HealthStatusLevel.BROKEN }).value!,
  it.next({ status: HealthStatusLevel.BROKEN }).value!,
  it.next({ status: HealthStatusLevel.BROKEN }).value!,
  it.next({ status: HealthStatusLevel.BROKEN }).value!,
];

/**
 * append a history item with status `status` to a history
 * @param status
 * @param history
 */
export const withLast: (
  status: ErrorProneHealthStatusLevel,
  history: ParamHistory,
) => ParamHistory = (
  status,
  history = [
    it.next({ status: HealthStatusLevel.HEALTHY }).value!,
    it.next({ status: HealthStatusLevel.UNSTABLE }).value!,
    it.next({ status: HealthStatusLevel.BROKEN }).value!,
  ],
) => [...history, it.next({ status: status }).value!];

/**
 * combine two histories, maintaining order
 * @param histories
 */
export const combineHistories = (...histories: ParamHistory[]) =>
  histories.flat();
