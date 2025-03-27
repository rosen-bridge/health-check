import { EsploraAssetHealthCheckParam } from '../../lib/bitcoin/esplora';

export class TestBitcoinEsploraAssetHealthCheck extends EsploraAssetHealthCheckParam {
  /**
   * @returns protected token amount
   */
  getTokenAmount = () => {
    return this.tokenAmount;
  };

  /**
   * @returns the apollo client
   */
  getClient = () => this.client;
}
