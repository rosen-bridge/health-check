import { ethers, FetchRequest, JsonRpcProvider } from 'ethers';

import { AbstractAssetHealthCheckParam } from '../abstract';
import { PartialERC20ABI } from './types';

export class EvmRpcAssetHealthCheckParam extends AbstractAssetHealthCheckParam {
  protected readonly provider: JsonRpcProvider;
  protected nativeTokenId: string;

  constructor(
    chain: string,
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
      chain,
      assetId,
      assetName === nativeTokenId ? assetName.toUpperCase() : assetName,
      address,
      warnThreshold,
      criticalThreshold,
      assetDecimal,
    );
    this.nativeTokenId = nativeTokenId;
    // Build the connection request first and hand it to the provider:
    // in ethers v6 `_getConnection()` returns a fresh clone of the
    // provider's request on every call, so assigning `timeout` to its
    // result is discarded and the timeout never takes effect. Setting
    // it on the request the provider is constructed with persists,
    // because every clone copies it. The timeout is in milliseconds,
    // as ethers expects.
    const connection = new FetchRequest(
      authToken ? `${url}/${authToken}` : `${url}`,
    );
    if (timeout) {
      connection.timeout = timeout;
    }
    this.provider = new JsonRpcProvider(connection);
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
