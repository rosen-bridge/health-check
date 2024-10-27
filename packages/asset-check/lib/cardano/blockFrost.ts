import { BlockFrostAPI } from '@blockfrost/blockfrost-js';

import { CARDANO_NATIVE_ASSET, MAINNET } from '../constants';
import { AbstractAssetHealthCheckParam } from '../abstract';

export class CardanoBlockFrostAssetHealthCheckParam extends AbstractAssetHealthCheckParam {
  private blockFrost;

  constructor(
    assetId: string,
    assetName: string,
    address: string,
    warnThreshold: bigint,
    criticalThreshold: bigint,
    projectId: string,
    assetDecimal = 0,
    blockFrostUrl?: string,
  ) {
    super(
      assetId,
      assetName === CARDANO_NATIVE_ASSET ? assetName.toUpperCase() : assetName,
      address,
      warnThreshold,
      criticalThreshold,
      assetDecimal,
    );
    this.blockFrost = new BlockFrostAPI({
      projectId: projectId,
      customBackend: blockFrostUrl,
      network: MAINNET,
    });
  }

  /**
   * update health status for this param
   */
  updateStatus = async () => {
    let tokenAmount = 0n;
    const assets = await this.blockFrost.addresses(this.address);
    if (this.assetId == CARDANO_NATIVE_ASSET) {
      const nativeToken = assets.amount.find(
        (asset) => asset.unit === 'lovelace',
      );
      if (nativeToken) tokenAmount = BigInt(nativeToken.quantity);
    } else {
      const unit = this.assetId.split('.').join('');
      const token = assets.amount.find((asset) => asset.unit === unit);
      if (token) tokenAmount = BigInt(token.quantity);
    }
    this.tokenAmount = tokenAmount;
  };
}
