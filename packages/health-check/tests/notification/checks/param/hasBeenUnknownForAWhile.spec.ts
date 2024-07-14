import { describe, expect, it } from 'vitest';

import createHasBeenUnknownForAWhile from '../../../../lib/notification/checks/param/hasBeenUnknownForAWhile';

import {
  brokenHistory,
  historyItemsInterval,
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
      const HasBeenUnknownForAWhile =
        createHasBeenUnknownForAWhile(smallWindowDuration);
      expect(HasBeenUnknownForAWhile.check(brokenHistory)).toEqual(false);
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
      expect(HasBeenUnknownForAWhile.check(recentlyUnknownHistory)).toEqual(
        false,
      );
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
      expect(HasBeenUnknownForAWhile.check(recentlyUnknownHistory)).toEqual(
        true,
      );
    });
  });
});
