import axios, { Axios } from '@rosen-clients/rate-limited-axios';

import { AbstractAssetHealthCheckParam } from '../abstract';
import { HANDSHAKE_NATIVE_ASSET } from '../constants';
import { HandshakeCoinsResponse } from './types';

export class HandshakeRpcAssetHealthCheckParam extends AbstractAssetHealthCheckParam {
  protected client: Axios;

  constructor(
    assetName: string,
    address: string,
    warnThreshold: bigint,
    criticalThreshold: bigint,
    rpcUrl: string,
    assetDecimal = 0,
  ) {
    super(
      'Handshake',
      HANDSHAKE_NATIVE_ASSET,
      assetName.toUpperCase(),
      address,
      warnThreshold,
      criticalThreshold,
      assetDecimal,
    );
    this.client = axios.create({
      baseURL: rpcUrl,
    });
  }

  /**
   * update health status for this param
   */
  updateStatus = async () => {
    const coins = (
      await this.client.get<HandshakeCoinsResponse>(
        `/coin/address/${this.address}`,
      )
    ).data;

    // Sum all coin values to get total balance
    const totalBalance = coins.reduce(
      (sum, coin) => sum + BigInt(coin.value),
      0n,
    );
    this.tokenAmount = totalBalance;
  };
}
