import { HealthStatusLevel } from '../interfaces';

export interface ParamHistoryItem {
  timestamp: EpochTimeStamp;
  result: HealthStatusLevel | 'unknown'; // unknown means a status check failure
  tag?: string;
}
export type ParamId = string;

export type History = Record<ParamId, ParamHistoryItem[]>;

export type HealthHistoryUpdateHandler = (
  param: ParamId,
  paramHistory: ParamHistoryItem[],
) => Promise<void>;
