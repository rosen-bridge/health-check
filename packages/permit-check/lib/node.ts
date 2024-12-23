import ergoNodeClientFactory from '@rosen-clients/ergo-node';
import * as wasm from 'ergo-lib-wasm-nodejs';

import { AbstractPermitHealthCheckParam } from './abstract';

class NodePermitHealthCheckParam extends AbstractPermitHealthCheckParam {
  private nodeApi;
  private API_REQUEST_LIMIT = 100;

  constructor(
    RWT: string,
    permitAddress: string,
    WID: string,
    warnThreshold: bigint,
    criticalThreshold: bigint,
    networkUrl: string,
    rwtPerCommitment: bigint,
  ) {
    super(
      RWT,
      permitAddress,
      WID,
      warnThreshold,
      criticalThreshold,
      rwtPerCommitment,
    );
    this.nodeApi = ergoNodeClientFactory(networkUrl);
  }

  /**
   * update the report permit health status
   */
  updateStatus = async () => {
    let RWTCount = 0n;
    let boxes = [],
      offset = 0;
    do {
      boxes = await this.nodeApi.getBoxesByAddressUnspent(this.permitAddress, {
        offset: offset,
        limit: this.API_REQUEST_LIMIT,
      });

      boxes.forEach((box) => {
        /**
         * TODO: remove extra filter (local:ergo/rosen-bridge/health-check/-/issues/43)
         * The getBoxesByAddressUnspent node API has issues: it returns not only
         * unspent boxes for the specified address but also unrelated boxes from
         * different addresses
         * This filter is added to ensure such boxes do not interfere with the
         * results
         */
        if (
          box.address == this.permitAddress &&
          box.spentTransactionId == null
        ) {
          const R4 = box.additionalRegisters['R4'];
          if (
            R4 &&
            Buffer.from(
              wasm.Constant.decode_from_base16(R4).to_byte_array(),
            ).toString('hex') === this.WID
          ) {
            RWTCount +=
              box.assets?.find((token) => token.tokenId === this.RWT)?.amount ??
              0n;
          }
        }
      });

      offset += this.API_REQUEST_LIMIT;
    } while (boxes.length > 0);

    this.reportsCount = RWTCount / this.rwtPerCommitment;
  };
}

export { NodePermitHealthCheckParam };
