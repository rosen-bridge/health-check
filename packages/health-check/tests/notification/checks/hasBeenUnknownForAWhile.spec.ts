import { describe, expect, it } from 'vitest';

import createHasBeenUnknownForAWhile from '../../../lib/notification/checks/hasBeenUnknownForAWhile';

import {
  brokenHistory,
  dummyParam,
  historyItemsInterval,
  notifiedRecentlyUnknownHistory,
  recentlyUnknownHistory,
} from './historyTestData';

const smallWindowDuration = historyItemsInterval / 10;
const largeWindowDuration = historyItemsInterval * 10;

describe('createHasBeenUnknownForAWhile', () => {
  describe('check', () => {
    /**
     * @target `check` should return false if the very recent item is not
     * unknown
     * @dependencies
     * @scenario
     * - create the check object
     * - call `check` with a history whose last item is broken
     * @expected
     * - return value should be false
     */
    it('should return false if the very recent item is not unknown', () => {
      const hasBeenUnknownForAWhile = createHasBeenUnknownForAWhile(
        smallWindowDuration,
      )(dummyParam, brokenHistory);
      expect(hasBeenUnknownForAWhile.check()).toEqual(false);
    });

    /**
     * @target `check` should return false if unknown window is not long enough
     * @dependencies
     * @scenario
     * - create the check object with a large window duration
     * - call `check` with an unknown history which is shorter than the window
     * duration
     * @expected
     * - return value should be false
     */
    it('should return false if unknown window is not long enough', () => {
      const hasBeenUnknownForAWhile = createHasBeenUnknownForAWhile(
        largeWindowDuration,
      )(dummyParam, recentlyUnknownHistory);
      expect(hasBeenUnknownForAWhile.check()).toEqual(false);
    });

    /**
     * @target `check` should return true if unknown window is long enough
     * @dependencies
     * @scenario
     * - create the check object with a small window duration
     * - call `check` with an unknown history which is longer than the window
     * duration
     * @expected
     * - return value should be true
     */
    it('should return true if unknown window is long enough', () => {
      const hasBeenUnknownForAWhile = createHasBeenUnknownForAWhile(
        smallWindowDuration,
      )(dummyParam, recentlyUnknownHistory);
      expect(hasBeenUnknownForAWhile.check()).toEqual(true);
    });

    /**
     * @target `check` should not return true if an event history in the window
     * is already notified
     * @dependencies
     * @scenario
     * - create the check object with a small window duration
     * - call `check` with an unknown history which is longer than the window
     * duration, but one of its items has notified tag
     * @expected
     * - return value should be true
     */
    it('should not return true if an event history in the window is already notified', () => {
      const hasBeenUnknownForAWhile = createHasBeenUnknownForAWhile(
        smallWindowDuration,
      )(dummyParam, notifiedRecentlyUnknownHistory);
      expect(hasBeenUnknownForAWhile.check()).toEqual(false);
    });
  });
});
