import {
  ErgoExplorerAssetHealthCheckParam,
  ErgoNodeAssetHealthCheckParam,
} from '../../lib/ergo';

class TestErgoExplorerAssetHealthCheck extends ErgoExplorerAssetHealthCheckParam {
  /**
   * @returns protected token amount
   */
  getTokenAmount = () => {
    return this.tokenAmount;
  };
}

class TestErgoNodeAssetHealthCheck extends ErgoNodeAssetHealthCheckParam {
  /**
   * @returns protected token amount
   */
  getTokenAmount = () => {
    return this.tokenAmount;
  };
}

export { TestErgoNodeAssetHealthCheck, TestErgoExplorerAssetHealthCheck };
