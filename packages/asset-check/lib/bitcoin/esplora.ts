import axios, { AxiosInstance } from 'axios';
import { BITCOIN_NATIVE_ASSET, DOGE_NATIVE_ASSET } from '../constants';
import { AbstractAssetHealthCheckParam } from '../abstract';
import { EsploraAddress } from './types';

const ESPLORA_ASSET_MAP: Record<string, string> = {
  [DOGE_NATIVE_ASSET]: DOGE_NATIVE_ASSET,
  [BITCOIN_NATIVE_ASSET]: BITCOIN_NATIVE_ASSET,
};

export class EsploraAssetHealthCheckParam extends AbstractAssetHealthCheckParam {
  protected client: AxiosInstance;

  constructor(
    assetName: string,
    address: string,
    warnThreshold: bigint,
    criticalThreshold: bigint,
    esploraUrl: string,
    assetDecimal = 0,
  ) {
    const asset = ESPLORA_ASSET_MAP[assetName] || BITCOIN_NATIVE_ASSET;
    super(
      asset,
      assetName.toUpperCase(),
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
   * update health status for this param
   */
  updateStatus = async () => {
    const addressStats = (
      await this.client.get<EsploraAddress>(`/api/address/${this.address}`)
    ).data.chain_stats;
    this.tokenAmount = BigInt(
      addressStats.funded_txo_sum - addressStats.spent_txo_sum,
    );
  };
}
