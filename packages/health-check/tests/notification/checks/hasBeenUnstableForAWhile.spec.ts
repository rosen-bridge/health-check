import { describe, expect, it } from 'vitest';

import createHasBeenUnstableForAWhile from '../../../lib/notification/checks/hasBeenUnstableForAWhile';

import {
  brokenHistory,
  combineHistories,
  recentlyUnstableHistory,
  withLast,
  historyItemsInterval,
  notifiedRecentlyUnstableHistory,
  dummyParam,
} from './historyTestData';

const smallWindowDuration = historyItemsInterval / 10;
const largeWindowDuration = historyItemsInterval * 10;

describe('createHasBeenUnstableForAWhile', () => {
  describe('check', () => {
    /**
     * @target `check` should return false if the very recent item is not
     * unstable but is known
     * @dependencies
     * @scenario
     * - create the check object
     * - call `check` with a history whose last item is broken
     * @expected
     * - return value should be false
     */
    it('should return false if the very recent item is not unstable but is known', () => {
      const hasBeenUnstableForAWhile = createHasBeenUnstableForAWhile(
        smallWindowDuration,
      )(dummyParam, brokenHistory);
      expect(hasBeenUnstableForAWhile.check()).toEqual(false);
    });

    /**
     * @target `check` should ignore the very recent unknown item
     * @dependencies
     * @scenario
     * - create the check object
     * - call `check` with a history with all items being unstable, except the
     * last unknown one
     * @expected
     * - return value should be true
     */
    it('should ignore the very recent unknown item', () => {
      const hasBeenUnstableForAWhile = createHasBeenUnstableForAWhile(
        smallWindowDuration,
      )(dummyParam, withLast('unknown', recentlyUnstableHistory));
      expect(hasBeenUnstableForAWhile.check()).toEqual(true);
    });

    /**
     * @target `check` should return false if the status was broken before
     * becoming unstable
     * @dependencies
     * @scenario
     * - create the check object
     * - call `check` with a history consisting of some broken items followed by
     * some unstable items
     * @expected
     * - return value should be false
     */
    it('should return false if the status was broken before becoming unstable', () => {
      const hasBeenUnstableForAWhile = createHasBeenUnstableForAWhile(
        smallWindowDuration,
      )(dummyParam, combineHistories(brokenHistory, recentlyUnstableHistory));
      expect(hasBeenUnstableForAWhile.check()).toEqual(false);
    });

    /**
     * @target `check` should return false if unstable window is not long enough
     * @dependencies
     * @scenario
     * - create the check object with a large window duration
     * - call `check` with an unstable history which is shorter than the window
     * duration
     * @expected
     * - return value should be false
     */
    it('should return false if unstable window is not long enough', () => {
      const hasBeenUnstableForAWhile = createHasBeenUnstableForAWhile(
        largeWindowDuration,
      )(dummyParam, recentlyUnstableHistory);
      expect(hasBeenUnstableForAWhile.check()).toEqual(false);
    });

    /**
     * @target `check` should return true if unstable window is long enough
     * @dependencies
     * @scenario
     * - create the check object with a small window duration
     * - call `check` with an unstable history which is longer than the window
     * duration
     * @expected
     * - return value should be true
     */
    it('should return true if unstable window is long enough', () => {
      const hasBeenUnstableForAWhile = createHasBeenUnstableForAWhile(
        smallWindowDuration,
      )(dummyParam, recentlyUnstableHistory);
      expect(hasBeenUnstableForAWhile.check()).toEqual(true);
    });

    /**
     * @target `check` should return true if unstable window is long enough
     * @dependencies
     * @scenario
     * - create the check object with a small window duration
     * - call `check` with an unstable history which is longer than the window
     * duration
     * @expected
     * - return value should be true
     */
    it('should not return true if an event history in the window is already notified', () => {
      const hasBeenUnstableForAWhile = createHasBeenUnstableForAWhile(
        smallWindowDuration,
      )(dummyParam, notifiedRecentlyUnstableHistory);
      expect(hasBeenUnstableForAWhile.check()).toEqual(false);
    });
  });
});
