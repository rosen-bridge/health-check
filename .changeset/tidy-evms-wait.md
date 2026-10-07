---
'@rosen-bridge/asset-check': patch
---

Fix the EVM RPC asset check timeout being silently ignored: build the provider from a `FetchRequest` carrying the configured timeout instead of assigning it to the discarded `_getConnection()` clone
