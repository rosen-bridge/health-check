import { AbstractHealthCheckParam, HealthStatusLevel } from '../lib';

export class TestHealthCheckParam extends AbstractHealthCheckParam {
  protected id: string;
  protected status: HealthStatusLevel;
  public callsCount = 0;
  constructor(id: string, status: HealthStatusLevel, errorMessage?: string) {
    super();
    this.id = id;
    this.status = status;
    this.lastTrialErrorMessage = errorMessage;
  }

  getDescription = (): string => {
    return 'description';
  };

  getHealthStatus = (): HealthStatusLevel => {
    return this.status;
  };

  getId = (): string => {
    return this.id;
  };

  getTitle = (): string => {
    return this.id;
  };

  updateStatus = (): unknown => {
    this.callsCount += 1;
    return undefined;
  };

  getDetails = () => {
    return '';
  };
}
