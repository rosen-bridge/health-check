import ergoExplorerClientFactory from '@rosen-clients/ergo-explorer';

import { AbstractAssetHealthCheckParam } from '../abstract';
import { ERGO_NATIVE_ASSET } from '../constants';

export class ErgoExplorerAssetHealthCheckParam extends AbstractAssetHealthCheckParam {
  private explorerApi;

  constructor(
    assetId: string,
    assetName: string,
    address: string,
    warnThreshold: bigint,
    criticalThreshold: bigint,
    explorerUrl: string,
    assetDecimal = 0,
  ) {
    super(
      assetId,
      assetName === ERGO_NATIVE_ASSET ? assetName.toUpperCase() : assetName,
      address,
      warnThreshold,
      criticalThreshold,
      assetDecimal,
    );
    this.explorerApi = ergoExplorerClientFactory(explorerUrl);
  }

  /**
   * update health status for this param
   */
  updateStatus = async () => {
    let tokenAmount = 0n;
    const assets =
      await this.explorerApi.v1.getApiV1AddressesP1BalanceConfirmed(
        this.address,
      );
    if (this.assetId == ERGO_NATIVE_ASSET) {
      if (assets) tokenAmount = assets.nanoErgs;
    } else {
      const token = assets.tokens?.find(
        (token) => token.tokenId == this.assetId,
      );
      if (token) tokenAmount = token.amount;
    }
    this.tokenAmount = tokenAmount;
  };
}
