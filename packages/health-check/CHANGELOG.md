# @rosen-bridge/health-check

## 6.0.4

### Patch Changes

- Remove isStillUnhealthy check
- Make `isBroken` check to return true if all history items are non-notified broken items

## 6.0.3

### Patch Changes

- Fix issue in health check health history cleanup threshold value

## 6.0.2

### Patch Changes

- Use Prmise.allSettled to check all promises and return an aggregated error

## 6.0.1

### Patch Changes

- Update notify to be an optional constructor parameter

## 6.0.0

### Major Changes

- Update abstract health-check parameter class to include param details and trial error messages
- Notify about different health events (if any) whenever health status of any param is updated

## 5.0.0

### Major Changes

- Extract all parameters into individual packages.

## 4.0.4

### Patch Changes

- Update cardano graphql httplink import to fix unit test errors

## 4.0.3

### Patch Changes

- Update scanner version

## 4.0.2

### Patch Changes

- Update ergo explorer and node clients
- Update scanner and cardano ogmios client

## 4.0.1

### Patch Changes

- Update typeorm version

## 4.0.0

### Major Changes

- Update wid and permit health check parameters to be compatible with latest contract changes
