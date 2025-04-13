import { DogeBlockCypherAssetHealthCheckParam } from '../../lib/doge/blockcypher';

export class TestDogeBlockCypherAssetHealthCheck extends DogeBlockCypherAssetHealthCheckParam {
  /**
   * @returns protected token amount
   */
  getTokenAmount = () => {
    return this.tokenAmount;
  };

  /**
   * @returns the axios client
   */
  getClient = () => this.client;
}
