import { describe, expect, it } from 'vitest';
import IsBroken from '../../../lib/notification/checks/isBroken';
import {
  brokenHistory,
  recentlyBrokenHistory,
  stabilizedHistory,
  withLast,
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
      expect(IsBroken.check(brokenHistory)).toEqual(true);
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
      expect(IsBroken.check(stabilizedHistory)).toEqual(false);
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
      expect(IsBroken.check(recentlyBrokenHistory)).toEqual(false);
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
      expect(IsBroken.check([])).toEqual(false);
    });

    /**
     * @target `check` should ignore unknown statuses
     * @dependencies
     * @scenario
     * - call `check` with a broken history items followed by an unknown one
     * @expected
     * - return value should be true
     */
    it('should ignore unknown statuses', () => {
      expect(IsBroken.check(withLast('unknown', brokenHistory))).toEqual(true);
    });
  });
});
