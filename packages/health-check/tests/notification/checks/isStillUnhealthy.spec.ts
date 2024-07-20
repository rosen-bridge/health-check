import { describe, expect, it } from 'vitest';

import createIsStillUnhealthy from '../../../lib/notification/checks/isStillUnhealthy';

import {
  historyItemsInterval,
  alreadyStabilizedHistory,
  notNotifiedStabilizedHistory,
  taggedBrokenHistory,
  withDummyParam,
} from './historyTestData';

const smallWindowDuration = historyItemsInterval / 10;
const largeWindowDuration = historyItemsInterval * 10;

describe('createIsStillUnhealthy', () => {
  describe('check', () => {
    /**
     * @target `check` should return false if history is empty
     * @dependencies
     * @scenario
     * - create the check object
     * - call `check` with an empty history
     * @expected
     * - return value should be false
     */
    it('should return false if history is empty', () => {
      const IsStillUnhealthy = createIsStillUnhealthy(smallWindowDuration);
      expect(IsStillUnhealthy.check.call(withDummyParam([]))).toEqual(false);
    });

    /**
     * @target `check` should return false if no history item has a tag
     * @dependencies
     * @scenario
     * - create the check object
     * - call `check` with a history whose items are not tagged
     * @expected
     * - return value should be false
     */
    it('should return false if no history item has a tag', () => {
      const IsStillUnhealthy = createIsStillUnhealthy(smallWindowDuration);
      expect(
        IsStillUnhealthy.check.call(withDummyParam(alreadyStabilizedHistory)),
      ).toEqual(false);
    });

    /**
     * @target `check` should return false if last tagged history item has
     * healthy result
     * @dependencies
     * @scenario
     * - create the check object
     * - call `check` with a history whose last tagged item has healthy status
     * @expected
     * - return value should be false
     */
    it('should return false if last tagged history item has healthy result', () => {
      const IsStillUnhealthy = createIsStillUnhealthy(smallWindowDuration);
      expect(
        IsStillUnhealthy.check.call(
          withDummyParam(notNotifiedStabilizedHistory),
        ),
      ).toEqual(false);
    });

    /**
     * @target `check` should return false if passed time since last tagged item
     * is not large enough
     * @dependencies
     * @scenario
     * - create the check object with a large window duration
     * - call `check` with a history whose last tagged item difference to
     * current time is not large enough
     * duration
     * @expected
     * - return value should be false
     */
    it('should return false if passed time since last tagged item is not large enough', () => {
      const IsStillUnhealthy = createIsStillUnhealthy(largeWindowDuration);
      expect(
        IsStillUnhealthy.check.call(withDummyParam(taggedBrokenHistory)),
      ).toEqual(false);
    });

    /**
     * @target `check` should return false if passed time since last tagged item
     * is large enough
     * @dependencies
     * @scenario
     * - create the check object with a small window duration
     * - call `check` with a history whose last tagged item difference to
     * current time is large enough
     * @expected
     * - return value should be true
     */
    it('should return false if passed time since last tagged item is large enough', () => {
      const IsStillUnhealthy = createIsStillUnhealthy(smallWindowDuration);
      expect(
        IsStillUnhealthy.check.call(withDummyParam(taggedBrokenHistory)),
      ).toEqual(true);
    });
  });
});
