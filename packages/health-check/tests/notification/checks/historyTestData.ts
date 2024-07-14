import { HealthStatusLevel } from '../../../lib';
import { ParamHistory, ParamHistoryItem } from '../../../lib/history/types';

/**
 * The difference between the timestamp of history items
 */
export const historyItemsInterval = 1000;

/**
 * generate history items based on the provided status and an optional tag
 */
function* createHistoryItem(): Generator<
  ParamHistoryItem,
  void,
  { status: HealthStatusLevel | 'unknown'; tag?: true }
> {
  let status = 'unknown' as HealthStatusLevel | 'unknown';
  let tag = undefined;
  let timestamp = 0;
  while (true) {
    const input: { status: HealthStatusLevel | 'unknown'; tag?: true } = yield {
      result: status,
      timestamp: timestamp,
      ...(tag && { tag: 'notified' }),
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
 * last item returned to healthy after being unhealthy and notified
 */
export const stabilizedHistory: ParamHistory = [
  it.next({ status: HealthStatusLevel.BROKEN, tag: true }).value!,
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
 * a bunch of last items are unstable
 */
export const recentlyUnstableHistory: ParamHistory = [
  it.next({ status: HealthStatusLevel.UNSTABLE }).value!,
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
 * append a history item with status `status` to a history
 * @param status
 * @param history
 */
export const withLast: (
  status: HealthStatusLevel | 'unknown',
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
