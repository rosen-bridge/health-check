import cardanoKoiosClientFactory from '@rosen-clients/cardano-koios';

import { CARDANO_NATIVE_ASSET } from '../constants';
import { AbstractAssetHealthCheckParam } from '../abstract';

export class CardanoKoiosAssetHealthCheckParam extends AbstractAssetHealthCheckParam {
  private koiosApi;

  constructor(
    assetId: string,
    assetName: string,
    address: string,
    warnThreshold: bigint,
    criticalThreshold: bigint,
    koiosUrl: string,
    assetDecimal = 0,
    authToken?: string,
  ) {
    super(
      assetId,
      assetName,
      address,
      warnThreshold,
      criticalThreshold,
      assetDecimal,
    );
    this.koiosApi = cardanoKoiosClientFactory(koiosUrl, authToken);
  }

  /**
   * update health status for this param
   */
  updateStatus = async () => {
    let tokenAmount = 0n;
    if (this.assetId == CARDANO_NATIVE_ASSET) {
      const infos = await this.koiosApi.postAddressInfo({
        _addresses: [this.address],
      });
      if (infos[0].balance) tokenAmount = BigInt(infos[0].balance);
    } else {
      const assets = await this.koiosApi.postAddressAssets({
        _addresses: [this.address],
      });
      const token = assets.find(
        (token) => `${token.policy_id}.${token.asset_name}` == this.assetId,
      );
      if (token && token.quantity) tokenAmount = BigInt(token.quantity);
    }
    this.tokenAmount = tokenAmount;
  };
}
