import { ethers, JsonRpcProvider } from 'ethers';

import { AbstractAssetHealthCheckParam } from '../abstract';
import { PartialERC20ABI } from './types';

export class EvmRpcAssetHealthCheckParam extends AbstractAssetHealthCheckParam {
  protected readonly provider: JsonRpcProvider;
  protected nativeTokenId: string;

  constructor(
    nativeTokenId: string,
    assetId: string,
    assetName: string,
    address: string,
    warnThreshold: bigint,
    criticalThreshold: bigint,
    url: string,
    timeout?: number,
    authToken?: string,
    assetDecimal = 0,
  ) {
    super(
      assetId,
      assetName === nativeTokenId ? assetName.toUpperCase() : assetName,
      address,
      warnThreshold,
      criticalThreshold,
      assetDecimal,
    );
    this.nativeTokenId = nativeTokenId;
    this.provider = authToken
      ? new JsonRpcProvider(`${url}/${authToken}`)
      : new JsonRpcProvider(`${url}`);
    if (timeout) {
      this.provider._getConnection().timeout = timeout;
    }
  }

  /**
   * update health status for this param
   */
  updateStatus = async () => {
    if (this.assetId == this.nativeTokenId) {
      this.tokenAmount = await this.provider.getBalance(this.address);
    } else {
      const contract = new ethers.Contract(
        this.assetId,
        PartialERC20ABI,
        this.provider,
      );
      this.tokenAmount = await contract.balanceOf(this.address);
    }
  };
}
