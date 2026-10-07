import { EvmRpcAssetHealthCheckParam } from '../../lib/evm/rpc';

export class TestEvmRpcAssetHealthCheck extends EvmRpcAssetHealthCheckParam {
  /**
   * @returns the underlying provider
   */
  getProvider = () => this.provider;
}
