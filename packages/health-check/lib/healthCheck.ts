import { AbstractHealthCheckParam } from './abstractHealthCheckParam';
import { HealthStatus, HealthStatusLevel } from './interfaces';

export class HealthCheck {
  protected params: Array<AbstractHealthCheckParam> = [];

  /**
   * register new param on healthCheck
   * @param param
   */
  register = (param: AbstractHealthCheckParam): void => {
    this.params.push(param);
  };

  /**
   * unregister param from healthCheck
   * @param paramId
   */
  unregister = (paramId: string): void => {
    this.params = this.params.filter((param) => param.getId() !== paramId);
  };

  /**
   * check all params health status
   */
  update = async (): Promise<void> => {
    await Promise.all(this.params.map((item) => item.update()));
  };

  /**
   * check health status for one param
   * @param paramId
   */
  updateParam = async (paramId: string): Promise<void> => {
    for (const param of this.params.filter(
      (item) => item.getId() === paramId,
    )) {
      await param.update();
    }
  };

  /**
   * get overall health status for system
   */
  getOverallHealthStatus = async (): Promise<string> => {
    let status = HealthStatusLevel.HEALTHY;
    (await this.getHealthStatus()).map((item) => {
      if (
        item.status === HealthStatusLevel.BROKEN ||
        (item.status === HealthStatusLevel.UNSTABLE &&
          status !== HealthStatusLevel.BROKEN)
      ) {
        status = item.status;
      }
    });
    return status;
  };

  /**
   *
   * @param param
   * @returns
   */
  getHealthStatusForParam = async (param: AbstractHealthCheckParam) => {
    return {
      id: param.getId(),
      title: await param.getTitle(),
      status: await param.getHealthStatus(),
      description: await param.getDescription(),
      lastCheck: param.getLastUpdatedTime(),
      lastTrialError: param.getLastTrialError(),
      details: await param.getDetails(),
    };
  };

  /**
   * check health status for a param with the id
   * @param paramId
   */
  getHealthStatusWithParamId = async (
    paramId: string,
  ): Promise<HealthStatus | undefined> => {
    const params = this.params.filter((param) => param.getId() === paramId);
    if (params.length > 0) {
      const param = params[0];
      return await this.getHealthStatusForParam(param);
    }
    return undefined;
  };

  /**
   * get detailed health status for system
   */
  getHealthStatus = async (): Promise<Array<HealthStatus>> => {
    const res: Array<HealthStatus> = [];
    for (const param of this.params) {
      res.push(await this.getHealthStatusForParam(param));
    }
    return res;
  };
}
