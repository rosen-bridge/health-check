export interface HandshakeCoinCovenant {
  type: number;
  action: string;
  items: unknown[];
}

export interface HandshakeCoin {
  version: number;
  height: number;
  value: number;
  address: string;
  covenant: HandshakeCoinCovenant;
  coinbase: boolean;
  hash: string;
  index: number;
}

export type HandshakeCoinsResponse = HandshakeCoin[];
