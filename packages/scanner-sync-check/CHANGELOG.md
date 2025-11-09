# @rosen-bridge/scanner-sync-check

## 8.1.0

### Minor Changes

- Add LastSavedBlock to the scanner-sync-check package's exports.

## 8.0.0

### Major Changes

- Update node js to 22.18.0

### Minor Changes

- Consider scanner update interval when updating status

### Patch Changes

- Fix last block gap calculations
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

## 7.0.1

### Patch Changes

- Update package license to MIT
- Update dependencies
  - @rosen-bridge/health-check@7.0.1

## 7.0.0

### Major Changes

- Add timestamp check to scanner-sync

## 6.0.0

### Major Changes

- United all scanner-sync-check Health Check classes except ogmios

## 5.0.0

### Major Changes

- All interfaces like getTitle, getDescription, getDetails and hetHealthStatus were made synchronous

### Patch Changes

- Fix `getLastSavedBlockMessage` to use `this.chain`
- Update dependencies
  - @rosen-bridge/health-check@7.0.0

## 4.0.1

### Patch Changes

- Fix `getLastNetworkHeight` interface to be compatible with scanner

## 4.0.0

### Major Changes

- Use dynamic chain name for bitcoin health-check parameter
- Network height is now obtained through a function provided to subclasses of AbstractScannerSyncHealthCheckParam. The only exception to this approach is the CardanoOgmiosScannerHealthCheck class, which handles it differently.

## 3.0.0

### Major Changes

- Add block delay check to scanner sync health parameters

### Patch Changes

- Update `blockfrost-js` package version
- Fix scanner sync description not to throw error in scanner startup

## 2.0.0

### Major Changes

- Change EthereumRPCScannerHealthCheck to EvmRPCScannerHealthCheck to be a general health parameter for all evm chains

### Patch Changes

- Fix unstable error message and unstable time window variable
- Updated dependencies
  - @rosen-bridge/health-check@6.0.4

## 1.0.3

### Patch Changes

- Close ogmios connection after usage
- Updated dependencies
  - @rosen-bridge/health-check@6.0.3

## 1.0.2

### Patch Changes

- Updated dependencies
  - @rosen-bridge/health-check@6.0.2

## 1.0.1

### Patch Changes

- Updated dependencies
  - @rosen-bridge/health-check@6.0.1

## 1.0.0

### Major Changes

- Remove direct database connection and receive last saved block from the passed function in constructor
- Update parameter structure to be compatible with AbstractHealthParameter

### Minor Changes

- Add Ethereum rpc scanner sync check parameter
- Check Ogmios client connection when reporting scanner sync health status

### Patch Changes

- Update messages to be user friendly
- Updated dependencies
  - @rosen-bridge/health-check@6.0.0

## 0.3.0

### Minor Changes

- Add authentication to bitcoin rpc connection

## 0.2.0

### Minor Changes

- Add RPC scanner sync check parameter for Bitcoin chain.
- Add bitcoin esplora scanner health check

### Patch Changes

- Updated dependencies
  - @rosen-bridge/health-check@5.0.0
