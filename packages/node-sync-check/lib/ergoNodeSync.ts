import ergoNodeClientFactory from '@rosen-clients/ergo-node';
import {
  AbstractHealthCheckParam,
  HealthStatusLevel,
} from '@rosen-bridge/health-check';

class ErgoNodeSyncHealthCheckParam extends AbstractHealthCheckParam {
  protected maxHeightDifference: number; // maximum difference between header height and full height
  protected maxBlockTime: number; // maximum time to see  a new block in minutes
  protected minPeerCount: number; // minimum recommended peers
  protected maxPeerHeightDifference: number; // maximum difference between peers and our node
  protected nodeApi;
  protected nodeHeightDifference: number;
  protected nodeLastBlockTime: number;
  protected nodePeerCount: number;
  protected nodePeerHeightDifference: number;

  constructor(
    maxHeightDifference: number,
    maxBlockTimeInMinute: number,
    minPeerCount: number,
    minPeerHeightDiff: number,
    nodeUrl: string,
  ) {
    super();
    this.maxHeightDifference = maxHeightDifference;
    this.maxBlockTime = maxBlockTimeInMinute;
    this.minPeerCount = minPeerCount;
    this.maxPeerHeightDifference = minPeerHeightDiff;
    this.nodeApi = ergoNodeClientFactory(nodeUrl);
  }

  /**
   * generate a unique id for node sync
   * @returns parameter id
   */
  getId = (): string => {
    return `ergo_node_sync`;
  };

  /**
   * generate a unique title
   * @returns parameter title
   */
  getTitle = async () => {
    return `Ergo Node Sync`;
  };

  /**
   * generate description
   * @returns parameter description
   */
  getDescription = async () => {
    return `Checks if the specified Ergo Node is synced by comparing the scanned headers vs full blocks, the last scanned block time, and the connected peers.`;
  };

  /**
   * adds required notifications based on each condition
   * @returns parameter health description
   */
  getDetails = async (): Promise<string | undefined> => {
    let notification;
    const healthStatus = await this.getHealthStatus();
    if (healthStatus === HealthStatusLevel.UNSTABLE) {
      notification = `Service is unstable since the Ergo node has some issues.\n`;
    } else if (healthStatus === HealthStatusLevel.BROKEN) {
      notification = `Service has stopped working correctly since the Ergo node is out of sync.\n`;
    }
    if (this.nodeHeightDifference > this.maxHeightDifference) {
      notification =
        notification +
        `${this.nodeHeightDifference} block headers are scanned but the full block data is still not available.\n`;
    }
    if (this.nodeLastBlockTime > this.maxBlockTime) {
      let time;
      if (this.nodeLastBlockTime >= 60) {
        time = `${Math.floor(this.nodeLastBlockTime / 60)} hour and ${Math.floor(
          this.nodeLastBlockTime % 60,
        )} minutes`;
      } else time = `${Math.floor(this.nodeLastBlockTime)} minutes`;
      notification = notification + `The last block is scanned ${time} ago.\n`;
    }
    if (this.nodePeerCount < this.minPeerCount) {
      notification =
        notification +
        `The node is connected to ${this.nodePeerCount} peers, while the recommended stable peers is ${this.minPeerCount}.\n`;
    }
    if (this.nodePeerHeightDifference > this.maxPeerHeightDifference) {
      notification =
        notification +
        `The connected peers are ${this.nodePeerHeightDifference} blocks ahead of yours.\n`;
    }
    return notification;
  };

  /**
   * Updates the node sync health status
   */
  updateStatus = async () => {
    const nodeInfo = await this.nodeApi.getNodeInfo();
    if (!nodeInfo.headersHeight || !nodeInfo.fullHeight) {
      throw new Error(
        "Node info api response format is not correct, header height or full height doesn't exist",
      );
    }
    this.nodeHeightDifference = Number(
      nodeInfo.headersHeight - nodeInfo.fullHeight,
    );
    this.nodeLastBlockTime =
      (Date.now() -
        Number((await this.nodeApi.getLastHeaders(1))[0].timestamp)) /
      60000; // Convert millisecond to minute
    this.nodePeerCount = (await this.nodeApi.getConnectedPeers()).length;
    const maxPeerHeight = (await this.nodeApi.getPeersSyncInfo()).reduce(
      (max, info) => {
        return Math.max(Number(info.height), max);
      },
      0,
    );
    this.nodePeerHeightDifference = maxPeerHeight - Number(nodeInfo.fullHeight);
  };

  /**
   * Service is unstable if each of the conditions is true,
   * and is out of sync (Broken) if at least 3 conditions happened
   * @returns node sync health status
   */
  getHealthStatus = async (): Promise<HealthStatusLevel> => {
    const nodeCondition =
      Number(this.nodeHeightDifference > this.maxHeightDifference) +
      Number(this.nodeLastBlockTime > this.maxBlockTime) +
      Number(this.nodePeerCount < this.minPeerCount) +
      Number(this.nodePeerHeightDifference > this.maxPeerHeightDifference);
    if (nodeCondition >= 3) return HealthStatusLevel.BROKEN;
    else if (nodeCondition >= 1) return HealthStatusLevel.UNSTABLE;
    else return HealthStatusLevel.HEALTHY;
  };
}

export { ErgoNodeSyncHealthCheckParam };
