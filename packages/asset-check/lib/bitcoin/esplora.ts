import axios, { AxiosInstance } from 'axios';
import { BITCOIN_NATIVE_ASSET } from '../constants';
import { AbstractAssetHealthCheckParam } from '../abstract';
import { EsploraAddress } from './types';

export class BitcoinEsploraAssetHealthCheckParam extends AbstractAssetHealthCheckParam {
  protected client: AxiosInstance;

  constructor(
    assetName: string,
    address: string,
    warnThreshold: bigint,
    criticalThreshold: bigint,
    esploraUrl: string,
    assetDecimal = 0,
  ) {
    super(
      BITCOIN_NATIVE_ASSET,
      assetName,
      address,
      warnThreshold,
      criticalThreshold,
      assetDecimal,
    );
    this.client = axios.create({
      baseURL: esploraUrl,
    });
  }

  /**
   * Updates the asset health status and the update timestamp
   */
  update = async () => {
    const addressStats = (
      await this.client.get<EsploraAddress>(`/api/address/${this.address}`)
    ).data.chain_stats;
    this.tokenAmount = BigInt(
      addressStats.funded_txo_sum - addressStats.spent_txo_sum,
    );
    this.updateTimeStamp = new Date();
  };
}
