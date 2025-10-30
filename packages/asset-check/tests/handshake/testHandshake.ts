import { HandshakeRpcAssetHealthCheckParam } from '../../lib/handshake/rpc';

export class TestHandshakeRpcAssetHealthCheck extends HandshakeRpcAssetHealthCheckParam {
  getTokenAmount = () => {
    return this.tokenAmount;
  };

  getClient = () => {
    return this.client;
  };
}
