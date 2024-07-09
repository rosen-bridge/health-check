import { NotificationSeverity } from '@rosen-bridge/abstract-notification';

import { ParamHistory } from '../history/types';
import { AbstractHealthCheckParam } from '../abstractHealthCheckParam';

export interface NotificationCheck {
  id: string;
  /**
   * notifications of this check will be sent with this severity
   */
  severity: NotificationSeverity;
  /**
   * check if a notification should be sent based on the history
   * @param history
   */
  check: (history: ParamHistory) => boolean;
  /**
   * get title for the notification to be sent
   * @param param
   */
  getTitle: (param: AbstractHealthCheckParam) => Promise<string>;
  /**
   * get description for the notification to be sent
   * @param param
   */
  getDescription: (param: AbstractHealthCheckParam) => Promise<string>;
}
