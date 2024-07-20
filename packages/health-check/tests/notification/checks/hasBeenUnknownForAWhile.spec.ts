import { describe, expect, it } from 'vitest';

import createHasBeenUnknownForAWhile from '../../../lib/notification/checks/hasBeenUnknownForAWhile';

import {
  brokenHistory,
  historyItemsInterval,
  notifiedRecentlyUnknownHistory,
  recentlyUnknownHistory,
  withDummyParam,
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
      const HasBeenUnknownForAWhile =
        createHasBeenUnknownForAWhile(smallWindowDuration);
      expect(
        HasBeenUnknownForAWhile.check.call(withDummyParam(brokenHistory)),
      ).toEqual(false);
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
      const HasBeenUnknownForAWhile =
        createHasBeenUnknownForAWhile(largeWindowDuration);
      expect(
        HasBeenUnknownForAWhile.check.call(
          withDummyParam(recentlyUnknownHistory),
        ),
      ).toEqual(false);
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
      const HasBeenUnknownForAWhile =
        createHasBeenUnknownForAWhile(smallWindowDuration);
      expect(
        HasBeenUnknownForAWhile.check.call(
          withDummyParam(recentlyUnknownHistory),
        ),
      ).toEqual(true);
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
      const HasBeenUnknownForAWhile =
        createHasBeenUnknownForAWhile(smallWindowDuration);
      expect(
        HasBeenUnknownForAWhile.check.call(
          withDummyParam(notifiedRecentlyUnknownHistory),
        ),
      ).toEqual(false);
    });
  });
});
