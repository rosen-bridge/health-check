import { BitcoinEsploraAssetHealthCheckParam } from '../../lib/bitcoin/esplora';

export class TestBitcoinEsploraAssetHealthCheck extends BitcoinEsploraAssetHealthCheckParam {
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
