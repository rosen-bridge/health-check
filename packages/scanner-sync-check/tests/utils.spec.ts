import { describe, expect, it } from 'vitest';
import { ConvertTime } from '../lib/utils';

describe('ConvertTime', () => {
  /**
   * @target should return time in seconds when it's less than a minute
   * @scenario
   * - Call `ConvertTime` with a value less than 60 seconds
   * @expected
   * - It should return the correct pluralized second format
   */
  it('should return time in seconds when it is less than a minute', () => {
    expect(ConvertTime(43)).toEqual('43 seconds');
    expect(ConvertTime(1)).toEqual('1 second');
  });

  /**
   * @target should return time in minutes when it's at least a minute
   * @scenario
   * - Call `ConvertTime` with values greater than or equal to 60
   * @expected
   * - It should return the correct pluralized minute format
   */
  it('should return time in minutes when it is at least a minute', () => {
    expect(ConvertTime(60)).toEqual('1 minute');
    expect(ConvertTime(120)).toEqual('2 minutes');
    expect(ConvertTime(3599)).toEqual('59 minutes');
  });

  /**
   * @target should return time in hours and minutes when applicable
   * @scenario
   * - Call `ConvertTime` with values greater than or equal to 3600 (1 hour)
   * @expected
   * - It should correctly format hours and minutes
   */
  it('should return time in hours and minutes when applicable', () => {
    expect(ConvertTime(3600)).toEqual('1 hour');
    expect(ConvertTime(3660)).toEqual('1 hour and 1 minute');
    expect(ConvertTime(7320)).toEqual('2 hours and 2 minutes');
    expect(ConvertTime(7200)).toEqual('2 hours');
  });

  /**
   * @target should handle large time values correctly
   * @scenario
   * - Call `ConvertTime` with large values
   * @expected
   * - It should correctly return multiple hours and minutes
   */
  it('should handle large time values correctly', () => {
    expect(ConvertTime(10800)).toEqual('3 hours');
    expect(ConvertTime(10980)).toEqual('3 hours and 3 minutes');
    expect(ConvertTime(86400)).toEqual('24 hours');
  });
});
