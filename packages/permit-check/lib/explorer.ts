import ergoExplorerClientFactory from '@rosen-clients/ergo-explorer';
import * as wasm from 'ergo-lib-wasm-nodejs';

import { AbstractPermitHealthCheckParam } from './abstract';

class ExplorerPermitHealthCheckParam extends AbstractPermitHealthCheckParam {
  private explorerApi;
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
    this.explorerApi = ergoExplorerClientFactory(networkUrl);
  }

  /**
   * updates the report permit health status
   */
  updateStatus = async () => {
    let RWTCount = 0n;
    let total,
      offset = 0;
    do {
      const boxes = await this.explorerApi.v1.getApiV1BoxesUnspentByaddressP1(
        this.permitAddress,
        { offset: offset, limit: this.API_REQUEST_LIMIT },
      );

      boxes.items?.forEach((box) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const R4 = (box as any).additionalRegisters['R4'];
        if (
          R4 &&
          Buffer.from(
            wasm.Constant.decode_from_base16(
              R4.serializedValue,
            ).to_byte_array(),
          ).toString('hex') === this.WID
        ) {
          RWTCount +=
            box.assets?.find((token) => token.tokenId === this.RWT)?.amount ??
            0n;
        }
      });

      total = boxes.total ?? 0n;
      offset += this.API_REQUEST_LIMIT;
    } while (offset < total);
    this.reportsCount = RWTCount / this.rwtPerCommitment;
  };
}

export { ExplorerPermitHealthCheckParam };
