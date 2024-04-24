export interface EsploraAddress {
  address: string;
  chain_stats: Stats;
  mempool_stats: Stats;
}

export interface Stats {
  funded_txo_count: number;
  funded_txo_sum: number;
  spent_txo_count: number;
  spent_txo_sum: number;
  tx_count: number;
}
