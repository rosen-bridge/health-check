import { NotifyWithSeverity } from '@rosen-bridge/abstract-notification';

import { AbstractHealthCheckParam } from './abstractHealthCheckParam';
import HealthHistory from './history/healthHistory';
import NotificationManager from './notification/notificationManager';

import createHasBeenUnknownForAWhile from './notification/checks/hasBeenUnknownForAWhile';
import createHasBeenUnstableForAWhile from './notification/checks/hasBeenUnstableForAWhile';
import isBroken from './notification/checks/isBroken';
import isStabilized from './notification/checks/isStabilized';

import { HistoryItemTag } from './constants';

import { ParamId } from './history/types';
import {
  HealthStatus,
  HealthStatusLevel,
  HealthCheckConfig,
} from './interfaces';

export class HealthCheck {
  protected params: Array<AbstractHealthCheckParam> = [];
  private healthHistory?: HealthHistory;

  constructor(
    notify?: NotifyWithSeverity,
    { historyConfig, notificationCheckConfig }: HealthCheckConfig = {},
  ) {
    if (notify) {
      const notificationManager = new NotificationManager(
        notify,
        this.getParamById,
      );
      const healthHistory = new HealthHistory({
        updateHandler: notificationManager.sendNotifications,
        ...historyConfig,
      });

      this.healthHistory = healthHistory;

      notificationManager.onNotified((param, notifyArgs) =>
        healthHistory.setTag(param, {
          id: HistoryItemTag.NOTIFIED,
          data: notifyArgs,
        }),
      );
      this.registerNotificationManagerChecks(
        notificationManager,
        notificationCheckConfig,
      );
    }
  }

  /**
   * register all notification checks to notificationManager
   * @param notificationManager
   * @param notificationCheckConfig
   */
  private registerNotificationManagerChecks = (
    notificationManager: NotificationManager,
    notificationCheckConfig: HealthCheckConfig['notificationCheckConfig'],
  ) => {
    const hasBeenUnknownForAWhile = createHasBeenUnknownForAWhile(
      notificationCheckConfig?.hasBeenUnknownForAWhile?.windowDuration,
    );
    notificationManager.registerCheck(hasBeenUnknownForAWhile);
    const hasBeenUnstableForAWhile = createHasBeenUnstableForAWhile(
      notificationCheckConfig?.hasBeenUnstableForAWhile?.windowDuration,
    );
    notificationManager.registerCheck(hasBeenUnstableForAWhile);
    notificationManager.registerCheck(isBroken);
    notificationManager.registerCheck(isStabilized);
  };

  /**
   * get a param by its id
   * @param id
   */
  private getParamById = (id: ParamId) =>
    this.params.find((param) => param.getId() === id);

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
   * update history for a param, based on if the last update call was successful
   * @param param
   */
  private updateHistoryForParam = async (param: AbstractHealthCheckParam) => {
    const paramId = param.getId();
    const lastTrialErrorTime = await param.getLastTrialErrorTime();
    if (this.healthHistory)
      if (lastTrialErrorTime) {
        await this.healthHistory.updateHistoryForParam(paramId, {
          result: 'unknown',
          timestamp: lastTrialErrorTime.valueOf(),
        });
      } else {
        await this.healthHistory.updateHistoryForParam(paramId, {
          result: await param.getHealthStatus(),
          timestamp: param.getLastUpdatedTime()!.valueOf(),
        });
      }
  };

  /**
   * update a param and its history
   * @param param
   */
  private updateParamAndItsHistory = async (
    param: AbstractHealthCheckParam,
  ) => {
    await param.update();
    await this.updateHistoryForParam(param);
  };

  /**
   * check all params health status and cleanup history
   */
  update = async (): Promise<void> => {
    if (this.healthHistory) this.healthHistory.cleanupHistory();
    const results = await Promise.allSettled(
      this.params.map(this.updateParamAndItsHistory),
    );
    const rejectedResults = results.filter(
      (result) => result.status == 'rejected',
    ) as PromiseRejectedResult[];
    if (rejectedResults.length) {
      throw AggregateError(
        rejectedResults.flatMap((result) => {
          if (result.reason instanceof AggregateError)
            return result.reason.errors;
          return result.reason;
        }),
      );
    }
  };

  /**
   * check health status for one param
   * @param paramId
   */
  updateParam = async (paramId: string): Promise<void> => {
    for (const param of this.params.filter(
      (item) => item.getId() === paramId,
    )) {
      await this.updateParamAndItsHistory(param);
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
   * get trial errors for all parameters
   */
  getTrialErrors = async (): Promise<string[]> => {
    const trialErrors: Array<string> = [];
    (await this.getHealthStatus()).map((item) => {
      if (item.lastTrialErrorMessage)
        trialErrors.push(item.lastTrialErrorMessage);
    });
    return trialErrors;
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
      lastTrialErrorMessage: param.getLastTrialErrorMessage(),
      lastTrialErrorTime: param.getLastTrialErrorTime(),
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
