import axios, { AxiosInstance } from 'axios';
import { DOGE_NATIVE_ASSET } from '../constants';
import { AbstractAssetHealthCheckParam } from '../abstract';
import { BlockCypherAddress } from './types';

export class DogeBlockCypherAssetHealthCheckParam extends AbstractAssetHealthCheckParam {
  protected client: AxiosInstance;

  constructor(
    assetName: string,
    address: string,
    warnThreshold: bigint,
    criticalThreshold: bigint,
    blockCypherUrl: string,
    assetDecimal = 0,
  ) {
    super(
      'Doge',
      DOGE_NATIVE_ASSET,
      assetName.toUpperCase(),
      address,
      warnThreshold,
      criticalThreshold,
      assetDecimal,
    );
    this.client = axios.create({
      baseURL: blockCypherUrl,
    });
  }

  /**
   * update health status for this param
   */
  updateStatus = async () => {
    const addressStats = (
      await this.client.get<BlockCypherAddress>(
        `/v1/doge/main/addrs/${this.address}/balance`,
      )
    ).data;
    this.tokenAmount = BigInt(addressStats.balance);
  };
}
