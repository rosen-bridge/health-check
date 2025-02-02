import { AbstractPermitHealthCheckParam } from '../lib';

class TestPermitHealthCheckParam extends AbstractPermitHealthCheckParam {
  /**
   * mocked update method
   */
  updateStatus: () => undefined;

  /**
   * set mocked report count
   * @param amount mocked report count
   */
  setReportCount = (amount: bigint) => {
    this.reportsCount = amount;
  };

  /**
   * @returns the protected critical threshold
   */
  getRwtPerCommitment = () => this.rwtPerCommitment;
}

export { TestPermitHealthCheckParam };
