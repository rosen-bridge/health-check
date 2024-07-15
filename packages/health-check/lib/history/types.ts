import { HealthStatusLevel } from '../interfaces';

/**
 * an enhanced `HealthStatusLevel` that can also be 'unknown' when status update
 * fails
 */
export type ErrorProneHealthStatusLevel = HealthStatusLevel | 'unknown';
export interface ParamHistoryItem {
  timestamp: EpochTimeStamp;
  result: ErrorProneHealthStatusLevel;
  tag?: string;
}
export type ParamHistory = ParamHistoryItem[];
export type ParamId = string;

export type History = Record<ParamId, ParamHistoryItem[]>;

export type HealthHistoryUpdateHandler = (
  param: ParamId,
  paramHistory: ParamHistoryItem[],
) => Promise<void>;
