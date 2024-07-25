import { describe, expect, it } from 'vitest';

import isStabilized from '../../../lib/notification/checks/isStabilized';

import {
  alreadyStabilizedHistory,
  brokenHistory,
  notNotifiedStabilizedHistory,
  stabilizedHistory,
  unknownStabilizedHistory,
  alreadyStabilizedHistoryWithUnknownItems,
  dummyParam,
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
      expect(isStabilized(dummyParam, stabilizedHistory).check()).toEqual(true);
    });

    /**
     * @target `check` should return true if param stabilized after an unknown
     * notification
     * @dependencies
     * @scenario
     * - call `check` with a history which is notified for becoming healthy,
     * then followed by some unknown items which one is tagged, and then another
     * healthy item
     * healthy+tagged -> unknown -> unknown+tagged -> healthy
     * @expected
     * - return value should be true
     */
    it('should return true if param stabilized after an unknown notification', () => {
      expect(
        isStabilized(dummyParam, unknownStabilizedHistory).check(),
      ).toEqual(true);
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
      expect(
        isStabilized(dummyParam, notNotifiedStabilizedHistory).check(),
      ).toEqual(false);
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
      expect(
        isStabilized(dummyParam, alreadyStabilizedHistory).check(),
      ).toEqual(false);
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
      expect(isStabilized(dummyParam, brokenHistory).check()).toEqual(false);
    });

    /**
     * @target `check` should ignore unknown history items if the last notified
     * item is not unknown
     * @dependencies
     * @scenario
     * - call `check` with an already stabilized history, including an unknown
     * item
     * @expected
     * - return value should be false
     */
    it('should ignore unknown history items if the last notified item is not unknown', () => {
      expect(
        isStabilized(
          dummyParam,
          alreadyStabilizedHistoryWithUnknownItems,
        ).check(),
      ).toEqual(false);
    });
  });
});
