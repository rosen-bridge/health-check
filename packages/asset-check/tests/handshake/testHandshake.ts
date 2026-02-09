import { HandshakeRpcAssetHealthCheckParam } from '../../lib/handshake/rpc';

export class TestHandshakeRpcAssetHealthCheck extends HandshakeRpcAssetHealthCheckParam {
  /**
   * @returns protected token amount
   */
  getTokenAmount = () => {
    return this.tokenAmount;
  };

  /**
   * @returns the axios client
   */
  getClient = () => {
    return this.client;
  };
}
