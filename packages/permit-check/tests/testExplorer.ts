import { ExplorerPermitHealthCheckParam } from '../lib';

class TestExplorerPermitHealthCheck extends ExplorerPermitHealthCheckParam {
  /**
   * @returns protected token amount
   */
  getReportCount = () => {
    return this.reportsCount;
  };
}

export { TestExplorerPermitHealthCheck };
