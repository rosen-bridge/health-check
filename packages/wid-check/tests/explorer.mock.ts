import * as wasm from 'ergo-lib-wasm-nodejs';
import { vitest } from 'vitest';

/**
 * @returns a mocked balance api function including a wid
 */
export const mockedBalanceWithWid = (wid: string) => {
  const mockedBalanaceFunc = vitest.fn();
  mockedBalanaceFunc.mockReturnValue({
    tokens: [
      {
        tokenId:
          '10278c102bf890fdab8ef5111e94053c90b3541bc25b0de2ee8aa6305ccec3de',
        amount: 81072,
      },
      {
        tokenId: wid,
        amount: 1,
      },
    ],
  });
  return mockedBalanaceFunc;
};

/**
 * @param repoNft
 * @returns a mocked repo box with correct nft and registrt value
 */
export const mockedCollateralBox = (awcNft: string, wid: string) => {
  return {
    assets: [
      {
        tokenId: awcNft,
        amount: 1n,
      },
    ],
    additionalRegisters: {
      R4: {
        serializedValue: Buffer.from(
          wasm.Constant.from_byte_array(
            Buffer.from(wid, 'hex'),
          ).sigma_serialize_bytes(),
        ).toString('hex'),
      },
    },
  };
};
