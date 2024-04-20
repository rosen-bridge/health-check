import { NodePermitHealthCheckParam } from '../lib';

class TestNodePermitHealthCheck extends NodePermitHealthCheckParam {
  /**
   * @returns protected report count
   */
  getReportCount = () => {
    return this.reportsCount;
  };
}

export { TestNodePermitHealthCheck };
