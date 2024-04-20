import { NodeWidHealthCheckParam } from '../lib';

class TestNodeWidHealthCheck extends NodeWidHealthCheckParam {
  /**
   * @returns protected token amount
   */
  getWidStatus = () => {
    return this.widExists;
  };
}

export { TestNodeWidHealthCheck };
