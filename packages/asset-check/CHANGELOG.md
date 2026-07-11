# @rosen-bridge/asset-check

## 6.2.2

### Patch Changes

- Update dependencies
  - @rosen-clients/cardano-koios@3.1.3
  - @rosen-clients/ergo-explorer@2.1.3
  - @rosen-clients/ergo-node@3.1.3
  - @rosen-clients/rate-limited-axios@2.0.1

## 6.2.1

### Patch Changes

- Update dependencies
  - @rosen-clients/cardano-koios@3.1.2
  - @rosen-clients/ergo-explorer@2.1.2
  - @rosen-clients/ergo-node@3.1.2
  - @rosen-clients/rate-limited-axios@2.0.0

## 6.2.0

### Minor Changes

- Add Handshake asset check health parameter

## 6.1.0

### Minor Changes

- Add Firo asset check health parameter

### Patch Changes

- Update dependencies

  - ethers@6.16.0

## 6.0.1

### Patch Changes

- Update dependencies
  - @rosen-bridge/abstract-logger@4.0.0

## 6.0.0

### Major Changes

- Update node js to 22.18.0

### Minor Changes

- Now using @rosen-clients/rate-limited-axios instead of @rosen-bridge/rate-limited-axios

### Patch Changes

- Fix package-lock.json
- Update dependencies
  - @rosen-clients/cardano-koios@^3.1.0
  - @rosen-clients/rate-limited-axios@^1.1.0
  - @rosen-bridge/abstract-notification@^1.0.0
  - @rosen-bridge/abstract-logger@^3.0.1
  - @rosen-bridge/callback-logger@^1.0.1
  - @rosen-clients/ergo-explorer@^2.1.0
  - @rosen-clients/ergo-node@^3.1.0
  - @rosen-bridge/health-check@8.0.0

## 5.0.2

### Patch Changes

- Update package license to MIT
- Update dependencies
  - @rosen-bridge/health-check@7.0.1

## 5.0.1

### Patch Changes

- Downgrade ethers version

## 5.0.0

### Major Changes

- All interfaces like getTitle, getDescription, getDetails and hetHealthStatus were made synchronous

### Patch Changes

- Update ergo and cardano clients
- Export doge related things in the @rosen-bridge/asset-check
- Update dependencies
  - @rosen-bridge/health-check@7.0.0

## 4.0.0

### Major Changes

- Add `chain` argument to AbstractAssetHealthCheckParam, EsploraAssetHealthCheckParam, and EvmRpcAssetHealthCheckParam

### Patch Changes

- Update koios client to latest available version
- Use rate limiting methods using @rosen-bridge/rate-limited-axios to prevent overwhelming the endpoints

## 3.1.0

### Minor Changes

- Add support for BlockCypher

## 3.0.0

### Major Changes

- Add support for Doge in the EsploraAssetHealthCheckParam class

## 2.0.1

### Patch Changes

- Update `blockfrost-js` package version

## 2.0.0

### Major Changes

- Change EthereumRpcAssetHealthCheckParam to EvmRpcAssetHealthCheckParam to be a general health parameter for all evm chains

### Patch Changes

- Updated dependencies
  - @rosen-bridge/health-check@6.0.4

## 1.0.4

### Patch Changes

- Updated dependencies
  - @rosen-bridge/health-check@6.0.3

## 1.0.3

### Patch Changes

- Trim leading zeros after decimal point in messages
- Updated dependencies
  - @rosen-bridge/health-check@6.0.2

## 1.0.2

### Patch Changes

- Set tokenAmount initial value to avoid startup errors

## 1.0.1

### Patch Changes

- Updated dependencies
  - @rosen-bridge/health-check@6.0.1

## 1.0.0

### Major Changes

- Update parameter structure to be compatible with AbstractHealthParameter

### Minor Changes

- Add Ethereum asset check health parameter

### Patch Changes

- Update messages to be user friendly
- Updated dependencies
  - @rosen-bridge/health-check@6.0.0

## 0.2.1

### Patch Changes

- Add Bitcoin as a native asset

## 0.2.0

### Minor Changes

- Initialize monorepo for health check service
- Add bitcoin esplora asset health check

### Patch Changes

- Updated dependencies
  - @rosen-bridge/health-check@5.0.0
