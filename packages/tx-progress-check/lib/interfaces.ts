export interface TxInfo {
  txId: string;
  txType: string;
  signFailedCount: number;
  chain: string;
  eventId?: string;
}
