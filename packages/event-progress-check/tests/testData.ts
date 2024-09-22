import { EventInfo } from '../lib';

export const currentTimestamp = 1726995972000;
export const warnThreshold = 100;
export const criticalThreshold = 1000;

export const healthyEvents: Array<EventInfo> = [
  { id: 'event1', status: 'in-payment', firstTry: '1726995970' },
  { id: 'event2', status: 'in-payment', firstTry: '1726995965' },
];

export const stuckEvents: Array<EventInfo> = [
  { id: 'event4', status: 'in-payment', firstTry: '1726995772' },
  { id: 'event5', status: 'in-reward', firstTry: '1726995770' },
  { id: 'event6', status: 'in-payment', firstTry: '1726993972' },
  { id: 'event7', status: 'in-reward', firstTry: '1726993970' },
];
