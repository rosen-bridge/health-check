import ergoNodeClientFactory from '@rosen-clients/ergo-node';

import { AbstractAssetHealthCheckParam } from '../abstract';
import { ERGO_NATIVE_ASSET } from '../constants';

export class ErgoNodeAssetHealthCheckParam extends AbstractAssetHealthCheckParam {
  private nodeApi;

  constructor(
    assetId: string,
    assetName: string,
    address: string,
    warnThreshold: bigint,
    criticalThreshold: bigint,
    nodeUrl: string,
    assetDecimal = 0,
  ) {
    super(
      assetId,
      assetName,
      address,
      warnThreshold,
      criticalThreshold,
      assetDecimal,
    );
    this.nodeApi = ergoNodeClientFactory(nodeUrl);
  }

  /**
   * update health status for this param
   */
  updateStatus = async () => {
    let tokenAmount = 0n;
    const assets = await this.nodeApi.getAddressBalanceTotal(this.address);
    if (this.assetId == ERGO_NATIVE_ASSET) {
      if (assets.confirmed) tokenAmount = assets.confirmed.nanoErgs;
    } else {
      const token = assets?.confirmed?.tokens.find(
        (token) => token.tokenId == this.assetId,
      );
      if (token && token.amount) tokenAmount = token.amount;
    }
    this.tokenAmount = tokenAmount;
  };
}
