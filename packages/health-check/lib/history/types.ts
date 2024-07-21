import { HealthStatusLevel } from '../interfaces';

/**
 * an enhanced {@link HealthStatusLevel} that can also be 'unknown' when status
 * update fails
 */
export type ErrorProneHealthStatusLevel = HealthStatusLevel | 'unknown';
export interface ParamHistoryItemTag {
  id: string;
  data?: unknown;
}
export interface ParamHistoryItem {
  timestamp: EpochTimeStamp;
  result: ErrorProneHealthStatusLevel;
  tag?: ParamHistoryItemTag;
}
export type ParamHistory = ParamHistoryItem[];
export type ParamId = string;

export type History = Record<ParamId, ParamHistoryItem[]>;

export type HealthHistoryUpdateHandler = (
  param: ParamId,
  paramHistory: ParamHistoryItem[],
) => Promise<void>;
