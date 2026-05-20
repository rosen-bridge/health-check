import { FiroElectrumXAssetHealthCheckParam } from '../../lib/firo/electrumx';

export class TestFiroElectrumXAssetHealthCheck extends FiroElectrumXAssetHealthCheckParam {
  /**
   * @returns protected token amount
   */
  getTokenAmount = () => {
    return this.tokenAmount;
  };
}
