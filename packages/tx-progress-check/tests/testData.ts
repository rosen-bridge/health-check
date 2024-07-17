import { TxInfo } from '../lib';

export const healthyTxs: Array<TxInfo> = [
  { txId: 'tx1', txType: 'payment', signFailedCount: 0 },
  { txId: 'tx2', txType: 'reward', signFailedCount: 1 },
  { txId: 'tx3', txType: 'payment', signFailedCount: 2 },
];

export const signFailedTxs: Array<TxInfo> = [
  { txId: 'tx4', txType: 'payment', signFailedCount: 5 },
  { txId: 'tx5', txType: 'reward', signFailedCount: 5 },
  { txId: 'tx6', txType: 'payment', signFailedCount: 6 },
  { txId: 'tx7', txType: 'reward', signFailedCount: 10 },
  { txId: 'tx8', txType: 'payment', signFailedCount: 10 },
  { txId: 'tx9', txType: 'manual', signFailedCount: 60 },
  { txId: 'tx10', txType: 'payment', signFailedCount: 61 },
];
