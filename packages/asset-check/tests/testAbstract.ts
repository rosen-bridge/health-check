import { AbstractAssetHealthCheckParam } from '../lib/abstract';

class TestAssetHealthCheckParam extends AbstractAssetHealthCheckParam {
  /**
   * mocked update method
   */
  updateStatus: () => undefined;

  /**
   * set mocked amount
   * @param amount mocked amount
   */
  setTokenAmount = (amount: bigint) => {
    this.tokenAmount = amount;
  };

  /**
   * set mocked decimal
   * @param amount mocked decimal
   */
  setTokenDecimal = (decimal: number) => {
    this.assetDecimal = decimal;
  };
}

export { TestAssetHealthCheckParam };
