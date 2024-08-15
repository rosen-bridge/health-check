# @rosen-bridge/scanner-sync-check

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
- add bitcoin esplora scanner health check

### Patch Changes

- Updated dependencies
  - @rosen-bridge/health-check@5.0.0
