import {
  AbstractHealthCheckParam,
  HealthStatusLevel,
} from '@rosen-bridge/health-check';

export interface P2PNetworkHealthCheckOptions {
  defectConfirmationTimeWindow: number;
  connectedGuardsHealthyThreshold: number;
  getConnectedGuards: () => number;
  getIsAtLeastOneRelayConnected: () => boolean;
}

export class P2PNetworkHealthCheck extends AbstractHealthCheckParam {
  private readonly defectConfirmationTimeWindow!: number; // time window (in seconds) after which a defect is confirmed and status is updated
  private readonly connectedGuardsHealthyThreshold!: number; // minimum number of connected guards for a healthy status
  private readonly getConnectedGuards!: () => number; // a callback used to get current connected guards
  private readonly getIsAtLeastOneRelayConnected: () => boolean; // a callback used to get current relay connection status

  private status = HealthStatusLevel.HEALTHY; // current health status

  private lastDefectTimestamp: number | undefined; // the last time a defect (relay disconnection or insufficient connected guards) was detected

  protected connectedGuards: number;
  protected isAtLeastOneRelayConnected: boolean;

  constructor({
    defectConfirmationTimeWindow,
    connectedGuardsHealthyThreshold,
    getConnectedGuards,
    getIsAtLeastOneRelayConnected,
  }: P2PNetworkHealthCheckOptions) {
    super();

    this.defectConfirmationTimeWindow = defectConfirmationTimeWindow;
    this.connectedGuardsHealthyThreshold = connectedGuardsHealthyThreshold;
    this.getConnectedGuards = getConnectedGuards;
    this.getIsAtLeastOneRelayConnected = getIsAtLeastOneRelayConnected;
  }

  /**
   * get health check parameter id
   */
  getId = () => 'P2P';

  /**
   * get health check parameter title
   */
  getTitle = async () => 'P2P Network';

  /**
   * get health check parameter description
   */
  getDescription = async () =>
    `P2P network connection status, currently connected to ${this.connectedGuards} guards.`;

  /**
   * update health status for this param if needed (based on the scenario
   * described in comments)
   */
  updateStatus = () => {
    const now = new Date();
    const nowTimestamp = now.getTime();

    this.connectedGuards = this.getConnectedGuards();
    this.isAtLeastOneRelayConnected = this.getIsAtLeastOneRelayConnected();

    const guardsPercentCheckPassed =
      this.connectedGuards >= this.connectedGuardsHealthyThreshold;
    const relayConnectionCheckPassed = this.isAtLeastOneRelayConnected;

    // if everything is ok, reset all state to normal and return
    if (guardsPercentCheckPassed && relayConnectionCheckPassed) {
      this.lastDefectTimestamp = undefined;
      this.status = HealthStatusLevel.HEALTHY;
      return;
    }

    // if there is a new defect, save its timestamp and return
    if (!this.lastDefectTimestamp) {
      this.lastDefectTimestamp = nowTimestamp;
      return;
    }

    // if there is some defect within defect confirmation time window, do nothing
    if (
      nowTimestamp <
      this.lastDefectTimestamp + this.defectConfirmationTimeWindow
    ) {
      return;
    }

    // if there is still some defect present after defect confirmation time window, update status to broken
    this.status = HealthStatusLevel.BROKEN;
  };

  /**
   * get health status for this param
   */
  getHealthStatus = async () => {
    return this.status;
  };

  /**
   * get health details for this param or undefined if status is healthy
   */
  getDetails = async () => {
    if (this.status === HealthStatusLevel.HEALTHY) {
      return undefined;
    }

    if (!this.isAtLeastOneRelayConnected) {
      return 'Not connected to any relay. Please check the relay address and your connection.';
    }

    return `Connected to only ${this.connectedGuards} guards. At least ${this.connectedGuardsHealthyThreshold} connections is required. Please check the connection.`;
  };
}
