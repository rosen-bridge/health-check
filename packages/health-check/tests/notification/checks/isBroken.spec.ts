import { describe, expect, it } from 'vitest';
import IsBroken from '../../../lib/notification/checks/isBroken';
import {
  brokenHistory,
  recentlyBrokenHistory,
  stabilizedHistory,
  recentlyBrokenHistoryWithUnknownBeforeTail,
  notifiedBrokenHistoryWithUnknownTail,
  withDummyParam,
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
      expect(IsBroken.check.call(withDummyParam(brokenHistory))).toEqual(true);
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
      expect(IsBroken.check.call(withDummyParam(stabilizedHistory))).toEqual(
        false,
      );
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
      expect(
        IsBroken.check.call(withDummyParam(recentlyBrokenHistory)),
      ).toEqual(false);
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
      expect(IsBroken.check.call(withDummyParam([]))).toEqual(false);
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
        IsBroken.check.call(
          withDummyParam(recentlyBrokenHistoryWithUnknownBeforeTail),
        ),
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
        IsBroken.check.call(
          withDummyParam(notifiedBrokenHistoryWithUnknownTail),
        ),
      ).toEqual(false);
    });
  });
});
