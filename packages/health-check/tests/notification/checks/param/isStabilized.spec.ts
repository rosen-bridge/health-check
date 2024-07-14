import { describe, expect, it } from 'vitest';

import IsStabilized from '../../../../lib/notification/checks/param/isStabilized';

import {
  alreadyStabilizedHistory,
  brokenHistory,
  notNotifiedStabilizedHistory,
  stabilizedHistory,
  withLast,
} from './historyTestData';

describe('IsStabilized', () => {
  describe('check', () => {
    /**
     * @target `check` should return true if param stabilized after an unhealthy
     * notification
     * @dependencies
     * @scenario
     * - call `check` with a history whose last item is healthy and the item
     * before it is unhealthy and notified
     * @expected
     * - return value should be true
     */
    it('should return true if param stabilized after an unhealthy notification', () => {
      expect(IsStabilized.check(stabilizedHistory)).toEqual(true);
    });

    /**
     * @target `check` should return false if param stabilized after an
     * unhealthy but not notified status
     * @dependencies
     * @scenario
     * - call `check` with a history whose last item is healthy and the item
     * before it is unhealthy but not notified
     * @expected
     * - return value should be true
     */
    it('should return false if param stabilized after an unhealthy but not notified status', () => {
      expect(IsStabilized.check(notNotifiedStabilizedHistory)).toEqual(false);
    });

    /**
     * @target `check` should return false if the notification is already sent
     * @dependencies
     * @scenario
     * - call `check` with a history whose last two items have healthy status
     * @expected
     * - return value should be false
     */
    it('should return false if the notification is already sent', () => {
      expect(IsStabilized.check(alreadyStabilizedHistory)).toEqual(false);
    });

    /**
     * @target `check` should return false if last history item has unhealthy
     * status
     * @dependencies
     * @scenario
     * - call `check` with a history whose last item has unhealthy status
     * @expected
     * - return value should be false
     */
    it('should return false if last history item has unhealthy status', () => {
      expect(IsStabilized.check(brokenHistory)).toEqual(false);
    });

    /**
     * @target `check` should return false if last history item has unhealthy
     * status
     * @dependencies
     * @scenario
     * - call `check` with a history whose last item has unhealthy status
     * @expected
     * - return value should be false
     */
    it('should return false if last history item has unhealthy status', () => {
      expect(IsStabilized.check(brokenHistory)).toEqual(false);
    });

    /**
     * @target `check` should ignore unknown history items
     * @dependencies
     * @scenario
     * - call `check` with stabilized history items followed by an unknown one
     * @expected
     * - return value should be true
     */
    it('should ignore unknown history items', () => {
      expect(
        IsStabilized.check(withLast('unknown', stabilizedHistory)),
      ).toEqual(true);
    });
  });
});
