import { TxInfo } from '../lib';

export const healthyTxs: Array<TxInfo> = [
  { txId: 'tx1', txType: 'payment', signFailedCount: 0, chain: 'ergo' },
  { txId: 'tx2', txType: 'reward', signFailedCount: 1, chain: 'ergo' },
  { txId: 'tx3', txType: 'payment', signFailedCount: 2, chain: 'ergo' },
];

export const signFailedTxs: Array<TxInfo> = [
  { txId: 'tx4', txType: 'payment', signFailedCount: 5, chain: 'ergo' },
  { txId: 'tx5', txType: 'reward', signFailedCount: 5, chain: 'ergo' },
  { txId: 'tx6', txType: 'payment', signFailedCount: 6, chain: 'ergo' },
  { txId: 'tx7', txType: 'reward', signFailedCount: 10, chain: 'ergo' },
  { txId: 'tx8', txType: 'payment', signFailedCount: 10, chain: 'ergo' },
  { txId: 'tx9', txType: 'manual', signFailedCount: 60, chain: 'ergo' },
  { txId: 'tx10', txType: 'payment', signFailedCount: 61, chain: 'ergo' },
];
