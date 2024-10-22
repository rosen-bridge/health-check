import { describe, expect, it } from 'vitest';
import isBroken from '../../../lib/notification/checks/isBroken';
import {
  brokenHistory,
  recentlyBrokenHistory,
  stabilizedHistory,
  notifiedBrokenHistoryWithUnknownTail,
  dummyParam,
  recentlyBrokenHistoryWithUnknownBeforeTail,
  recentlyBrokenHistoryWithNoneNotified,
} from './historyTestData';

describe('IsBroken', () => {
  describe('check', () => {
    /**
     * @target `check` should return true if the last history item has broken
     * status
     * @dependencies
     * @scenario
     * - call `check` with a history whose last item has a broken status
     * @expected
     * - return value should be true
     */
    it('should return true if the last history item has broken status', () => {
      expect(isBroken(dummyParam, brokenHistory).check()).toEqual(true);
    });

    /**
     * @target `check` should return false if the last history item doesn't have
     * broken status
     * @dependencies
     * @scenario
     * - call `check` with a history whose last item doesn't have broken status
     * @expected
     * - return value should be false
     */
    it("should return false if the last history item doesn't have broken status", () => {
      expect(isBroken(dummyParam, stabilizedHistory).check()).toEqual(false);
    });

    /**
     * @target `check` should return false if the param has recently been broken
     * @dependencies
     * @scenario
     * - call `check` with a history whose last two items have a broken status
     * @expected
     * - return value should be false
     */
    it('should return false if the param has recently been broken', () => {
      expect(isBroken(dummyParam, recentlyBrokenHistory).check()).toEqual(
        false,
      );
    });

    /**
     * @target `check` should return true if the param has recently been broken
     * but none is notified
     * @dependencies
     * @scenario
     * - call `check` with a history whose last two items have a broken status
     *  none of which being notified
     * @expected
     * - return value should be true
     */
    it('should return true if the param has recently been broken but none is notified', () => {
      expect(
        isBroken(dummyParam, recentlyBrokenHistoryWithNoneNotified).check(),
      ).toEqual(true);
    });

    /**
     * @target `check` should return false if history is empty
     * @dependencies
     * @scenario
     * - call `check` with an empty history
     * @expected
     * - return value should be false
     */
    it('should return false if history is empty', () => {
      expect(isBroken(dummyParam, []).check()).toEqual(false);
    });

    /**
     * @target `check` should ignore unknown statuses
     * @dependencies
     * @scenario
     * - call `check` with a broken history that is notified, followed by an
     * unknown item and another broken one:
     * broken+notified -> unknown -> broken
     * @expected
     * - return value should be false
     */
    it('should ignore unknown statuses', () => {
      expect(
        isBroken(
          dummyParam,
          recentlyBrokenHistoryWithUnknownBeforeTail,
        ).check(),
      ).toEqual(false);
    });

    /**
     * @target `check` should return false if history has a tail of notified
     * broken item followed by an unknown
     * @dependencies
     * @scenario
     * - call `check` with a broken history that is notified, followed by an
     * unknown item
     * broken+notified -> unknown
     * @expected
     * - return value should be false
     */
    it('should return false if history has a tail of notified broken item followed by an unknown', () => {
      expect(
        isBroken(dummyParam, notifiedBrokenHistoryWithUnknownTail).check(),
      ).toEqual(false);
    });
  });
});
