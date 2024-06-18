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

  getDescription = (): Promise<string> => {
    return Promise.resolve('description');
  };

  getHealthStatus = (): Promise<HealthStatusLevel> => {
    return Promise.resolve(this.status);
  };

  getId = (): string => {
    return this.id;
  };

  getTitle = (): Promise<string> => {
    return Promise.resolve(this.id);
  };

  updateStatus = (): unknown => {
    this.callsCount += 1;
    return undefined;
  };

  getDetails = () => {
    return Promise.resolve('');
  };
}
